#!/bin/bash
#
# =================================================================
# Pemasang & Pembaru Otomatis untuk Aplikasi Next.js di Ubuntu 24.04
#
# Disesuaikan untuk: CourseCentral
#
# Skrip ini dirancang untuk dapat dijalankan ulang untuk instalasi awal
# maupun untuk memperbarui aplikasi dengan mudah.
# =================================================================

# --- CARA PENGGUNAAN ---

# 1. INSTALASI PERTAMA:
#    a. Pastikan Anda sudah mengunggah kode Anda ke repository Git (misal: GitHub).
#    b. Unggah skrip 'install.sh' ini ke direktori home Anda di VPS (misal: /home/ubuntu/).
#    c. EDIT skrip ini dan masukkan URL repository Anda di variabel REPO_URL di bawah.
#    d. Jadikan skrip ini dapat dieksekusi: chmod +x install.sh
#    e. Jalankan skrip dengan sudo: sudo ./install.sh
#    f. Skrip akan mengkloning, menginstal dependensi, membangun, dan menjalankan aplikasi Anda.

# 2. CARA UPDATE SCRIPT (PEMBARUAN):
#    a. Lakukan perubahan pada kode Anda di Firebase Studio.
#    b. Simpan (commit) dan unggah (push) perubahan tersebut ke repository Git Anda.
#    c. Masuk ke VPS Anda dan jalankan kembali skrip ini: sudo ./install.sh
#    d. Skrip akan secara otomatis mendeteksi instalasi yang ada, menarik perubahan
#       terbaru, membangun ulang, dan memulai ulang aplikasi Anda tanpa downtime.

# --- Berhenti jika ada kesalahan ---
set -e

# --- Konfigurasi ---
# PENTING: Ganti dengan URL repository Git Anda!
REPO_URL="https://github.com/username/nama-repo.git" 
# Nama folder proyek yang akan dibuat
PROJECT_DIR_NAME="CourseCentral"
# Port tempat aplikasi Next.js Anda akan berjalan. `next start` default-nya 3000.
APP_PORT=3000
# Nama untuk proses PM2 Anda.
APP_NAME="CourseCentral"
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
echo_info "Memperbarui paket sistem dan memasang dependensi (nginx, curl, git)..."
apt-get update
apt-get upgrade -y
apt-get install -y nginx curl git build-essential

# --- 2. Git & Setup Direktori Proyek ---
echo_info "Mempersiapkan direktori proyek di $PROJECT_DIR..."

if [ -d "$PROJECT_DIR/.git" ]; then
    echo_info "Direktori proyek sudah ada. Menarik perubahan terbaru dari Git..."
    cd "$PROJECT_DIR"
    chown -R $RUN_USER:$RUN_USER "$PROJECT_DIR" # Pastikan izin benar sebelum pull
    sudo -u "$RUN_USER" git pull
else
    echo_info "Direktori proyek tidak ditemukan. Mengkloning repository dari $REPO_URL..."
    sudo -u "$RUN_USER" git clone "$REPO_URL" "$PROJECT_DIR"
    cd "$PROJECT_DIR"
fi

# --- 3. Pasang Node.js & PM2 ---
echo_info "Memeriksa instalasi Node.js dan PM2..."
# Menggunakan repositori NodeSource untuk Node.js 20.x (LTS)
if ! command -v node &> /dev/null; then
    echo_info "Memasang Node.js v20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    apt-get install -y nodejs
else
    echo_info "Node.js sudah terpasang."
fi

# Pasang PM2
if ! command -v pm2 &> /dev/null; then
    echo_info "Memasang PM2 secara global..."
    npm install -g pm2
else
    echo_info "PM2 sudah terpasang."
fi

# --- 4. Bangun Aplikasi ---
echo_info "Mengatur kepemilikan file proyek ke pengguna $RUN_USER..."
chown -R $RUN_USER:$RUN_USER "$PROJECT_DIR"

