
#!/bin/bash
#
# =================================================================
# Pemasang Otomatis Lengkap untuk Aplikasi Next.js di Ubuntu
# Termasuk: Nginx, MariaDB, Node.js v20, PM2, phpMyAdmin, Fail2Ban, dan Backup Otomatis.
# Versi Cerdas v3.0 - Dirancang untuk Keandalan Maksimal & Mengatasi Error dpkg.
# Untuk instruksi lengkap, silakan lihat file DEPLOYMENT.md
# =================================================================

# --- Berhenti jika ada kesalahan ---
set -e

# --- Konfigurasi ---
APP_PORT=3000
APP_NAME="coursecentral"
RUN_USER=$(logname)
PROJECT_DIR=$(pwd)

# --- Fungsi Bantuan untuk Logging ---
echo_info() { echo -e "\033[1;34m[INFO]\033[0m $1"; }
echo_success() { echo -e "\033[1;32m[SUCCESS]\033[0m $1"; }
echo_warn() { echo -e "\033[1;33m[PERINGATAN]\033[0m $1"; }
echo_error() { echo -e "\033[1;31m[ERROR]\033[0m $1"; }

# --- Verifikasi Awal ---
if [ "$(id -u)" -ne 0 ]; then
  echo_error "Skrip ini harus dijalankan sebagai root. Silakan gunakan 'sudo ./install.sh'"
  exit 1
fi

if [ ! -f "$PROJECT_DIR/schema.sql" ]; then
    echo_error "File 'schema.sql' tidak ditemukan. Pastikan Anda menjalankan skrip ini dari dalam direktori utama proyek."
    exit 1
fi

echo_info "Memulai proses instalasi lengkap untuk $APP_NAME..."

# --- 1. Pembaruan Sistem dan Pra-Pembersihan Paket (Metode Anti-Gagal dpkg) ---
echo_info "Memperbarui sistem dan melakukan pra-pembersihan paket..."
apt-get update
# [PERBAIKAN DPKG] Membersihkan cache paket yang diunduh
apt-get clean
# [PERBAIKAN DPKG] Hapus total phpmyadmin jika ada instalasi yang rusak/gagal sebelumnya
apt-get purge -y phpmyadmin || true
# [PERBAIKAN DPKG] Secara proaktif memperbaiki paket yang rusak
apt-get --fix-broken install -y
apt-get autoremove -y
# [PERBAIKAN DPKG] Secara paksa mengkonfigurasi ulang paket yang mungkin tertunda
dpkg --configure -a

echo_info "Memasang dependensi inti..."
DEBIAN_FRONTEND=noninteractive apt-get install -y \
    nginx curl build-essential mariadb-server mariadb-client psmisc \
    fail2ban unzip debconf-utils

# --- 2. Setup Database MariaDB (Metode Andal) ---
echo_info "Mengkonfigurasi database MariaDB..."
systemctl stop mariadb || true
if [ ! -d "/var/lib/mysql/mysql" ]; then
  echo_info "Melakukan inisialisasi direktori data MariaDB..."
  mariadb-install-db --user=mysql --basedir=/usr --datadir=/var/lib/mysql
  echo_success "Inisialisasi direktori data MariaDB selesai."
fi
systemctl start mariadb
systemctl enable mariadb

echo_info "Memberi waktu 5 detik bagi MariaDB untuk melakukan inisialisasi penuh..."
sleep 5

DB_NAME="coursecentral_db"
DB_USER="coursecentral_user"
DB_PASS=$(openssl rand -base64 12)
DB_ROOT_PASS=$(openssl rand -base64 16)

echo_info "Mengamankan pengguna root MariaDB..."
mariadb-admin -u root password "$DB_ROOT_PASS"
echo_success "Kata sandi root MariaDB berhasil diatur."

echo_info "Membuat database dan pengguna aplikasi..."
mariadb -u root -p"$DB_ROOT_PASS" --batch <<-EOSQL
  DROP USER IF EXISTS ''@'localhost';
  DROP DATABASE IF EXISTS test;
  CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';
  GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '$DB_USER'@'localhost';
  FLUSH PRIVILEGES;
EOSQL
echo_success "Database '$DB_NAME' dan pengguna '$DB_USER' berhasil dibuat."

