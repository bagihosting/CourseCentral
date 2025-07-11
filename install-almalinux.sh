#!/bin/bash
#
# =================================================================
# Autoinstaller Cerdas & Andal untuk Aplikasi Next.js
# Distro: AlmaLinux 8 / RHEL 8
# Fokus: Nginx, MariaDB, Node.js v20, PM2, Fail2Ban, Backup Otomatis.
# Dirancang untuk keandalan, keamanan, dan fungsionalitas produksi.
# =================================================================

# --- Berhenti jika ada kesalahan ---
set -e

# --- Konfigurasi & Variabel Inti ---
APP_PORT=3000
APP_NAME="coursecentral"
RUN_USER=${SUDO_USER:-$(logname)}
PROJECT_DIR=$(pwd)
DB_NAME="coursecentral_db"
DB_USER="coursecentral_user"
# Menggunakan karakter yang lebih aman untuk kata sandi yang disisipkan ke command line
DB_PASS=$(openssl rand -hex 12)
ROOT_DB_PASS=$(openssl rand -hex 12)
SERVER_IP=$(hostname -I | awk '{print $1}')

# --- Fungsi Bantuan untuk Logging ---
echo_info() { echo -e "\033[1;34m[INFO]\033[0m $1"; }
echo_success() { echo -e "\033[1;32m[SUCCESS]\033[0m $1"; }
echo_error() { echo -e "\033[1;31m[ERROR]\033[0m $1"; }
echo_warning() { echo -e "\033[1;33m[WARNING]\033[0m $1"; }

# --- Verifikasi Awal ---
if [ "$(id -u)" -ne 0 ]; then
  echo_error "Skrip ini harus dijalankan dengan 'sudo'. Contoh: 'sudo ./install-almalinux.sh'"
  exit 1
fi
if [ ! -f "$PROJECT_DIR/schema.sql" ]; then
    echo_error "File 'schema.sql' tidak ditemukan. Pastikan Anda menjalankan skrip ini dari dalam direktori utama proyek."
    exit 1
fi

if ! grep -qiE "AlmaLinux" /etc/redhat-release; then
    echo_warning "Skrip ini dioptimalkan untuk AlmaLinux 8. Hasil di distro RHEL lain mungkin bervariasi."
fi

echo_info "Memulai instalasi cerdas untuk '$APP_NAME' di AlmaLinux 8..."

# --- 1. Pemasangan Dependensi Inti & Keamanan ---
echo_info "Mengaktifkan modul Node.js 20 dan menginstal dependensi..."
sudo dnf module enable nodejs:20 -y
sudo dnf install -y nginx nodejs mariadb-server mariadb curl fail2ban policycoreutils-python-utils

# Konfigurasi FirewallD
echo_info "Mengkonfigurasi firewall untuk mengizinkan HTTP, HTTPS, dan SSH..."
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload
echo_success "Firewall dikonfigurasi."

# Konfigurasi Fail2Ban
echo_info "Mengaktifkan proteksi Fail2Ban untuk SSH..."
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo sed -i '/^\[sshd\]/a enabled = true' /etc/fail2ban/jail.local
sudo systemctl enable --now fail2ban
echo_success "Fail2Ban aktif dan memonitor SSH."

# --- 2. Setup Database MariaDB (Metode Andal & Non-Interaktif) ---
echo_info "Memastikan layanan MariaDB berjalan..."
sudo systemctl enable --now mariadb

echo_info "Mengamankan MariaDB dan membuat pengguna aplikasi..."
# Menjalankan semua perintah keamanan dan pembuatan database secara non-interaktif
sudo mysql -u root --execute="
  -- Mengamankan instalasi
  UPDATE mysql.user SET Password=PASSWORD('${ROOT_DB_PASS}') WHERE User='root';
  DELETE FROM mysql.user WHERE User='';
  DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
  DROP DATABASE IF EXISTS test;
  DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';

  -- Membuat database dan pengguna aplikasi
  CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
  GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';
  
  -- Menerapkan semua perubahan
  FLUSH PRIVILEGES;
"
echo_success "Database '$DB_NAME' dan pengguna '$DB_USER' berhasil dibuat dan diamankan."

# --- 3. Impor Skema & Data Awal (Metode Aman) ---
echo_info "Mengimpor data dari 'schema.sql'..."
# Buat file cnf sementara untuk otentikasi yang lebih andal
cat > /tmp/mariadb.cnf <<EOF
[client]
user = ${DB_USER}
password = ${DB_PASS}
EOF
# Impor menggunakan file cnf sementara
sudo mysql --defaults-extra-file=/tmp/mariadb.cnf "${DB_NAME}" < "$PROJECT_DIR/schema.sql"
# Hapus file cnf sementara dengan aman
sudo rm -f /tmp/mariadb.cnf
echo_success "Struktur database dan data awal berhasil diimpor."


# --- 4. Pasang PM2 ---
echo_info "Memasang PM2 secara global..."
sudo npm install -g pm2

