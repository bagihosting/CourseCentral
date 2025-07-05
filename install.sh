#!/bin/bash
#
# =================================================================
# Pemasang Otomatis untuk Aplikasi Next.js di Ubuntu 24.04
#
# Disesuaikan untuk: CourseCentral
#
# Skrip ini akan:
# 1. Mengasumsikan Anda menjalankannya dari dalam direktori proyek Anda.
# 2. Memperbarui sistem dan memasang paket yang diperlukan (Nginx, Git).
# 3. Memasang Node.js (versi LTS) dan PM2.
# 4. Mengkonfigurasi Nginx sebagai reverse proxy untuk aplikasi Next.js.
# 5. Menyiapkan firewall dengan UFW.
# 6. Membuat file .env.local untuk variabel lingkungan jika belum ada.
# 7. Membangun dan memulai aplikasi menggunakan PM2 agar berjalan di latar belakang.
#
# Penggunaan:
# 1. Unggah folder proyek Anda ke VPS (misalnya ke /home/ubuntu/nama-proyek).
# 2. Pindahkan skrip ini ke dalam direktori proyek tersebut.
# 3. Jadikan skrip ini dapat dieksekusi: chmod +x install.sh
# 4. Jalankan dengan sudo: sudo ./install.sh
# =================================================================

# --- Berhenti jika ada kesalahan ---
set -e

# --- Konfigurasi ---
# Port tempat aplikasi Next.js Anda akan berjalan. `next start` default-nya 3000.
APP_PORT=3000
# Nama untuk proses PM2 Anda.
APP_NAME="CourseCentral"
# Pengguna yang menjalankan skrip (bukan root)
RUN_USER=$(logname)
RUN_HOME=$(eval echo ~$RUN_USER)
# Direktori proyek adalah direktori tempat skrip ini dijalankan
PROJECT_DIR=$(pwd)


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
echo_info "Direktori proyek diatur ke: $PROJECT_DIR"


# --- 1. Pembaruan Sistem dan Pemasangan Dependensi ---
echo_info "Memperbarui paket sistem dan memasang dependensi (nginx, curl, git)..."
apt-get update
apt-get upgrade -y
apt-get install -y nginx curl git build-essential

# --- 2. Pasang Database (Opsional, Placeholder) ---
echo_info "Memeriksa Opsi Database..."
echo_warn "CATATAN: Aplikasi ini secara default menggunakan localStorage browser. Untuk penggunaan produksi dengan database terpusat, Anda perlu memodifikasi kode aplikasi di 'src/lib/data.ts'."
echo_warn "Skrip ini menyediakan placeholder untuk memasang MariaDB (pengganti MySQL) jika Anda berencana untuk melakukan migrasi."
# Untuk memasang MariaDB, hapus tanda komentar di baris berikut:
# apt-get install -y mariadb-server
# echo_info "Setelah instalasi, jalankan 'sudo mysql_secure_installation' untuk mengamankan database Anda."

# --- 3. Pasang Node.js ---
# Menggunakan repositori NodeSource untuk Node.js 20.x (LTS)
if ! command -v node &> /dev/null; then
    echo_info "Memasang Node.js v20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    apt-get install -y nodejs
else
    echo_info "Node.js sudah terpasang."
fi

# --- 4. Pasang PM2 ---
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
if [ ! -f "$ENV_FILE" ]; then
  # Hanya membuat jika tidak ada. Next.js secara otomatis memuat .env.local di lingkungan produksi.
  touch "$ENV_FILE"
  echo "GEMINI_API_KEY=" >> "$ENV_FILE"
  chown $RUN_USER:$RUN_USER "$ENV_FILE"
  echo_success "File .env.local telah dibuat."
  echo_warn "=========================================================="
  echo_warn "PENTING: Aplikasi Anda tidak akan berjalan tanpa API Key!"
  echo_warn "Harap edit file '$ENV_FILE' dan tambahkan GEMINI_API_KEY Anda agar fitur AI berfungsi."
  echo_warn "=========================================================="
else
  echo_info "File .env.local sudah ada, tidak ada perubahan."
fi


# --- 7. Mulai Aplikasi dengan PM2 ---
echo_info "Memulai aplikasi dengan PM2..."
# PM2 adalah manajer proses yang akan menjaga aplikasi tetap berjalan di latar belakang.
# Hapus instance yang ada untuk memastikan awal yang baru
sudo -u "$RUN_USER" pm2 delete "$APP_NAME" || true
# Menjalankan `npm start` dengan --cwd untuk memastikan direktori kerja yang benar.
sudo -u "$RUN_USER" pm2 start npm --name "$APP_NAME" --cwd "$PROJECT_DIR" -- start

# Beri waktu sejenak agar aplikasi dapat memulai sepenuhnya
echo_info "Memberi waktu 2 detik bagi aplikasi untuk memulai..."
sleep 2


# --- 8. Konfigurasi Nginx ---
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

# Hapus konfigurasi Nginx default dan aktifkan konfigurasi kita
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/

# Uji konfigurasi Nginx dan mulai ulang
echo_info "Menguji dan memulai ulang Nginx..."
nginx -t
systemctl restart nginx


# --- 9. Konfigurasi Firewall (UFW) ---
echo_info "Mengkonfigurasi firewall dengan UFW..."
ufw allow 'Nginx Full' # Mengizinkan HTTP dan HTTPS
ufw allow 'OpenSSH'
ufw --force enable


# --- 10. Atur PM2 untuk memulai saat boot ---
echo_info "Mengkonfigurasi PM2 untuk memulai saat sistem reboot..."
# `pm2 startup` menghasilkan perintah untuk dijalankan. Kita menangkap dan menjalankannya.
# Menjalankan sebagai pengguna saat ini untuk menghindari masalah izin
env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $RUN_USER --hp $RUN_HOME
sudo -u $RUN_USER pm2 save


echo ""
echo_success "================= INSTALASI SELESAI ================="
echo "Aplikasi Anda sekarang berjalan dan dikelola oleh PM2."
echo "------------------------------------------------------------"
echo_info "PENTING: ARAHKAN DOMAIN ANDA KE ALAMAT IP SERVER INI."
echo_warn "Jangan lupa untuk mengedit '.env.local' dan menambahkan GEMINI_API_KEY Anda."
echo_warn "Untuk mengaktifkan HTTPS (sangat disarankan), jalankan: sudo certbot --nginx"
echo ""
echo "------------------------------------------------------------"
echo_warn "          JIKA TERJADI MASALAH (502 BAD GATEWAY)          "
echo "------------------------------------------------------------"
echo "Error '502 Bad Gateway' biasanya berarti aplikasi Next.js Anda"
echo "gagal dimulai. Periksa log untuk menemukan penyebabnya:"
echo ""
echo "1. Cek status aplikasi:"
echo "   pm2 status"
echo "   (Pastikan statusnya 'online')"
echo ""
echo "2. Lihat log error aplikasi:"
echo "   pm2 logs $APP_NAME"
echo "   (Cari pesan error berwarna merah, seringkali karena API Key hilang)"
echo ""
echo "3. Uji konfigurasi Nginx:"
echo "   sudo nginx -t"
echo "------------------------------------------------------------"
echo ""
echo_success "Deployment selesai! Aplikasi Anda dapat diakses melalui IP server."

```