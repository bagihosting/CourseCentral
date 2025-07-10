#!/bin/bash
#
# =================================================================
# Autoinstaller Cerdas & Andal untuk Aplikasi Next.js
# Distro: Debian 11/12 & Ubuntu 20.04/22.04/24.04
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
PMA_ROOT_PASS=$(openssl rand -hex 12)
SERVER_IP=$(hostname -I | awk '{print $1}')

# --- Fungsi Bantuan untuk Logging ---
echo_info() { echo -e "\033[1;34m[INFO]\033[0m $1"; }
echo_success() { echo -e "\033[1;32m[SUCCESS]\033[0m $1"; }
echo_error() { echo -e "\033[1;31m[ERROR]\033[0m $1"; }
echo_warning() { echo -e "\033[1;33m[WARNING]\033[0m $1"; }


# --- Verifikasi Awal ---
if [ "$(id -u)" -ne 0 ]; then
  echo_error "Skrip ini harus dijalankan dengan 'sudo'. Contoh: 'sudo ./install.sh'"
  exit 1
fi
if [ ! -f "$PROJECT_DIR/schema.sql" ]; then
    echo_error "File 'schema.sql' tidak ditemukan. Pastikan Anda menjalankan skrip ini dari dalam direktori utama proyek."
    exit 1
fi

# Cek Distribusi (Debian/Ubuntu)
if ! grep -qiE "debian|ubuntu" /etc/os-release; then
    echo_warning "Skrip ini dioptimalkan untuk Debian dan Ubuntu. Hasil di distro lain mungkin bervariasi."
fi

echo_info "Memulai instalasi cerdas untuk '$APP_NAME'..."

# --- BLOK PEMULIHAN SISTEM OTOMATIS (DPKG/APT REPAIR) ---
echo_info "Memastikan integritas manajer paket (dpkg/apt)..."
sudo rm -f /var/lib/dpkg/lock* /var/cache/apt/archives/lock &>/dev/null || true
sudo apt-get clean

# Hapus paksa paket-paket yang sering menyebabkan masalah dependensi
echo_info "Mencoba menghapus paksa paket plugin MariaDB yang mungkin rusak..."
sudo dpkg --remove --force-remove-reinstreq mariadb-plugin-provider-lz4 mariadb-plugin-provider-snappy mariadb-plugin-provider-bzip2 mariadb-plugin-provider-lzma mariadb-plugin-provider-lzo &>/dev/null || true

# Lakukan pembersihan menyeluruh
echo_info "Mencoba membersihkan instalasi MariaDB/PMA yang mungkin rusak..."
sudo apt-get purge -y 'mariadb-*' 'phpmyadmin*' &>/dev/null || echo "Pembersihan awal dilewati, melanjutkan."
sudo apt-get autoremove -y --purge

# Konfigurasi ulang dan perbaiki dependensi yang rusak
sudo dpkg --configure -a
sudo apt-get -f install -y
sudo apt-get update
echo_success "Manajer paket siap."
# --- AKHIR BLOK PEMULIHAN ---

# --- 1. Pemasangan Dependensi Inti & Keamanan ---
echo_info "Memasang dependensi: Nginx, MariaDB, Node.js, PHP, Fail2Ban..."
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y \
    nginx curl build-essential mariadb-server mariadb-client psmisc \
    php-fpm php-mysql php-mbstring php-zip php-gd php-json php-curl fail2ban

# Tindakan pencegahan: Pastikan direktori data MariaDB memiliki izin yang benar
echo_info "Memastikan kepemilikan direktori data MariaDB..."
sudo chown -R mysql:mysql /var/lib/mysql/

# Konfigurasi Fail2Ban
echo_info "Mengaktifkan proteksi Fail2Ban untuk SSH..."
sudo cat > /etc/fail2ban/jail.local << EOF
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
EOF
sudo systemctl restart fail2ban
echo_success "Fail2Ban aktif dan memonitor SSH."

