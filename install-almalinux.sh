#!/bin/bash
#
# =================================================================
# Autoinstaller Cerdas & Andal untuk Aplikasi Next.js
# Distro: AlmaLinux 8/9 & RHEL-based
# Fokus: Nginx, Node.js v20, PM2, Firewalld, dan Otomatisasi Database MySQL.
# =================================================================

# --- Berhenti jika ada kesalahan ---
set -e

# --- Konfigurasi & Variabel Inti ---
APP_PORT=3000
APP_NAME="coursecentral"
RUN_USER="sadewa"
PROJECT_DIR="/opt/coursecentral"
SERVER_IP=$(hostname -I | awk '{print $1}')
DB_NAME="coursecentral_db"
DB_USER="coursecentral_user"

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
if [ ! -f "$(pwd)/package.json" ]; then
    echo_error "File 'package.json' tidak ditemukan. Pastikan Anda menjalankan skrip ini dari dalam direktori utama proyek."
    exit 1
fi

# Cek Distribusi (AlmaLinux/RHEL)
if ! grep -qiE "alma|centos|rocky" /etc/os-release; then
    echo_warning "Skrip ini dioptimalkan untuk AlmaLinux dan distro berbasis RHEL. Hasil di distro lain mungkin bervariasi."
fi

echo_info "Memulai instalasi cerdas untuk '$APP_NAME' di AlmaLinux..."

# --- 1. Pemasangan Dependensi Inti & Keamanan ---
echo_info "Memasang dependensi: Nginx, Node.js, MySQL Server..."
sudo dnf update -y
sudo dnf install -y nginx curl policycoreutils-python-utils unzip

# Install Development Tools
sudo dnf groupinstall -y "Development Tools"

# Instal Node.js v20 LTS
echo_info "Memasang Node.js v20 LTS..."
if ! command -v node &> /dev/null || [[ $(node -v) != "v20."* ]]; then
    curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
    sudo dnf install -y nodejs
fi

# Pasang PM2
echo_info "Memasang PM2 secara global..."
sudo npm install -g pm2

# --- 2. Konfigurasi Database MySQL ---
echo_info "Memasang dan mengamankan MySQL Server..."
sudo dnf install -y mysql-server
sudo systemctl enable --now mysqld

echo_info "Membuat database dan pengguna secara otomatis..."
DB_PASSWORD=$(tr -dc A-Za-z0-9 </dev/urandom | head -c 16)
sudo mysql -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';"
sudo mysql -e "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"
echo_success "Database '${DB_NAME}' dan pengguna '${DB_USER}' berhasil dibuat."

echo_info "Mengimpor skema database dari 'schema.sql'..."
if [ -f "$(pwd)/schema.sql" ]; then
    sudo mysql -u "${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" < "$(pwd)/schema.sql"
    echo_success "Skema database berhasil diimpor."
else
    echo_warning "File 'schema.sql' tidak ditemukan. Langkah impor dilewati."
fi

# --- 3. Bangun Aplikasi (Sebagai Pengguna Non-Root) ---
echo_info "Memastikan direktori proyek ada dan mengatur kepemilikan ke pengguna '$RUN_USER'..."
sudo mkdir -p "$PROJECT_DIR"
# Salin file dari direktori saat ini ke direktori target, jika belum ada
sudo rsync -a --ignore-existing "$(pwd)/" "$PROJECT_DIR/"
sudo chown -R $RUN_USER:$RUN_USER "$PROJECT_DIR"

echo_info "Memasang dependensi proyek (menjalankan sebagai '$RUN_USER')..."
sudo -u "$RUN_USER" bash -c "cd \"$PROJECT_DIR\" && npm install"

echo_info "Membangun aplikasi Next.js untuk produksi (menjalankan sebagai '$RUN_USER')..."
sudo -u "$RUN_USER" bash -c "cd \"$PROJECT_DIR\" && npm run build"