# --- 3. Impor Skema Database ---
echo_info "Mengimpor data dari 'schema.sql'..."
mariadb -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$PROJECT_DIR/schema.sql"
echo_success "Struktur database dan data awal berhasil diimpor."

# --- 4. Pasang Node.js & PM2 ---
echo_info "Memasang Node.js v20 LTS dan PM2..."
if ! command -v node &> /dev/null || [[ $(node -v) != "v20."* ]]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
npm install -g pm2

# --- 5. Bangun Aplikasi ---
echo_info "Mengatur kepemilikan file proyek ke pengguna $RUN_USER..."
chown -R $RUN_USER:$RUN_USER "$PROJECT_DIR"
echo_info "Memasang dependensi proyek (menjalankan sebagai $RUN_USER)..."
sudo -u "$RUN_USER" bash -c "cd \"$PROJECT_DIR\" && npm install"
echo_info "Membangun aplikasi Next.js untuk produksi (menjalankan sebagai $RUN_USER)..."
sudo -u "$RUN_USER" bash -c "cd \"$PROJECT_DIR\" && npm run build"

# --- 6. Siapkan Variabel Lingkungan (.env.local) ---
echo_info "Membuat file .env.local dengan kredensial database..."
ENV_FILE="$PROJECT_DIR/.env.local"
cat > "$ENV_FILE" << EOF
GEMINI_API_KEY="PASTE_YOUR_GEMINI_API_KEY_HERE"
DB_HOST="127.0.0.1"
DB_PORT="3306"
DB_USER="$DB_USER"
DB_PASSWORD="$DB_PASS"
DB_NAME="$DB_NAME"
# Atur domain utama aplikasi Anda di sini setelah deployment
NEXT_PUBLIC_BASE_URL="http://ALAMAT_IP_ATAU_DOMAIN_UTAMA_ANDA"
EOF
chown $RUN_USER:$RUN_USER "$ENV_FILE"
echo_success "File .env.local berhasil dibuat."

# --- 7. Mulai Aplikasi dengan PM2 ---
echo_info "Menghentikan proses yang ada di port $APP_PORT (jika ada)..."
fuser -k $APP_PORT/tcp || true
echo_info "Memulai atau me-restart aplikasi '$APP_NAME' dengan PM2..."
pm2 delete "$APP_NAME" || true
sudo -u "$RUN_USER" pm2 start npm --name "$APP_NAME" --cwd "$PROJECT_DIR" -- start
STARTUP_COMMAND=$(sudo -u "$RUN_USER" env PATH=$PATH:/usr/bin:/usr/local/bin pm2 startup | grep 'sudo' || true)
if [ -n "$STARTUP_COMMAND" ]; then eval "$STARTUP_COMMAND"; fi
sudo -u "$RUN_USER" pm2 save

# --- 8. Instalasi & Konfigurasi phpMyAdmin (Metode Anti-Gagal dpkg) ---
echo_info "Melakukan pra-konfigurasi phpMyAdmin..."
# [PERBAIKAN DPKG] Secara otomatis menjawab pertanyaan instalasi phpmyadmin SEBELUM instalasi dimulai.
# Ini adalah cara paling andal untuk menghindari error dpkg interaktif.
echo "phpmyadmin phpmyadmin/dbconfig-install boolean true" | debconf-set-selections
echo "phpmyadmin phpmyadmin/app-password-confirm password $DB_ROOT_PASS" | debconf-set-selections
echo "phpmyadmin phpmyadmin/mysql/admin-pass password $DB_ROOT_PASS" | debconf-set-selections
echo "phpmyadmin phpmyadmin/mysql/app-pass password $DB_ROOT_PASS" | debconf-set-selections
echo "phpmyadmin phpmyadmin/reconfigure-webserver multiselect none" | debconf-set-selections

echo_info "Memasang phpMyAdmin dan ekstensi PHP yang diperlukan..."
DEBIAN_FRONTEND=noninteractive apt-get install -y \
    phpmyadmin php-fpm php-mysql php-mbstring php-zip php-gd php-json php-curl

