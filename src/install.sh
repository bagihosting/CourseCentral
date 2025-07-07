#!/bin/bash
#
# =================================================================
# Pemasang & Pembaru Otomatis untuk Aplikasi Next.js di Ubuntu 22.04 & 24.04
# Termasuk: Nginx, MariaDB, Node.js, PM2, dan phpMyAdmin.
# Untuk instruksi lengkap, silakan lihat file DEPLOYMENT.md
# =================================================================

# --- Berhenti jika ada kesalahan ---
set -e

# --- Konfigurasi ---
# Port tempat aplikasi Next.js Anda akan berjalan. `next start` default-nya 3000.
APP_PORT=3000
# Nama untuk proses PM2 Anda.
APP_NAME="coursecentral"
# Pengguna yang menjalankan skrip (bukan root)
RUN_USER=$(logname)
RUN_HOME=$(eval echo ~$RUN_USER)
# Lokasi proyek akan dideteksi secara otomatis dari direktori tempat skrip dijalankan.
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

echo_info "Memulai proses instalasi/pembaruan untuk $APP_NAME di direktori $PROJECT_DIR..."

# --- 1. Validasi Lokasi Skrip ---
if [ ! -f "$PROJECT_DIR/schema.sql" ]; then
    echo_error "File 'schema.sql' tidak ditemukan."
    echo_error "Harap jalankan skrip ini dari dalam direktori utama proyek Anda."
    exit 1
fi

# --- 2. Pembaruan Sistem dan Pemasangan Dependensi Awal ---
echo_info "Memperbarui paket sistem dan memasang dependensi..."
apt-get update
apt-get upgrade -y
# Tambahkan psmisc (untuk fuser), phpmyadmin dan dependensi php-nya
apt-get install -y nginx curl build-essential mariadb-server psmisc \
                   phpmyadmin php-fpm php-mysql php-mbstring php-zip php-gd php-json php-curl

# --- 3. Setup Database MariaDB (Metode yang Diperbarui dan Andal) ---
echo_info "Mengkonfigurasi database MariaDB..."
DB_NAME="coursecentral_db"
DB_USER="coursecentral_user"
# Membuat password acak yang aman
DB_PASS=$(openssl rand -base64 12)
DB_ROOT_PASS=$(openssl rand -base64 16)

