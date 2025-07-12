#!/bin/bash
#
# =================================================================
# Autoinstaller Cerdas & Andal untuk Aplikasi Next.js
# Distro: Debian 11/12 & Ubuntu 20.04/22.04/24.04
# Fokus: Nginx, Node.js v20, PM2, Fail2Ban.
# Database tidak lagi diinstal oleh skrip ini.
# =================================================================

# --- Berhenti jika ada kesalahan ---
set -e

# --- Konfigurasi & Variabel Inti ---
APP_PORT=3000
APP_NAME="coursecentral"
RUN_USER="sadewa" # Disesuaikan sesuai permintaan
PROJECT_DIR="/opt/coursecentral" # Path absolut untuk konsistensi
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
echo_info "Memasang dependensi: Nginx, Node.js, Fail2Ban..."
sudo apt-get install -y nginx curl build-essential psmisc fail2ban

# Konfigurasi Fail2Ban
echo_info "Mengaktifkan proteksi Fail2Ban untuk SSH..."
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local &>/dev/null || true
sudo sed -i '/^\[sshd\]/a enabled = true' /etc/fail2ban/jail.local
sudo systemctl enable --now fail2ban
echo_success "Fail2Ban aktif dan memonitor SSH."

# --- 2. Pasang Node.js & PM2 ---
echo_info "Memasang Node.js v20 LTS dan PM2..."
if ! command -v node &> /dev/null || [[ $(node -v) != "v20."* ]]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
    sudo apt-get install -y nodejs
fi
sudo npm install -g pm2

# --- 3. Bangun Aplikasi (Sebagai Pengguna Non-Root) ---
echo_info "Mengatur kepemilikan file proyek ke pengguna '$RUN_USER'..."
# Pastikan direktori proyek ada sebelum mengubah kepemilikan
sudo mkdir -p "$PROJECT_DIR"
sudo chown -R $RUN_USER:$RUN_USER "$PROJECT_DIR"

echo_info "Memasang dependensi proyek (menjalankan sebagai '$RUN_USER')..."
sudo -u "$RUN_USER" bash -c "cd \"$(pwd)\" && npm install"

echo_info "Membangun aplikasi Next.js untuk produksi (menjalankan sebagai '$RUN_USER')..."
sudo -u "$RUN_USER" bash -c "cd \"$(pwd)\" && npm run build"

# --- 4. Siapkan Variabel Lingkungan ---
echo_info "Membuat file .env.local dari .env.example..."
ENV_FILE="$(pwd)/.env.local"
if [ ! -f "$ENV_FILE" ]; then
    cp "$(pwd)/.env.example" "$ENV_FILE"
    # Perbarui NEXT_PUBLIC_BASE_URL di file .env.local
    sed -i "s|^NEXT_PUBLIC_BASE_URL=.*|NEXT_PUBLIC_BASE_URL=http://${SERVER_IP}|" "$ENV_FILE"
    sudo chown $RUN_USER:$RUN_USER "$ENV_FILE"
    echo_success "File .env.local telah dibuat. Harap isi detailnya."
else
    echo_warning "File .env.local sudah ada, tidak menimpa."
fi

# --- 5. Jalankan Aplikasi dengan PM2 (Sebagai Pengguna Non-Root) ---
echo_info "Menjalankan aplikasi '$APP_NAME' dengan PM2..."
PM2_PATH=$(which pm2)
sudo -u "$RUN_USER" "$PM2_PATH" delete "$APP_NAME" || true
sudo -u "$RUN_USER" bash -c "cd \"$(pwd)\" && \"$PM2_PATH\" start npm --name \"$APP_NAME\" -- start"
sudo -u "$RUN_USER" "$PM2_PATH" save
sudo env PATH=$PATH:/usr/bin "$PM2_PATH" startup -u "$RUN_USER" --hp "/opt"
echo_success "Aplikasi berjalan di bawah PM2."

# --- 6. Konfigurasi Nginx (Reverse Proxy) ---
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
echo "  1. Buka file '.env.local' untuk mengisi kredensial database dan GEMINI_API_KEY Anda."
echo "     (Gunakan: sudo nano .env.local)"
echo "  2. Pastikan database Anda dapat diakses dari server ini dan impor file 'schema.sql' secara manual."
echo "  3. Setelah mengisi .env.local, restart aplikasi dengan: pm2 restart $APP_NAME"
echo "  4. (Sangat Disarankan) Konfigurasi domain Anda dengan Cloudflare untuk keamanan dan HTTPS."
echo ""
echo_success "Deployment aplikasi selesai!"
