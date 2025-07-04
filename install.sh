#!/bin/bash
#
# =================================================================
# Pemasang Otomatis untuk Aplikasi Next.js di Ubuntu 24.04
#
# Disesuaikan untuk: CourseCentral
#
# Skrip ini akan:
# 1. Memperbarui sistem dan memasang paket yang diperlukan (Nginx, Git).
# 2. Memasang Node.js (versi LTS) dan PM2.
# 3. Mengkonfigurasi Nginx sebagai reverse proxy untuk aplikasi Next.js.
# 4. Menyiapkan firewall dengan UFW.
# 5. Membuat file .env untuk variabel lingkungan.
# 6. Membangun dan memulai aplikasi menggunakan PM2 agar berjalan di latar belakang.
#
# Penggunaan:
# 1. Letakkan skrip ini di root proyek Next.js Anda.
# 2. Jadikan skrip ini dapat dieksekusi: chmod +x install.sh
# 3. Jalankan dengan sudo: sudo ./install.sh
# =================================================================

# --- Berhenti jika ada kesalahan ---
set -e

# --- Konfigurasi ---
# Port tempat aplikasi Next.js Anda akan berjalan. `next start` default-nya 3000.
APP_PORT=3000
# Nama untuk proses PM2 Anda.
APP_NAME="CourseCentral"
# Direktori proyek (diasumsikan skrip berada di root proyek)
PROJECT_DIR=$(pwd)
# Pengguna yang menjalankan skrip (bukan root)
RUN_USER=$(logname)
RUN_HOME=$(eval echo ~$RUN_USER)

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

echo_info "Memulai proses instalasi untuk $APP_NAME..."

# --- 1. Pembaruan Sistem dan Pemasangan Dependensi ---
echo_info "Memperbarui paket sistem dan memasang dependensi (nginx, curl, git)..."
apt-get update
apt-get upgrade -y
apt-get install -y nginx curl git build-essential

# --- 2. Pasang Node.js ---
# Menggunakan repositori NodeSource untuk Node.js 20.x (LTS)
if ! command -v node &> /dev/null; then
    echo_info "Memasang Node.js v20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    apt-get install -y nodejs
else
    echo_info "Node.js sudah terpasang."
fi

# --- 3. Pasang PM2 ---
if ! command -v pm2 &> /dev/null; then
    echo_info "Memasang PM2 secara global..."
    npm install -g pm2
else
    echo_info "PM2 sudah terpasang."
fi


# --- 4. Bangun Aplikasi ---
echo_info "Mengatur kepemilikan file ke pengguna $RUN_USER..."
chown -R $RUN_USER:$RUN_USER $PROJECT_DIR

# Menjalankan npm install dan build sebagai pengguna non-root
echo_info "Memasang dependensi proyek (menjalankan sebagai $RUN_USER)..."
sudo -u $RUN_USER npm install

echo_info "Membangun aplikasi Next.js untuk produksi (menjalankan sebagai $RUN_USER)..."
sudo -u $RUN_USER npm run build


# --- 5. Siapkan Variabel Lingkungan (.env) ---
echo_info "Membuat file .env..."
if [ ! -f "$PROJECT_DIR/.env" ]; then
  # Hanya membuat jika tidak ada
  touch "$PROJECT_DIR/.env"
  echo "GEMINI_API_KEY=" >> "$PROJECT_DIR/.env"
  chown $RUN_USER:$RUN_USER "$PROJECT_DIR/.env"
  echo_success "File .env telah dibuat."
  echo_warn "PENTING: Harap edit file .env dan tambahkan GEMINI_API_KEY Anda agar fitur AI berfungsi."
else
  echo_info "File .env sudah ada, tidak ada perubahan."
fi


# --- 6. Mulai Aplikasi dengan PM2 ---
echo_info "Memulai aplikasi dengan PM2..."
# PM2 adalah manajer proses yang akan menjaga aplikasi tetap berjalan di latar belakang.
# Hapus instance yang ada untuk memastikan awal yang baru
sudo -u $RUN_USER pm2 delete "$APP_NAME" || true
# `pm2 start` secara otomatis menjalankan aplikasi di latar belakang.
# Menjalankan sebagai pengguna non-root untuk keamanan
sudo -u $RUN_USER pm2 start npm --name "$APP_NAME" -- start -p $APP_PORT


# --- 7. Konfigurasi Nginx ---
echo_info "Mengkonfigurasi Nginx sebagai reverse proxy..."

# Tentukan konten konfigurasi Nginx
NGINX_CONFIG="
server {
    listen 80;
    listen [::]:80;

    server_name _; # Ganti _ dengan nama domain Anda

    # Menangani ACME-challenge untuk Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

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
}
"

# Buat file konfigurasi Nginx
echo "$NGINX_CONFIG" > /etc/nginx/sites-available/$APP_NAME

# Hapus konfigurasi Nginx default dan aktifkan konfigurasi aplikasi kita
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/

# Uji konfigurasi Nginx dan mulai ulang
echo_info "Menguji dan memulai ulang Nginx..."
nginx -t
systemctl restart nginx


# --- 8. Konfigurasi Firewall (UFW) ---
echo_info "Mengkonfigurasi firewall dengan UFW..."
ufw allow 'Nginx Full' # Mengizinkan HTTP dan HTTPS
ufw allow 'OpenSSH'
ufw --force enable


# --- 9. Atur PM2 untuk memulai saat boot ---
echo_info "Mengkonfigurasi PM2 untuk memulai saat sistem reboot..."
# `pm2 startup` menghasilkan perintah untuk dijalankan. Kita menangkap dan menjalankannya.
# Menjalankan sebagai pengguna saat ini untuk menghindari masalah izin
env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $RUN_USER --hp $RUN_HOME
sudo -u $RUN_USER pm2 save


echo_success "Instalasi Selesai!"
echo "--------------------------------------------------"
echo "Aplikasi Next.js Anda sekarang berjalan di latar belakang."
echo ""
echo "Dikelola oleh PM2 dengan nama: $APP_NAME"
echo "Anda dapat memonitornya dengan: pm2 monit"
echo ""
echo "Nginx dikonfigurasi untuk melayani aplikasi Anda di port 80."
echo "Arahkan record A domain Anda ke alamat IP server ini."
echo ""
echo_warn "Untuk HTTPS (disarankan), jalankan 'sudo certbot --nginx' setelah mengatur domain Anda."
echo_warn "JANGAN LUPA: Edit file .env Anda dan tambahkan GEMINI_API_KEY."
echo "--------------------------------------------------"