# Menjalankan semua perintah keamanan dan setup dalam satu sesi menggunakan sudo.
# Ini menggunakan autentikasi soket unix untuk pengguna root OS, yang merupakan metode default dan paling andal.
sudo mariadb --batch <<-EOSQL
  -- Mengatur kata sandi untuk pengguna root MariaDB, membuatnya dapat diakses dengan kata sandi.
  ALTER USER 'root'@'localhost' IDENTIFIED BY '$DB_ROOT_PASS';

  -- Menghapus pengguna anonim untuk keamanan.
  DROP USER IF EXISTS ''@'localhost';

  -- Menghapus database 'test' yang tidak diperlukan.
  DROP DATABASE IF EXISTS test;

  -- Membuat database aplikasi jika belum ada.
  CREATE DATABASE IF NOT EXISTS \`$DB_NAME\`;
  
  -- Membuat pengguna aplikasi dengan kata sandi yang aman.
  CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';
  
  -- Memberikan semua hak kepada pengguna aplikasi untuk database mereka.
  GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'localhost';
  
  -- Memuat ulang hak istimewa untuk menerapkan semua perubahan.
  FLUSH PRIVILEGES;
EOSQL

echo_success "Database dan pengguna berhasil dikonfigurasi."

# --- 4. Impor Skema Database ---
echo_info "Mengimpor skema database dari $PROJECT_DIR/schema.sql..."
# Sekarang kita dapat menggunakan pengguna baru yang kita buat untuk mengimpor skema.
# Ini juga berfungsi sebagai tes bahwa pengguna dan kata sandi berfungsi.
mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$PROJECT_DIR/schema.sql"
echo_success "Skema database berhasil diimpor."


# --- 5. Pasang Node.js & PM2 ---
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

# --- 6. Bangun Aplikasi ---
echo_info "Mengatur kepemilikan file proyek ke pengguna $RUN_USER..."
chown -R $RUN_USER:$RUN_USER "$PROJECT_DIR"

# Menjalankan npm install dan build sebagai pengguna non-root di dalam direktori proyek
echo_info "Memasang dependensi proyek (menjalankan sebagai $RUN_USER)..."
sudo -u "$RUN_USER" bash -c "cd \"$PROJECT_DIR\" && npm install"

echo_info "Membangun aplikasi Next.js untuk produksi (menjalankan sebagai $RUN_USER)..."
sudo -u "$RUN_USER" bash -c "cd \"$PROJECT_DIR\" && npm run build"

# --- 7. Siapkan Variabel Lingkungan (.env.local) ---
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

# --- 8. Mulai Aplikasi dengan PM2 ---
# Hentikan proses apa pun yang mungkin berjalan di port aplikasi
echo_info "Menghentikan proses yang ada di port $APP_PORT (jika ada)..."
fuser -k $APP_PORT/tcp || true

echo_info "Memulai atau me-restart aplikasi dengan PM2..."
# Hapus instance yang ada untuk memastikan awal yang baru
sudo -u "$RUN_USER" pm2 delete "$APP_NAME" || true
# Menjalankan `npm start` dengan --cwd untuk memastikan direktori kerja yang benar.
sudo -u "$RUN_USER" pm2 start npm --name "$APP_NAME" --cwd "$PROJECT_DIR" -- start

# Beri waktu sejenak agar aplikasi dapat memulai sepenuhnya
echo_info "Memberi waktu 2 detik bagi aplikasi untuk memulai..."
sleep 2

# --- 9. Konfigurasi Nginx ---
echo_info "Mengkonfigurasi Nginx sebagai reverse proxy..."
NGINX_CONFIG_FILE="/etc/nginx/sites-available/$APP_NAME"
# Dapatkan versi PHP yang terinstal untuk path socket FPM
PHP_SOCKET_PATH=$(ls /var/run/php/php*-fpm.sock | head -n 1)

if [ -z "$PHP_SOCKET_PATH" ]; then
    echo_error "Tidak dapat menemukan socket PHP-FPM. Instalasi php-fpm mungkin gagal."
    exit 1
fi
echo_info "Menggunakan socket PHP-FPM di: $PHP_SOCKET_PATH"

# Selalu timpa konfigurasi Nginx untuk memastikan yang terbaru
# Konfigurasi ini termasuk block untuk phpMyAdmin
NGINX_CONFIG="
server {
    listen 80;
    listen [::]:80;

    # Ganti 'domainanda.com' dengan nama domain Anda yang sebenarnya
    # Anda bisa melakukannya setelah instalasi dan setelah mengarahkan domain Anda.
    # Untuk awal, '_' sudah cukup untuk menangkap permintaan via IP.
    server_name _;
    
    root /var/www/html;
    index index.html index.htm index.nginx-debian.html;

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

    location /phpmyadmin {
        alias /usr/share/phpmyadmin;
        index index.php;
        
        location ~ ^/phpmyadmin(.+\.php)$ {
            try_files \$uri =404;
            root /usr/share/;
            fastcgi_pass unix:$PHP_SOCKET_PATH;
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
            include fastcgi_params;
        }

        location ~* ^/phpmyadmin(.+\.(jpg|jpeg|gif|css|js))$ {
            root /usr/share/;
        }
    }

    location ~ /\.ht {
        deny all;
    }
}"
echo "$NGINX_CONFIG" > "$NGINX_CONFIG_FILE"
echo_success "File konfigurasi Nginx dibuat/diperbarui dengan dukungan phpMyAdmin."

# Aktifkan site dan hapus default
rm -f /etc/nginx/sites-enabled/default
ln -sf "/etc/nginx/sites-available/$APP_NAME" "/etc/nginx/sites-enabled/"
echo_info "Menguji, mengaktifkan, dan memulai ulang Nginx..."
nginx -t
systemctl enable nginx
systemctl restart nginx

# --- 10. Konfigurasi Firewall (UFW) ---
echo_info "Mengkonfigurasi firewall dengan UFW..."
# Aturan keamanan dasar: tolak semua koneksi masuk secara default, izinkan semua keluar.
ufw default deny incoming
ufw default allow outgoing
# Izinkan koneksi yang diperlukan.
ufw allow 'Nginx Full'
ufw allow 'OpenSSH'
ufw --force enable

# --- 11. Atur PM2 untuk memulai saat boot ---
echo_info "Mengkonfigurasi PM2 untuk memulai saat sistem reboot..."
env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $RUN_USER --hp $RUN_HOME
sudo -u $RUN_USER pm2 save

echo ""
echo_success "================= PROSES SELESAI ================="
echo "Aplikasi Anda sekarang berjalan dan dikelola oleh PM2."
echo ""
echo_warn "================ CREDENTIALS DATABASE (HARAP SIMPAN!) ================"
echo "Kredensial ini juga telah disimpan di $ENV_FILE"
echo "  - Username Database: $DB_USER"
echo "  - Password Database: $DB_PASS"
echo "  - Root Password DB : $DB_ROOT_PASS"
echo "=========================================================================="
echo ""
echo_info "AKSES APLIKASI:"
echo "  - Aplikasi Next.js: http://<ALAMAT_IP_SERVER_ANDA>"
echo "  - phpMyAdmin      : http://<ALAMAT_IP_SERVER_ANDA>/phpmyadmin"
echo ""
echo_info "LANGKAH SELANJUTNYA:"
echo "  1. Edit file .env.local untuk menambahkan GEMINI_API_KEY Anda."
echo "  2. Arahkan nama domain Anda ke alamat IP server ini."
echo "  3. Setelah domain diarahkan, jalankan 'sudo certbot --nginx' untuk mengaktifkan HTTPS."
echo "  4. (Sangat Disarankan) Konfigurasi domain Anda dengan Cloudflare untuk keamanan tambahan."
echo ""
echo_success "Deployment selesai!"