# --- 4. Siapkan Variabel Lingkungan Secara Otomatis ---
echo_info "Membuat dan mengisi file .env.local secara otomatis..."
ENV_FILE="$PROJECT_DIR/.env.local"
if [ ! -f "$ENV_FILE" ]; then
    cp "$PROJECT_DIR/.env.example" "$ENV_FILE"
    
    # Isi detail yang sudah dibuat secara otomatis
    sed -i "s|^NEXT_PUBLIC_BASE_URL=.*|NEXT_PUBLIC_BASE_URL=http://${SERVER_IP}|" "$ENV_FILE"
    sed -i "s/^DB_HOST=.*/DB_HOST=127.0.0.1/" "$ENV_FILE"
    sed -i "s/^DB_PORT=.*/DB_PORT=3306/" "$ENV_FILE"
    sed -i "s/^DB_NAME=.*/DB_NAME=${DB_NAME}/" "$ENV_FILE"
    sed -i "s/^DB_USER=.*/DB_USER=${DB_USER}/" "$ENV_FILE"
    sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=${DB_PASSWORD}/" "$ENV_FILE"

    sudo chown $RUN_USER:$RUN_USER "$ENV_FILE"
    echo_success "File .env.local telah dibuat dan diisi dengan detail database."
else
    echo_warning "File .env.local sudah ada, tidak menimpa."
fi

# --- 5. Jalankan Aplikasi dengan PM2 (Sebagai Pengguna Non-Root) ---
echo_info "Menjalankan aplikasi '$APP_NAME' dengan PM2..."
PM2_PATH=$(which pm2)
sudo -u "$RUN_USER" "$PM2_PATH" delete "$APP_NAME" || true
sudo -u "$RUN_USER" bash -c "cd \"$PROJECT_DIR\" && \"$PM2_PATH\" start npm --name \"$APP_NAME\" -- start"
sudo -u "$RUN_USER" "$PM2_PATH" save
# Menjalankan startup PM2 sebagai root untuk membuat service systemd
sudo env PATH=$PATH:/usr/bin "$PM2_PATH" startup -u "$RUN_USER" --hp "/home/$RUN_USER"
echo_success "Aplikasi berjalan di bawah PM2."

# --- 6. Konfigurasi Nginx (Reverse Proxy) ---
echo_info "Mengkonfigurasi Nginx..."
NGINX_CONFIG="/etc/nginx/conf.d/$APP_NAME.conf"

sudo tee "$NGINX_CONFIG" > /dev/null << EOF
server {
    listen 80;
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
}
EOF
# Hapus konfigurasi default jika ada untuk menghindari konflik
sudo rm -f /etc/nginx/conf.d/default.conf
# Uji konfigurasi dan restart Nginx
sudo nginx -t && sudo systemctl restart nginx
echo_success "Nginx berhasil dikonfigurasi sebagai reverse proxy."

# --- 7. Konfigurasi Firewall & SELinux ---
echo_info "Mengkonfigurasi Firewall dan SELinux..."
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
# Izinkan Nginx untuk membuat koneksi jaringan di bawah SELinux
sudo setsebool -P httpd_can_network_connect 1
echo_success "Firewall dan SELinux dikonfigurasi."

# --- Selesai ---
echo ""
echo_success "================= PROSES INSTALASI SELESAI ================="
echo ""
echo_info "AKSES APLIKASI ANDA:"
echo "  - URL Aplikasi: http://${SERVER_IP}"
echo ""
echo_info "LANGKAH PENTING SELANJUTNYA:"
echo "  1. Buka file '.env.local' untuk mengisi GEMINI_API_KEY Anda."
echo "     (Gunakan: sudo nano ${PROJECT_DIR}/.env.local)"
echo "  2. Setelah mengisi .env.local, restart aplikasi dengan: pm2 restart $APP_NAME"
echo "  3. (Sangat Disarankan) Konfigurasi domain Anda dengan Cloudflare untuk keamanan dan HTTPS."
echo ""
echo_success "Deployment aplikasi selesai!"
