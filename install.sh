#!/bin/bash
#
# =================================================================
# Autoinstaller Cerdas & Andal untuk Aplikasi Next.js
# Distro: Debian 11/12 & Ubuntu 20.04/22.04/24.04
# Fokus: Nginx, Node.js v20, PM2, Fail2Ban, dan Otomatisasi Database.
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
  echo_error "Skrip ini harus dijalankan dengan 'sudo'. Contoh: 'sudo ./install.sh'"
  exit 1
fi
if [ ! -f "$(pwd)/package.json" ]; then
    echo_error "File 'package.json' tidak ditemukan. Pastikan Anda menjalankan skrip ini dari dalam direktori utama proyek."
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
sudo dpkg --configure -a
sudo apt-get -f install -y
sudo apt-get update
echo_success "Manajer paket siap."
# --- AKHIR BLOK PEMULIHAN ---

# --- 1. Pemasangan Dependensi Inti & Keamanan ---
echo_info "Memasang dependensi: Nginx, Node.js, Fail2Ban, MySQL..."
sudo apt-get install -y nginx curl build-essential psmisc fail2ban mysql-server

# Konfigurasi Fail2Ban
echo_info "Mengaktifkan proteksi Fail2Ban untuk SSH..."
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local &>/dev/null || true
sudo sed -i '/^\[sshd\]/a enabled = true' /etc/fail2ban/jail.local
sudo systemctl enable --now fail2ban
echo_success "Fail2Ban aktif dan memonitor SSH."

# --- 2. Konfigurasi & Otomatisasi Database ---
echo_info "Memulai dan mengaktifkan layanan MySQL..."
sudo systemctl enable --now mysql

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

# --- 3. Pasang Node.js & PM2 ---
echo_info "Memasang Node.js v20 LTS dan PM2..."
if ! command -v node &> /dev/null || [[ $(node -v) != "v20."* ]]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
    sudo apt-get install -y nodejs
fi
sudo npm install -g pm2

# --- 4. Bangun Aplikasi (Sebagai Pengguna Non-Root) ---
echo_info "Memastikan direktori proyek ada dan mengatur kepemilikan ke pengguna '$RUN_USER'..."
sudo mkdir -p "$PROJECT_DIR"
# Pindahkan file dari direktori saat ini ke direktori target, jika belum ada
sudo rsync -a --ignore-existing "$(pwd)/" "$PROJECT_DIR/"
sudo chown -R sadewa:sadewa /opt/coursecentral

echo_info "Memasang dependensi proyek (menjalankan sebagai '$RUN_USER')..."
sudo -u "$RUN_USER" bash -c "cd \"$PROJECT_DIR\" && npm install"

echo_info "Membangun aplikasi Next.js untuk produksi (menjalankan sebagai '$RUN_USER')..."
sudo -u "$RUN_USER" bash -c "cd \"$PROJECT_DIR\" && npm run build"

# --- 5. Siapkan Variabel Lingkungan Secara Otomatis ---
echo_info "Membuat dan mengisi file .env.local secara otomatis..."
ENV_FILE="$PROJECT_DIR/.env.local"
if [ ! -f "$ENV_FILE" ]; then
    cp "$(pwd)/.env.example" "$ENV_FILE"
    
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

# --- 6. Jalankan Aplikasi dengan PM2 (Sebagai Pengguna Non-Root) ---
echo_info "Menjalankan aplikasi '$APP_NAME' dengan PM2..."
PM2_PATH=$(which pm2)
sudo -u "$RUN_USER" "$PM2_PATH" delete "$APP_NAME" || true
sudo -u "$RUN_USER" bash -c "cd \"$PROJECT_DIR\" && \"$PM2_PATH\" start npm --name \"$APP_NAME\" -- start"
sudo -u "$RUN_USER" "$PM2_PATH" save
# Menjalankan startup PM2 sebagai root untuk membuat service systemd
sudo env PATH=$PATH:/usr/bin "$PM2_PATH" startup -u "$RUN_USER" --hp "/opt"
echo_success "Aplikasi berjalan di bawah PM2."

# --- 7. Konfigurasi Nginx (Reverse Proxy) ---
echo_info "Mengkonfigurasi Nginx..."
NGINX_CONFIG="/etc/nginx/sites-available/$APP_NAME"

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
    }
}
EOF
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf "$NGINX_CONFIG" "/etc/nginx/sites-enabled/"
sudo nginx -t && sudo systemctl restart nginx
echo_success "Nginx berhasil dikonfigurasi sebagai reverse proxy."

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
