#!/bin/bash
#
# =================================================================
# Autoinstaller Cerdas & Andal untuk Aplikasi Next.js di Ubuntu
# Fokus: Nginx, MariaDB, Node.js v20, PM2.
# Dirancang untuk keandalan maksimal, bahkan pada sistem yang rusak.
# =================================================================

# --- Berhenti jika ada kesalahan ---
set -e

# --- Konfigurasi & Variabel Inti ---
APP_PORT=3000
APP_NAME="coursecentral"
# Mengambil nama pengguna yang menjalankan sudo, bukan 'root'
RUN_USER=${SUDO_USER:-$(logname)}
PROJECT_DIR=$(pwd)
DB_NAME="coursecentral_db"
DB_USER="coursecentral_user"
# Membuat password acak yang kuat untuk database
DB_PASS=$(openssl rand -base64 12)
# Dapatkan alamat IP publik utama server
SERVER_IP=$(hostname -I | awk '{print $1}')


# --- Fungsi Bantuan untuk Logging ---
echo_info() { echo -e "\033[1;34m[INFO]\033[0m $1"; }
echo_success() { echo -e "\033[1;32m[SUCCESS]\033[0m $1"; }
echo_error() { echo -e "\033[1;31m[ERROR]\033[0m $1"; }

# --- Verifikasi Awal & Ketergantungan Path Absolut ---
if [ "$(id -u)" -ne 0 ]; then
  echo_error "Skrip ini harus dijalankan dengan 'sudo'. Contoh: 'sudo ./install.sh'"
  exit 1
fi

if [ ! -f "$PROJECT_DIR/schema.sql" ]; then
    echo_error "File 'schema.sql' tidak ditemukan. Pastikan Anda menjalankan skrip ini dari dalam direktori utama proyek."
    exit 1
fi

echo_info "Memulai proses instalasi cerdas untuk $APP_NAME di Ubuntu..."
echo_info "Aplikasi akan dijalankan oleh pengguna: $RUN_USER"

# --- BLOK PEMULIHAN SISTEM OTOMATIS (DPKG/APT REPAIR) ---
echo_info "Memeriksa dan memastikan integritas manajer paket (dpkg/apt)..."
# Membersihkan lock file yang mungkin tersisa dari proses yang gagal
rm -f /var/lib/dpkg/lock*
rm -f /var/cache/apt/archives/lock
# Mencoba memulihkan file status dpkg jika rusak atau hilang
if [ ! -f /var/lib/dpkg/status ]; then
    echo_info "File status dpkg tidak ditemukan. Mencoba memulihkan dari cadangan..."
    if [ -f /var/lib/dpkg/status-old ]; then
        cp /var/lib/dpkg/status-old /var/lib/dpkg/status
        echo_success "Berhasil memulihkan dari status-old."
    elif [ -f /var/backups/dpkg.status.0 ]; then
        cp /var/backups/dpkg.status.0 /var/lib/dpkg/status
        echo_success "Berhasil memulihkan dari cadangan utama."
    else
        echo_info "Tidak ada cadangan ditemukan. Membuat file status baru yang kosong."
        touch /var/lib/dpkg/status
    fi
fi
# Memaksa konfigurasi ulang paket yang tertunda
dpkg --configure -a
# Mencoba memperbaiki dependensi yang rusak sebagai langkah terakhir
apt-get --fix-broken install -y
apt-get update
echo_success "Manajer paket dalam keadaan siap."
# --- AKHIR BLOK PEMULIHAN ---

# --- 1. Pembaruan Sistem dan Pemasangan Dependensi Inti ---
echo_info "Memasang dependensi inti: Nginx, MariaDB, Node.js..."
DEBIAN_FRONTEND=noninteractive apt-get install -y \
    nginx curl build-essential mariadb-server mariadb-client psmisc

# --- 2. Setup Database MariaDB (Metode Andal) ---
echo_info "Mengkonfigurasi database MariaDB..."
systemctl start mariadb
systemctl enable mariadb

# Mengamankan MariaDB dan membuat database dalam satu blok perintah yang andal
# Ini adalah cara yang paling kuat dan direkomendasikan untuk setup otomatis
mariadb --execute="
  UPDATE mysql.user SET Password=PASSWORD('$DB_PASS') WHERE User='root';
  DELETE FROM mysql.user WHERE User='';
  DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
  DROP DATABASE IF EXISTS test;
  DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';
  CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';
  GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '$DB_USER'@'localhost';
  FLUSH PRIVILEGES;