# --- 9. Konfigurasi Nginx & Firewall ---
echo_info "Mengkonfigurasi Nginx sebagai reverse proxy..."
PHP_SOCKET_PATH=$(ls /var/run/php/php*-fpm.sock | head -n 1)
NGINX_CONFIG="
server {
    listen 80;
    listen [::]:80;
    server_name _;
    
    root /var/www/html; # Root default untuk keamanan
    index index.html index.htm;

    location / {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    location /phpmyadmin {
        alias /usr/share/phpmyadmin;
        index index.php;
        
        location ~ ^/phpmyadmin(.+\.php)$ {
            try_files \$uri =404;
            root /usr/share;
            fastcgi_pass unix:$PHP_SOCKET_PATH;
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME \$request_filename;
            include fastcgi_params;
        }

        location ~* ^/phpmyadmin/(.+\.(jpg|jpeg|gif|png|ico|css|js|pdf|txt))$ {
            root /usr/share;
        }
    }
    
    location ~ /\.ht {
        deny all;
    }
}"
echo "$NGINX_CONFIG" > "/etc/nginx/sites-available/$APP_NAME"
rm -f /etc/nginx/sites-enabled/default
ln -sf "/etc/nginx/sites-available/$APP_NAME" "/etc/nginx/sites-enabled/"
nginx -t
systemctl restart nginx

echo_info "Mengkonfigurasi Firewall (UFW) dan Fail2Ban..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 'Nginx Full'
ufw allow 'OpenSSH'
ufw --force enable
systemctl enable fail2ban
systemctl start fail2ban

# --- 10. Setup Backup Database Otomatis ---
echo_info "Mengkonfigurasi backup database otomatis..."
mkdir -p /var/backups/mariadb
cat > /root/.my.cnf << EOF
[mysqldump]
user=$DB_USER
password=$DB_PASS
host=127.0.0.1
EOF
chmod 600 /root/.my.cnf
BACKUP_SCRIPT_PATH="/usr/local/bin/backup_mariadb.sh"
cat > "$BACKUP_SCRIPT_PATH" << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/mariadb"
DB_NAME="coursecentral_db"
TIMESTAMP=$(date +"%Y-%m-%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/$DB_NAME-$TIMESTAMP.sql.gz"
RETENTION_DAYS=7

mysqldump "$DB_NAME" | gzip > "$BACKUP_FILE"
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +$RETENTION_DAYS -exec rm -f {} \;
EOF
chmod +x "$BACKUP_SCRIPT_PATH"
(crontab -l 2>/dev/null; echo "30 2 * * * $BACKUP_SCRIPT_PATH >> /var/log/backup_mariadb.log 2>&1") | crontab -

# --- Selesai ---
echo ""
echo_success "================= PROSES INSTALASI SELESAI ================="
echo ""
echo_warn "=============== INFORMASI PENTING (HARAP SIMPAN!) ==============="
echo "Kredensial Login Aplikasi (Default):"
echo "  - Username        : admin"
echo "  - Password        : password"
echo ""
echo "Kredensial Database (Disimpan di $ENV_FILE):"
echo "  - Username DB     : $DB_USER"
echo "  - Password DB     : $DB_PASS"
echo "  - Root Password DB: $DB_ROOT_PASS (Untuk akses phpMyAdmin)"
echo "===================================================================="
echo ""
echo_info "AKSES APLIKASI:"
echo "  - Aplikasi Next.js: http://<ALAMAT_IP_SERVER_ANDA>"
echo "  - phpMyAdmin      : http://<ALAMAT_IP_SERVER_ANDA>/phpmyadmin"
echo ""
echo_info "LANGKAH SELANJUTNYA:"
echo_warn "  1. SEGERA UBAH PASSWORD ADMIN DEFAULT setelah login pertama kali."
echo_warn "  2. Edit file '$ENV_FILE' untuk menambahkan GEMINI_API_KEY Anda."
echo_warn "  3. Edit file '$ENV_FILE' untuk mengatur NEXT_PUBLIC_BASE_URL Anda dengan domain utama."
echo "  4. Arahkan nama domain Anda ke alamat IP server ini."
echo "  5. Setelah domain diarahkan, jalankan 'sudo certbot --nginx' untuk mengaktifkan HTTPS."
echo "  6. (Sangat Disarankan) Konfigurasi domain Anda dengan Cloudflare untuk keamanan tambahan."
echo ""
echo_success "Deployment selesai!"