# Menjalankan npm install dan build sebagai pengguna non-root di dalam direktori proyek
echo_info "Memasang dependensi proyek (menjalankan sebagai $RUN_USER)..."
sudo -u "$RUN_USER" bash -c "cd \"$PROJECT_DIR\" && npm install"

echo_info "Membangun aplikasi Next.js untuk produksi (menjalankan sebagai $RUN_USER)..."
sudo -u "$RUN_USER" bash -c "cd \"$PROJECT_DIR\" && npm run build"

# --- 5. Siapkan Variabel Lingkungan (.env.local) ---
echo_info "Memeriksa file .env.local..."
ENV_FILE="$PROJECT_DIR/.env.local"
if [ ! -f "$ENV_FILE" ]; then
  touch "$ENV_FILE"
  echo "GEMINI_API_KEY=" >> "$ENV_FILE"
  chown $RUN_USER:$RUN_USER "$ENV_FILE"
  echo_success "File .env.local telah dibuat."
  echo_warn "=========================================================="
  echo_warn "PENTING: Aplikasi Anda tidak akan berjalan tanpa API Key!"
  echo_warn "Harap edit file '$ENV_FILE' dan tambahkan GEMINI_API_KEY Anda."
  echo_warn "=========================================================="
else
  echo_info "File .env.local sudah ada, tidak ada perubahan."
fi

# --- 6. Mulai Aplikasi dengan PM2 ---
echo_info "Memulai atau me-restart aplikasi dengan PM2..."
# Hapus instance yang ada untuk memastikan awal yang baru
sudo -u "$RUN_USER" pm2 delete "$APP_NAME" || true
# Menjalankan `npm start` dengan --cwd untuk memastikan direktori kerja yang benar.
sudo -u "$RUN_USER" pm2 start npm --name "$APP_NAME" --cwd "$PROJECT_DIR" -- start

# Beri waktu sejenak agar aplikasi dapat memulai sepenuhnya
echo_info "Memberi waktu 2 detik bagi aplikasi untuk memulai..."
sleep 2

# --- 7. Konfigurasi Nginx ---
echo_info "Mengkonfigurasi Nginx sebagai reverse proxy..."
NGINX_CONFIG_FILE="/etc/nginx/sites-available/$APP_NAME"
if [ ! -f "$NGINX_CONFIG_FILE" ]; then
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
    echo_info "File konfigurasi Nginx dibuat."
else
    echo_info "File konfigurasi Nginx sudah ada."
fi

# Aktifkan site dan hapus default
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
echo_info "Menguji dan memulai ulang Nginx..."
nginx -t
systemctl restart nginx

# --- 8. Konfigurasi Firewall (UFW) ---
echo_info "Mengkonfigurasi firewall dengan UFW..."
ufw allow 'Nginx Full'
ufw allow 'OpenSSH'
ufw --force enable

# --- 9. Atur PM2 untuk memulai saat boot ---
echo_info "Mengkonfigurasi PM2 untuk memulai saat sistem reboot..."
env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $RUN_USER --hp $RUN_HOME
sudo -u $RUN_USER pm2 save

echo ""
echo_success "================= PROSES SELESAI ================="
echo "Aplikasi Anda sekarang berjalan dan dikelola oleh PM2."
echo "------------------------------------------------------------"
echo_info "PENTING: ARAHKAN DOMAIN ANDA KE ALAMAT IP SERVER INI."
echo_warn "Untuk mengaktifkan HTTPS (sangat disarankan), jalankan: sudo certbot --nginx"
echo ""
echo "------------------------------------------------------------"
echo_warn "          JIKA TERJADI MASALAH (502 BAD GATEWAY)          "
echo "------------------------------------------------------------"
echo "1. Cek status aplikasi: pm2 status"
echo "2. Lihat log error aplikasi: pm2 logs $APP_NAME"
echo "3. Uji konfigurasi Nginx: sudo nginx -t"
echo "------------------------------------------------------------"
echo ""
echo_success "Deployment selesai! Aplikasi Anda dapat diakses melalui IP server."
