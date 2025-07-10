#!/bin/bash
#
# =================================================================
# Autoinstaller Sederhana & Cerdas untuk Aplikasi Next.js di Ubuntu
# Fokus: Nginx, MariaDB, Node.js v20, PM2.
# Dirancang untuk keandalan dan kecepatan maksimal.
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

echo_info "Memulai proses instalasi sederhana untuk $APP_NAME..."

# --- 1. Pembaruan Sistem dan Pemasangan Dependensi Inti ---
echo_info "Memperbarui sistem dan memasang dependensi inti..."
apt-get update
# Menggunakan DEBIAN_FRONTEND=noninteractive untuk mencegah dialog interaktif
DEBIAN_FRONTEND=noninteractive apt-get install -y \
    nginx curl build-essential mariadb-server mariadb-client psmisc

# --- 2. Setup Database MariaDB (Metode Andal) ---
echo_info "Mengkonfigurasi database MariaDB..."
systemctl start mariadb
systemctl enable mariadb

DB_NAME="coursecentral_db"
DB_USER="coursecentral_user"
DB_PASS=$(openssl rand -base64 12)
DB_ROOT_PASS=$(openssl rand -base64 16)

echo_info "Mengamankan pengguna root MariaDB dan membuat database aplikasi..."
# Gunakan `mariadb-admin` untuk mengatur password root, ini lebih andal
mariadb-admin -u root password "$DB_ROOT_PASS"

# Jalankan perintah selanjutnya dengan password root yang baru
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

echo_info "Mengatur PM2 agar berjalan saat server startup..."
# Menjalankan perintah startup PM2
STARTUP_COMMAND=$(sudo -u "$RUN_USER" env PATH=$PATH:/usr/bin:/usr/local/bin pm2 startup | grep 'sudo' || true)
if [ -n "$STARTUP_COMMAND" ]; then eval "$STARTUP_COMMAND"; fi
# Menyimpan proses PM2 saat ini
sudo -u "$RUN_USER" pm2 save

# --- 8. Konfigurasi Nginx ---
echo_info "Mengkonfigurasi Nginx sebagai reverse proxy..."
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
    
    location ~ /\.ht {
        deny all;
    }
}"
echo "$NGINX_CONFIG" > "/etc/nginx/sites-available/$APP_NAME"

# Menghapus link Nginx default jika ada
rm -f /etc/nginx/sites-enabled/default

# Mengaktifkan konfigurasi Nginx baru
ln -sf "/etc/nginx/sites-available/$APP_NAME" "/etc/nginx/sites-enabled/"

echo_info "Menguji konfigurasi Nginx dan me-restart layanan..."
nginx -t
systemctl restart nginx

# --- Selesai ---
echo ""
echo_success "================= PROSES INSTALASI SELESAI ================="
echo ""
echo_info "AKSES APLIKASI ANDA:"
echo "  - http://<ALAMAT_IP_SERVER_ANDA>"
echo ""
echo_info "LANGKAH SELANJUTNYA:"
echo "  1. Edit file '$ENV_FILE' untuk menambahkan GEMINI_API_KEY Anda."
echo "  2. Edit file '$ENV_FILE' untuk mengatur NEXT_PUBLIC_BASE_URL dengan domain utama Anda."
echo "  3. Arahkan nama domain Anda ke alamat IP server ini."
echo "  4. (Sangat Disarankan) Konfigurasi domain Anda dengan Cloudflare untuk keamanan dan HTTPS."
echo ""
echo_success "Deployment selesai!"