# --- 2. Setup Database MariaDB (Metode Andal) ---
echo_info "Mengkonfigurasi database MariaDB..."
sudo systemctl start mariadb && sudo systemctl enable mariadb
# Menjalankan perintah SQL sebagai root untuk membuat database dan pengguna
sudo mariadb --execute="
  ALTER USER 'root'@'localhost' IDENTIFIED BY '${PMA_ROOT_PASS}';
  DELETE FROM mysql.user WHERE User='';
  DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
  DROP DATABASE IF EXISTS test;
  DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';
  CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
  GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';
  FLUSH PRIVILEGES;
"
echo_success "Database '$DB_NAME' dan pengguna '$DB_USER' berhasil dibuat."

# --- 3. Impor Skema & Data Awal (Metode Aman) ---
echo_info "Mengimpor data dari 'schema.sql'..."
# Buat file cnf sementara untuk otentikasi
cat > /tmp/mariadb.cnf <<EOF
[client]
user = ${DB_USER}
password = ${DB_PASS}
EOF
# Impor menggunakan file cnf sementara
sudo mariadb --defaults-extra-file=/tmp/mariadb.cnf "${DB_NAME}" < "$PROJECT_DIR/schema.sql"
# Hapus file cnf sementara dengan aman
sudo rm -f /tmp/mariadb.cnf
echo_success "Struktur database dan data awal berhasil diimpor."

# --- 4. Instalasi & Konfigurasi Cerdas phpMyAdmin ---
echo_info "Menginstal dan mengkonfigurasi phpMyAdmin..."
# Prakonfigurasi jawaban untuk `dpkg`
echo "phpmyadmin phpmyadmin/dbconfig-install boolean true" | sudo debconf-set-selections
echo "phpmyadmin phpmyadmin/app-password-confirm password ${PMA_ROOT_PASS}" | sudo debconf-set-selections
echo "phpmyadmin phpmyadmin/mysql/admin-pass password ${PMA_ROOT_PASS}" | sudo debconf-set-selections
echo "phpmyadmin phpmyadmin/mysql/app-pass password ${PMA_ROOT_PASS}" | sudo debconf-set-selections
echo "phpmyadmin phpmyadmin/reconfigure-webserver multiselect none" | sudo debconf-set-selections
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y phpmyadmin

# --- 5. Pasang Node.js & PM2 ---
echo_info "Memasang Node.js v20 LTS dan PM2..."
if ! command -v node &> /dev/null || [[ $(node -v) != "v20."* ]]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
    sudo apt-get install -y nodejs
fi
sudo npm install -g pm2

# --- 6. Bangun Aplikasi (Sebagai Pengguna Non-Root) ---
echo_info "Mengatur kepemilikan file proyek ke pengguna '$RUN_USER'..."
sudo chown -R $RUN_USER:$RUN_USER "$PROJECT_DIR"

echo_info "Memasang dependensi proyek (menjalankan sebagai '$RUN_USER')..."
sudo -u "$RUN_USER" bash -c "cd \"$PROJECT_DIR\" && npm install"

echo_info "Membangun aplikasi Next.js untuk produksi (menjalankan sebagai '$RUN_USER')..."
sudo -u "$RUN_USER" bash -c "cd \"$PROJECT_DIR\" && npm run build"

# --- 7. Siapkan Variabel Lingkungan & Backup Otomatis ---
echo_info "Membuat file .env.local dengan kredensial..."
ENV_FILE="$PROJECT_DIR/.env.local"
sudo cat > "$ENV_FILE" << EOF
GEMINI_API_KEY="PASTE_YOUR_GEMINI_API_KEY_HERE"
DB_HOST="127.0.0.1"
DB_PORT="3306"
DB_USER="$DB_USER"
DB_PASSWORD="$DB_PASS"
DB_NAME="$DB_NAME"
NEXT_PUBLIC_BASE_URL="http://${SERVER_IP}"
EOF
sudo chown $RUN_USER:$RUN_USER "$ENV_FILE"

