#!/bin/bash
#
# =================================================================
# Pemasang & Pembaru Otomatis untuk Aplikasi Next.js di Ubuntu 22.04 & 24.04
# Untuk instruksi lengkap, silakan lihat file DEPLOYMENT.md
# =================================================================

# --- Berhenti jika ada kesalahan ---
set -e

# --- Konfigurasi ---
# Nama folder proyek yang akan dibuat
PROJECT_DIR_NAME="kursus"
# Port tempat aplikasi Next.js Anda akan berjalan. `next start` default-nya 3000.
APP_PORT=3000
# Nama untuk proses PM2 Anda.
APP_NAME="kursus"
# Pengguna yang menjalankan skrip (bukan root)
RUN_USER=$(logname)
RUN_HOME=$(eval echo ~$RUN_USER)
# Path lengkap ke direktori proyek
PROJECT_DIR="$RUN_HOME/$PROJECT_DIR_NAME"


# --- Fungsi Gaya ---
echo_info() {
    echo -e "\033[1;34m[INFO]\033[0m $1"
}

echo_success() {
    echo -e "\033[1;32m[SUCCESS]\033[0m $1"
}

echo_warn() {
    echo -e "\033[1;33m[PERINGATAN]\033[0m $1"
}

echo_error() {
    echo -e "\033[1;31m[ERROR]\033[0m $1"
}

# --- Memastikan skrip dijalankan sebagai root ---
if [ "$(id -u)" -ne 0 ]; then
  echo_error "Skrip ini harus dijalankan sebagai root. Silakan gunakan sudo."
  exit 1
fi

echo_info "Memulai proses instalasi/pembaruan untuk $APP_NAME..."

# --- 1. Pembaruan Sistem dan Pemasangan Dependensi Awal ---
echo_info "Memperbarui paket sistem dan memasang dependensi (nginx, curl)..."
apt-get update
apt-get upgrade -y
apt-get install -y nginx curl build-essential mariadb-server

# --- 2. Setup Database MariaDB ---
echo_info "Mengkonfigurasi database MariaDB..."
DB_NAME="coursecentral_db"
DB_USER="coursecentral_user"
# PENTING: Ganti password ini di production
DB_PASS="gantidenganpassworduseryangaman" 
DB_ROOT_PASS="gantidenganpasswordrootyangaman"

# Jalankan skrip setup keamanan secara non-interaktif
mysql -u root -e "UPDATE mysql.user SET password=PASSWORD('$DB_ROOT_PASS') WHERE user='root';"
mysql -u root -p"$DB_ROOT_PASS" -e "DELETE FROM mysql.user WHERE user='';"
mysql -u root -p"$DB_ROOT_PASS" -e "DELETE FROM mysql.user WHERE user='root' AND host NOT IN ('localhost', '127.0.0.1', '::1');"
mysql -u root -p"$DB_ROOT_PASS" -e "DROP DATABASE IF EXISTS test;"
mysql -u root -p"$DB_ROOT_PASS" -e "DELETE FROM mysql.db WHERE db='test' OR db='test\\_%';"
mysql -u root -p"$DB_ROOT_PASS" -e "FLUSH PRIVILEGES;"


# Buat database dan pengguna, pastikan idempotensi
mysql -u root -p"$DB_ROOT_PASS" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;"
mysql -u root -p"$DB_ROOT_PASS" -e "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';"
mysql -u root -p"$DB_ROOT_PASS" -e "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';"
mysql -u root -p"$DB_ROOT_PASS" -e "FLUSH PRIVILEGES;"
echo_success "Database dan pengguna berhasil dikonfigurasi."
echo_warn "Harap catat password root dan pengguna yang baru dibuat."

# --- 3. Setup Direktori Proyek ---
echo_info "Memeriksa direktori proyek di $PROJECT_DIR..."

if [ ! -d "$PROJECT_DIR" ]; then
    echo_error "Direktori proyek '$PROJECT_DIR' tidak ditemukan."
    echo_error "Harap unggah folder proyek Anda ke direktori tersebut sebelum menjalankan skrip ini."
    exit 1
fi

echo_info "Direktori proyek ditemukan. Mengimpor skema database..."
cd "$PROJECT_DIR"
mysql -u $DB_USER -p"$DB_PASS" $DB_NAME < schema.sql
echo_success "Skema database berhasil diimpor."


# --- 4. Pasang Node.js & PM2 ---
echo_info "Memeriksa instalasi Node.js dan PM2..."
# Menggunakan repositori NodeSource untuk Node.js 20.x (LTS)
if ! command -v node &> /dev/null || [[ $(node -v) != "v20."* ]]; then
    echo_info "Memasang Node.js v20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    apt-get install -y nodejs