# --- 5. Bangun Aplikasi (Sebagai Pengguna Non-Root) ---
echo_info "Mengatur kepemilikan file proyek ke pengguna '$RUN_USER'..."
sudo chown -R $RUN_USER:$RUN_USER "$PROJECT_DIR"

echo_info "Memasang dependensi proyek (menjalankan sebagai '$RUN_USER')..."
sudo -u "$RUN_USER" bash -c "cd \"$PROJECT_DIR\" && npm install"

echo_info "Membangun aplikasi Next.js untuk produksi (menjalankan sebagai '$RUN_USER')..."
sudo -u "$RUN_USER" bash -c "cd \"$PROJECT_DIR\" && npm run build"

# --- 6. Siapkan Variabel Lingkungan & Backup Otomatis ---
echo_info "Membuat file .env.local dengan kredensial..."
ENV_FILE="$PROJECT_DIR/.env.local"
cat > "$ENV_FILE" << EOF
GEMINI_API_KEY="PASTE_YOUR_GEMINI_API_KEY_HERE"
DB_HOST="127.0.0.1"
DB_PORT="3306"
DB_USER="$DB_USER"
DB_PASSWORD="$DB_PASS"
DB_NAME="$DB_NAME"
NEXT_PUBLIC_BASE_URL="http://${SERVER_IP}"
EOF
sudo chown $RUN_USER:$RUN_USER "$ENV_FILE"

echo_info "Mengatur backup database otomatis harian via cron..."
BACKUP_SCRIPT="/usr/local/bin/backup-mariadb.sh"
sudo tee "$BACKUP_SCRIPT" > /dev/null << EOF
#!/bin/bash
DB_USER="$DB_USER"
DB_PASSWORD="$DB_PASS"
DB_NAME="$DB_NAME"
BACKUP_DIR="/var/backups/mariadb"
mkdir -p \$BACKUP_DIR
DATE=\$(date +"%Y-%m-%d_%H%M%S")
mysqldump --user=\$DB_USER --password=\$DB_PASSWORD \$DB_NAME | gzip > \$BACKUP_DIR/\$DB_NAME-\$DATE.sql.gz
find \$BACKUP_DIR -type f -name "*.sql.gz" -mtime +7 -delete
EOF
sudo chmod +x "$BACKUP_SCRIPT"
# Menambahkan cron job jika belum ada
(sudo crontab -l 2>/dev/null | grep -Fq "$BACKUP_SCRIPT") || (sudo crontab -l 2>/dev/null; echo "30 2 * * * $BACKUP_SCRIPT") | sudo crontab -

# --- 7. Jalankan Aplikasi dengan PM2 (Sebagai Pengguna Non-Root) ---
echo_info "Menjalankan aplikasi '$APP_NAME' dengan PM2..."
PM2_PATH=$(which pm2)
sudo -u "$RUN_USER" "$PM2_PATH" delete "$APP_NAME" || true
sudo -u "$RUN_USER" bash -c "cd \"$PROJECT_DIR\" && \"$PM2_PATH\" start npm --name \"$APP_NAME\" -- start"
sudo -u "$RUN_USER" "$PM2_PATH" save
sudo env PATH=$PATH:/usr/bin "$PM2_PATH" startup -u "$RUN_USER" --hp "/home/$RUN_USER"

# --- 8. Konfigurasi Nginx (Reverse Proxy) & SELinux ---
echo_info "Mengkonfigurasi Nginx..."
NGINX_CONFIG="/etc/nginx/conf.d/$APP_NAME.conf"

sudo tee "$NGINX_CONFIG" > /dev/null << EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${SERVER_IP} _;

    location / {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$server_name;
    }
}
EOF
echo_info "Mengizinkan Nginx untuk bertindak sebagai reverse proxy melalui SELinux..."
sudo setsebool -P httpd_can_network_connect 1
sudo systemctl enable --now nginx
sudo nginx -t && sudo systemctl restart nginx

# --- Selesai ---
echo ""
echo_success "================= PROSES INSTALASI SELESAI ================="
echo ""
echo_info "AKSES APLIKASI ANDA:"
echo "  - Aplikasi Utama: http://${SERVER_IP}"
echo ""
echo_info "LANGKAH PENTING SELANJUTNYA:"
echo "  1. Edit file '$ENV_FILE' untuk menambahkan GEMINI_API_KEY Anda."
echo "     (Gunakan: sudo nano .env.local)"
echo "  2. Jika menggunakan domain, ganti NEXT_PUBLIC_BASE_URL di file yang sama dan di konfigurasi Nginx."
echo "  3. (Sangat Disarankan) Konfigurasi domain Anda dengan Cloudflare untuk keamanan dan HTTPS."
echo ""
echo_info "INFORMASI KREDENSIAL (SIMPAN DI TEMPAT AMAN):"
echo_success "  - Database Root Pass : $ROOT_DB_PASS"
echo_success "  - Database Name      : $DB_NAME"
echo_success "  - Database User      : $DB_USER"
echo_success "  - Database Pass      : $DB_PASS"
echo ""
echo_info "Backup database harian telah diatur."
sudo systemctl status mariadb.service --no-pager
echo_success "Deployment di AlmaLinux 8 selesai!"