echo_info "Mengatur backup database otomatis harian..."
BACKUP_SCRIPT="/usr/local/bin/backup-mariadb.sh"
sudo cat > "$BACKUP_SCRIPT" << EOF
#!/bin/bash
DB_USER="$DB_USER"
DB_PASSWORD="$DB_PASS"
DB_NAME="$DB_NAME"
BACKUP_DIR="/var/backups/mariadb"
mkdir -p \$BACKUP_DIR
DATE=\$(date +"%Y-%m-%d_%H%M%S")
mysqldump -u \$DB_USER -p\$DB_PASSWORD \$DB_NAME | gzip > \$BACKUP_DIR/\$DB_NAME-\$DATE.sql.gz
find \$BACKUP_DIR -type f -name "*.sql.gz" -mtime +7 -delete
EOF
sudo chmod +x "$BACKUP_SCRIPT"
# Menambahkan cron job jika belum ada
(sudo crontab -l 2>/dev/null | grep -Fq "$BACKUP_SCRIPT") || (sudo crontab -l 2>/dev/null; echo "30 2 * * * $BACKUP_SCRIPT") | sudo crontab -

# --- 8. Jalankan Aplikasi dengan PM2 (Sebagai Pengguna Non-Root) ---
echo_info "Menjalankan aplikasi '$APP_NAME' dengan PM2..."
PM2_PATH=$(which pm2)
sudo -u "$RUN_USER" "$PM2_PATH" delete "$APP_NAME" || true
sudo -u "$RUN_USER" bash -c "cd \"$PROJECT_DIR\" && \"$PM2_PATH\" start npm --name \"$APP_NAME\" -- start"
sudo -u "$RUN_USER" "$PM2_PATH" save
sudo env PATH=$PATH:/usr/bin "$PM2_PATH" startup -u "$RUN_USER" --hp "/home/$RUN_USER"

# --- 9. Konfigurasi Nginx (Reverse Proxy & phpMyAdmin) ---
echo_info "Mengkonfigurasi Nginx..."
NGINX_CONFIG="/etc/nginx/sites-available/$APP_NAME"

# Deteksi versi PHP yang terinstal secara dinamis
PHP_SOCK_PATH=$(find /run/php -name "php*-fpm.sock" | head -n 1)
if [ -z "$PHP_SOCK_PATH" ]; then
    echo_error "Tidak dapat menemukan socket PHP-FPM. Instalasi php-fpm mungkin gagal."
    exit 1
fi
echo_info "Socket PHP-FPM terdeteksi di: $PHP_SOCK_PATH"

sudo cat > "$NGINX_CONFIG" << EOF
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
    }

    location /phpmyadmin {
        root /usr/share/;
        index index.php index.html index.htm;
        location ~ ^/phpmyadmin/(.+\.php)\$ {
            try_files \$uri =404;
            root /usr/share/;
            fastcgi_pass unix:${PHP_SOCK_PATH};
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
            include fastcgi_params;
        }
        location ~* ^/phpmyadmin/(.+\.(jpg|jpeg|gif|css|png|js|ico|html|xml|txt))\$ {
            root /usr/share/;
        }
    }
}
EOF
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf "$NGINX_CONFIG" "/etc/nginx/sites-enabled/"
sudo nginx -t && sudo systemctl restart nginx

# --- Selesai ---
echo ""
echo_success "================= PROSES INSTALASI SELESAI ================="
echo ""
echo_info "AKSES APLIKASI ANDA:"
echo "  - Aplikasi Utama: http://${SERVER_IP}"
echo "  - phpMyAdmin    : http://${SERVER_IP}/phpmyadmin"
echo ""
echo_info "LANGKAH PENTING SELANJUTNYA:"
echo "  1. Edit file '$ENV_FILE' untuk menambahkan GEMINI_API_KEY Anda."
echo "     (Gunakan: sudo nano .env.local)"
echo "  2. Jika menggunakan domain, ganti NEXT_PUBLIC_BASE_URL di file yang sama dan di konfigurasi Nginx."
echo "  3. (Sangat Disarankan) Konfigurasi domain Anda dengan Cloudflare untuk keamanan dan HTTPS."
echo ""
echo_info "INFORMASI KREDENSIAL (SIMPAN DI TEMPAT AMAN):"
echo_success "  - Database Name : $DB_NAME"
echo_success "  - Database User : $DB_USER"
echo_success "  - Database Pass : $DB_PASS"
echo_success "  - phpMyAdmin User: root"
echo_success "  - phpMyAdmin Pass: $PMA_ROOT_PASS"
echo ""
echo_info "Backup database harian telah diatur."
sudo systemctl status mariadb.service --no-pager
echo_success "Deployment selesai!"