else
    echo_info "Node.js v20 sudah terpasang."
fi

# Pasang PM2
if ! command -v pm2 &> /dev/null; then
    echo_info "Memasang PM2 secara global..."
    npm install -g pm2
else
    echo_info "PM2 sudah terpasang."
fi

# --- 5. Bangun Aplikasi ---
echo_info "Mengatur kepemilikan file proyek ke pengguna $RUN_USER..."
chown -R $RUN_USER:$RUN_USER "$PROJECT_DIR"

# Menjalankan npm install dan build sebagai pengguna non-root di dalam direktori proyek
echo_info "Memasang dependensi proyek (menjalankan sebagai $RUN_USER)..."
sudo -u "$RUN_USER" bash -c "cd \"$PROJECT_DIR\" && npm install"

echo_info "Membangun aplikasi Next.js untuk produksi (menjalankan sebagai $RUN_USER)..."
sudo -u "$RUN_USER" bash -c "cd \"$PROJECT_DIR\" && npm run build"

# --- 6. Siapkan Variabel Lingkungan (.env.local) ---
echo_info "Membuat file .env.local..."
ENV_FILE="$PROJECT_DIR/.env.local"

# Buat file .env.local dengan kredensial yang baru dibuat
cat > "$ENV_FILE" << EOF
GEMINI_API_KEY="PASTE_YOUR_GEMINI_API_KEY_HERE"
DB_HOST="127.0.0.1"
DB_PORT="3306"
DB_USER="$DB_USER"
DB_PASSWORD="$DB_PASS"
DB_NAME="$DB_NAME"
EOF

chown $RUN_USER:$RUN_USER "$ENV_FILE"
echo_success "File .env.local telah dibuat dengan kredensial database."
echo_warn "======================================================================="
echo_warn "  PENTING: Aplikasi Anda tidak akan berjalan tanpa Kunci API Gemini!  "
echo_warn "  Harap edit file '$ENV_FILE' dan tambahkan GEMINI_API_KEY Anda.    "
echo_warn "======================================================================="

# --- 7. Mulai Aplikasi dengan PM2 ---
echo_info "Memulai atau me-restart aplikasi dengan PM2..."
# Hapus instance yang ada untuk memastikan awal yang baru
sudo -u "$RUN_USER" pm2 delete "$APP_NAME" || true
# Menjalankan `npm start` dengan --cwd untuk memastikan direktori kerja yang benar.
sudo -u "$RUN_USER" pm2 start npm --name "$APP_NAME" --cwd "$PROJECT_DIR" -- start

# Beri waktu sejenak agar aplikasi dapat memulai sepenuhnya
echo_info "Memberi waktu 2 detik bagi aplikasi untuk memulai..."
sleep 2

# --- 8. Konfigurasi Nginx ---
echo_info "Mengkonfigurasi Nginx sebagai reverse proxy..."
NGINX_CONFIG_FILE="/etc/nginx/sites-available/$APP_NAME"

# Selalu timpa konfigurasi Nginx untuk memastikan yang terbaru
NGINX_CONFIG="
server {
    listen 80;
    listen [::]:80;
    server_name _; # Ganti _ dengan nama domain Anda
    location /.well-known/acme-challenge/ { root /var/www/html; }
    location / {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}"
echo "$NGINX_CONFIG" > "$NGINX_CONFIG_FILE"
echo_info "File konfigurasi Nginx dibuat/diperbarui."

# Aktifkan site dan hapus default
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
echo_info "Menguji dan memulai ulang Nginx..."
nginx -t
systemctl restart nginx

# --- 9. Konfigurasi Firewall (UFW) ---
echo_info "Mengkonfigurasi firewall dengan UFW..."
ufw allow 'Nginx Full'
ufw allow 'OpenSSH'
ufw --force enable

# --- 10. Atur PM2 untuk memulai saat boot ---
echo_info "Mengkonfigurasi PM2 untuk memulai saat sistem reboot..."
env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $RUN_USER --hp $RUN_HOME
sudo -u $RUN_USER pm2 save

echo ""
echo_success "================= PROSES SELESAI ================="
echo "Aplikasi Anda sekarang berjalan dan dikelola oleh PM2."
echo ""
echo_info "PENTING: ARAHKAN DOMAIN ANDA KE ALAMAT IP SERVER INI."
echo_warn "Untuk mengaktifkan HTTPS (sangat disarankan), jalankan: sudo certbot --nginx"
echo ""
echo_info "Untuk panduan pemecahan masalah, lihat file DEPLOYMENT.md."
echo ""
echo_success "Deployment selesai! Aplikasi Anda dapat diakses melalui IP server."
