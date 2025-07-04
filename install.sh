#!/bin/bash
#
# =================================================================
# Pemasang Otomatis untuk Aplikasi Next.js di Ubuntu 24.04
#
# Disesuaikan untuk: CourseCentral
#
# Skrip ini akan:
# 1. Mengkloning repositori dari GitHub (termasuk repositori pribadi via Deploy Key).
# 2. Memperbarui sistem dan memasang paket yang diperlukan (Nginx, Git).
# 3. Memasang Node.js (versi LTS) dan PM2.
# 4. Mengkonfigurasi Nginx sebagai reverse proxy untuk aplikasi Next.js.
# 5. Menyiapkan firewall dengan UFW.
# 6. Membuat file .env untuk variabel lingkungan.
# 7. Membangun dan memulai aplikasi menggunakan PM2 agar berjalan di latar belakang.
#
# Penggunaan:
# 1. Letakkan skrip ini di direktori home pengguna Anda di VPS (misal: /home/ubuntu).
# 2. Jadikan skrip ini dapat dieksekusi: chmod +x install.sh
# 3. Jalankan dengan sudo: sudo ./install.sh
# =================================================================

# --- Berhenti jika ada kesalahan ---
set -e

# --- Konfigurasi ---
# GANTI DENGAN URL KLONING SSH REPOSITORI PRIBADI ANDA
# Contoh: git@github.com:username/nama-repo.git
GITHUB_SSH_URL="git@github.com:username/your-private-repo.git"
# Ekstrak nama direktori dari URL untuk digunakan nanti
REPO_NAME=$(basename -s .git "$GITHUB_SSH_URL")

# Port tempat aplikasi Next.js Anda akan berjalan. `next start` default-nya 3000.
APP_PORT=3000
# Nama untuk proses PM2 Anda.
APP_NAME="CourseCentral"
# Pengguna yang menjalankan skrip (bukan root)
RUN_USER=$(logname)
RUN_HOME=$(eval echo ~$RUN_USER)
# Direktori proyek akan diatur setelah kloning
PROJECT_DIR="$RUN_HOME/$REPO_NAME"


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

# --- 0. Penyiapan dan Kloning dari GitHub ---
echo_info "Memeriksa konfigurasi untuk kloning dari GitHub..."
if [[ "$GITHUB_SSH_URL" == "git@github.com:username/your-private-repo.git" ]]; then
    echo_error "KESALAHAN: Anda harus mengedit skrip ini dan mengatur variabel GITHUB_SSH_URL."
    echo_warn "Silakan isi dengan URL Kloning SSH dari repositori GitHub Anda."
    exit 1
fi

echo_info "Tutorial: Cara Mengkloning dari Repositori GitHub Pribadi"
echo "==================================================================="
echo "Untuk mengkloning dari repositori pribadi, Anda memerlukan 'Deploy Key' SSH."
echo "Ikuti langkah-langkah ini jika Anda belum melakukannya:"
echo "  1. DI VPS ANDA, jalankan perintah ini untuk membuat kunci SSH baru:"
echo "     ssh-keygen -t ed25519 -C \"email@anda.com\""
echo "     (Tekan Enter untuk semua pertanyaan yang muncul, jangan atur kata sandi)"
echo ""
echo "  2. Tampilkan kunci publik Anda dengan menjalankan:"
echo "     cat ~/.ssh/id_ed25519.pub"
echo ""
echo "  3. Salin seluruh output dari perintah di atas (mulai dari 'ssh-ed25519' sampai akhir)."
echo ""
echo "  4. DI GITHUB, buka repositori pribadi Anda, lalu navigasi ke:"
echo "     'Settings' > 'Deploy Keys' (di sidebar kiri) > 'Add deploy key'."
echo ""
echo "  5. Beri judul (misal: 'VPS Produksi'), tempel kunci yang sudah Anda salin,"
echo "     JANGAN centang 'Allow write access', lalu klik 'Add key'."
echo "==================================================================="
echo ""
read -p "Tekan [Enter] untuk melanjutkan setelah Anda menambahkan Deploy Key ke GitHub..."

# Pindah ke direktori home pengguna untuk kloning
cd "$RUN_HOME"

# Hapus direktori lama jika ada
if [ -d "$REPO_NAME" ]; then
    echo_warn "Menghapus direktori repositori lama yang mungkin ada: $REPO_NAME"
    rm -rf "$REPO_NAME"
fi

echo_info "Mengkloning repositori dari $GITHUB_SSH_URL..."
# Jalankan git clone sebagai pengguna non-root untuk memastikan izin file yang benar
sudo -u "$RUN_USER" git clone "$GITHUB_SSH_URL"

# Pindah ke direktori proyek yang baru dikloning
cd "$PROJECT_DIR"
echo_info "Berpindah ke direktori proyek: $PROJECT_DIR"


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


# --- 6. Siapkan Variabel Lingkungan (.env) ---
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


# --- 7. Mulai Aplikasi dengan PM2 ---
echo_info "Memulai aplikasi dengan PM2..."
# PM2 adalah manajer proses yang akan menjaga aplikasi tetap berjalan di latar belakang.
# Hapus instance yang ada untuk memastikan awal yang baru
sudo -u "$RUN_USER" pm2 delete "$APP_NAME" || true
# `pm2 start` secara otomatis menjalankan aplikasi di latar belakang.
# Menjalankan sebagai pengguna non-root dan secara eksplisit mengatur direktori kerja (CWD)
sudo -u "$RUN_USER" pm2 start npm --name "$APP_NAME" --cwd "$PROJECT_DIR" -- start -p "$APP_PORT"


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

# Hapus konfigurasi Nginx default dan aktifkan konfigurasi aplikasi kita
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