"
echo_success "Database '$DB_NAME' dan pengguna '$DB_USER' berhasil dibuat."

# --- 3. Impor Skema Database ---
echo_info "Mengimpor data dari 'schema.sql'..."
mariadb -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$PROJECT_DIR/schema.sql"
echo_success "Struktur database dan data awal berhasil diimpor."

# --- 4. Pasang Node.js & PM2 ---
echo_info "Memasang Node.js v20 LTS dan PM2..."
# Hanya menginstal jika 'node' belum ada atau versinya bukan v20
if ! command -v node &> /dev/null || [[ $(node -v) != "v20."* ]]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
# Menginstal PM2 secara global menggunakan npm
npm install -g pm2

# --- 5. Bangun Aplikasi ---
echo_info "Mengatur kepemilikan file proyek ke pengguna $RUN_USER..."
chown -R $RUN_USER:$RUN_USER "$PROJECT_DIR"

echo_info "Memasang dependensi proyek (menjalankan sebagai $RUN_USER)..."
# Menjalankan npm install sebagai pengguna non-root
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
NEXT_PUBLIC_BASE_URL="http://${SERVER_IP}"
EOF
chown $RUN_USER:$RUN_USER "$ENV_FILE"
echo_success "File .env.local berhasil dibuat dan diisi dengan alamat IP Anda: $SERVER_IP"

# --- 7. Mulai Aplikasi dengan PM2 ---
echo_info "Menghentikan proses yang ada di port $APP_PORT (jika ada)..."
fuser -k $APP_PORT/tcp || true

echo_info "Memulai atau me-restart aplikasi '$APP_NAME' dengan PM2..."
# Cari path PM2 secara dinamis untuk keandalan
PM2_PATH=$(which pm2)
# Hapus proses PM2 dengan nama yang sama jika ada
sudo -u "$RUN_USER" "$PM2_PATH" delete "$APP_NAME" || true
# Menjalankan aplikasi sebagai $RUN_USER dengan path PM2 yang benar
sudo -u "$RUN_USER" bash -c "cd \"$PROJECT_DIR\" && \"$PM2_PATH\" start npm --name \"$APP_NAME\" -- start"

echo_info "Mengatur PM2 agar berjalan saat server startup..."
# Menemukan path absolut untuk Node
NODE_PATH=$(which node)
# Menjalankan perintah startup PM2 dengan path yang benar
env PATH=$NODE_PATH:$PATH "$PM2_PATH" startup -u "$RUN_USER" --hp "/home/$RUN_USER"

# Menyimpan daftar proses PM2 saat ini
sudo -u "$RUN_USER" "$PM2_PATH" save
echo_success "Aplikasi berhasil dijalankan dengan PM2."

# --- 8. Konfigurasi Nginx ---
echo_info "Mengkonfigurasi Nginx sebagai reverse proxy..."
NGINX_CONFIG="
server {
    listen 80;
    listen [::]:80;
    server_name ${SERVER_IP} _; # Mendengarkan pada IP server dan sebagai default
    
    root /var/www/html;
    index index.html index.htm;

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
    
    location ~ /\.ht {
        deny all;
    }
}"
echo "$NGINX_CONFIG" > "/etc/nginx/sites-available/$APP_NAME"

# Menghapus link Nginx default jika ada untuk menghindari konflik
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
echo "  - http://${SERVER_IP}"
echo ""
echo_info "LANGKAH SELANJUTNYA YANG SANGAT PENTING:"
echo "  1. Edit file '$ENV_FILE' untuk menambahkan GEMINI_API_KEY Anda."
echo "     (Gunakan: nano .env.local)"
echo "  2. Jika Anda menggunakan domain, edit NEXT_PUBLIC_BASE_URL di file yang sama."
echo "  3. (Sangat Disarankan) Konfigurasi domain Anda dengan Cloudflare untuk keamanan dan HTTPS."
echo ""
echo_info "INFORMASI DATABASE (SIMPAN DI TEMPAT AMAN):"
echo "  - Nama Database: $DB_NAME"
echo "  - Pengguna Database: $DB_USER"
echo "  - Password Database: $DB_PASS"
echo ""
echo_success "Deployment selesai!"
