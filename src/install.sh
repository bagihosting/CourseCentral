
#!/bin/bash
#
# =================================================================
# Pemasang & Pembaru Otomatis untuk Aplikasi Next.js di Ubuntu 20.04, 22.04 & 24.04
# Termasuk: Nginx, MariaDB, Node.js, PM2, phpMyAdmin, Fail2Ban, dan Backup Otomatis.
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
# Tambahkan DEBIAN_FRONTEND untuk mencegah prompt interaktif, meningkatkan keandalan.
DEBIAN_FRONTEND=noninteractive apt-get install -y nginx curl build-essential mariadb-server psmisc \
                   phpmyadmin php-fpm php-mysql php-mbstring php-zip php-gd php-json php-curl

# --- [LANGKAH BARU] Perbaikan Tabel Sistem Database ---
echo_info "Memeriksa dan memperbaiki tabel sistem MariaDB..."
# Perintah ini sangat penting setelah upgrade dan dapat memperbaiki error 'invalid view'.
mariadb-upgrade

# --- 3. Setup Database MariaDB (Metode yang Diperbarui dan Andal) ---
echo_info "Mengkonfigurasi database MariaDB..."
DB_NAME="coursecentral_db"
DB_USER="coursecentral_user"
# Membuat password acak yang aman
DB_PASS=$(openssl rand -base64 12)
DB_ROOT_PASS=$(openssl rand -base64 16)

# Menjalankan semua perintah keamanan dan setup dalam satu sesi menggunakan sudo.
# Ini menggunakan autentikasi soket unix untuk pengguna root OS, yang merupakan metode default dan paling andal.
mariadb --batch <<-EOSQL
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
echo_info "Mengimpor tabel dan data awal dari file 'schema.sql' secara otomatis..."
# Sekarang kita dapat menggunakan pengguna baru yang kita buat untuk mengimpor skema.
# Ini juga berfungsi sebagai tes bahwa pengguna dan kata sandi berfungsi.
mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$PROJECT_DIR/schema.sql"
echo_success "Struktur database dan data awal (termasuk admin default) berhasil diimpor."


# --- 5. Pasang Node.js & PM2 ---
echo_info "Memeriksa instalasi Node.js dan PM2..."
# Menggunakan repositori NodeSource untuk Node.js 20.x (LTS)
if ! command -v node &> /dev/null || [[ $(node -v) != "v20."* ]]; then
    echo_info "Memasang Node.js v20 LTS..."
    # Menjalankan sebagai root, jadi sudo tidak diperlukan di sini
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
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
# Atur domain utama aplikasi Anda di sini setelah deployment
NEXT_PUBLIC_BASE_URL="http://ALAMAT_IP_ATAU_DOMAIN_UTAMA_ANDA"
EOF

chown $RUN_USER:$RUN_USER "$ENV_FILE"
echo_success "File .env.local berhasil dibuat dan diisi otomatis dengan kredensial database."
echo_warn "======================================================================="
echo_warn "                                                                       "
echo_warn "  ██████╗  █████╗ ███╗   ███╗████████╗██╗███╗   ██╗ ██╗  ██╗             "
echo_warn "  ██╔══██╗██╔══██╗████╗ ████║╚══██╔══╝██║████╗  ██║ ██║  ██║             "
echo_warn "  ██████╔╝███████║██╔████╔██║   ██║   ██║██╔██╗ ██║ ███████║             "
echo_warn "  ██╔═══╝ ██╔══██║██║╚██╔╝██║   ██║   ██║██║╚██╗██║ ██╔══██║             "
echo_warn "  ██║     ██║  ██║██║ ╚═╝ ██║   ██║   ██║██║ ╚████║ ██║  ██║             "
echo_warn "  ╚═╝     ╚═╝  ╚═╝╚═╝     ╚═╝   ╚═╝   ╚═╝╚═╝  ╚═══╝ ╚═╝  ╚═╝             "
echo_warn "                                                                       "
echo_warn "  PENTING: Aplikasi Anda tidak akan berjalan tanpa Kunci API Gemini!  "
echo_warn "  Harap edit file '$ENV_FILE' dan tambahkan GEMINI_API_KEY Anda.    "
echo_warn "  Juga, jangan lupa untuk mengatur NEXT_PUBLIC_BASE_URL Anda!         "
echo_warn "                                                                       "
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
# Dengan sistem multitenancy, kita hanya perlu wildcard `_` untuk menangkap semua domain.
# Aplikasi Next.js (middleware) akan menangani routing berdasarkan Host header.
NGINX_CONFIG="
server {
    listen 80;
    listen [::]:80;

    # Tangkap semua domain/subdomain yang diarahkan ke IP ini.
    # Logika routing ditangani oleh aplikasi Next.js (middleware).
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
echo_success "File konfigurasi Nginx dibuat/diperbarui dengan dukungan multitenancy."

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

# --- 11. Pengerasan Keamanan dengan Fail2Ban ---
echo_info "Menginstal dan mengkonfigurasi Fail2Ban untuk proteksi otomatis terhadap serangan..."
apt-get install -y fail2ban

# Membuat file konfigurasi lokal untuk menimpa default
FAIL2BAN_JAIL_LOCAL_FILE="/etc/fail2ban/jail.local"
echo_info "Membuat file konfigurasi kustom di $FAIL2BAN_JAIL_LOCAL_FILE..."
cat > "$FAIL2BAN_JAIL_LOCAL_FILE" << EOF
[DEFAULT]
# Waktu dalam detik. 1h = 3600, 1d = 86400.
# Kita akan memblokir penyerang selama 1 hari.
bantime = 1d
# Jendela waktu untuk mendeteksi serangan (misal: 10 menit)
findtime = 10m
# Jumlah percobaan gagal sebelum IP diblokir
maxretry = 5
# Backend yang digunakan (auto biasanya sudah cukup)
banaction = ufw

[sshd]
enabled = true

# Jail untuk melindungi dari serangan HTTP umum
[nginx-http-auth]
enabled = true
port = http,https

# Jail untuk memblokir bot jahat dan pemindai kerentanan
[nginx-botsearch]
enabled = true
port = http,https

# Jail untuk mitigasi serangan DDoS sederhana
[nginx-ddos]
enabled = true
port = http,https
# Filter ini mencari koneksi yang sangat cepat dari satu IP
# Atur maxretry lebih tinggi untuk menghindari pemblokiran pengguna normal
# misal: 100 permintaan dalam 1 menit
findtime = 1m
maxretry = 100
EOF

echo_success "Konfigurasi Fail2Ban kustom telah dibuat."
echo_info "Memulai ulang Fail2Ban untuk menerapkan aturan baru..."
systemctl restart fail2ban
systemctl enable fail2ban

# --- 12. Setup Backup Database Otomatis ---
echo_info "Mengkonfigurasi backup database otomatis..."
# Membuat direktori backup yang aman (tidak dapat diakses web)
mkdir -p /var/backups/mariadb

# Membuat file kredensial yang aman untuk mysqldump
echo_info "Membuat file kredensial .my.cnf yang aman..."
cat > /root/.my.cnf << EOF
[mysqldump]
user=$DB_USER
password=$DB_PASS
host=127.0.0.1
[mysql]
user=$DB_USER
password=$DB_PASS
host=127.0.0.1
EOF
chmod 600 /root/.my.cnf
echo_success "File .my.cnf berhasil dibuat dengan izin yang aman."

# Membuat skrip backup
echo_info "Membuat skrip backup..."
BACKUP_SCRIPT_PATH="/usr/local/bin/backup_mariadb.sh"
cat > "$BACKUP_SCRIPT_PATH" << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/mariadb"
DB_NAME="coursecentral_db"
TIMESTAMP=$(date +"%Y-%m-%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/$DB_NAME-$TIMESTAMP.sql.gz"
RETENTION_DAYS=7

echo "Memulai backup untuk database '$DB_NAME'..."
# Menggunakan file .my.cnf secara implisit karena berada di /root
mysqldump "$DB_NAME" | gzip > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "Backup berhasil disimpan ke: $BACKUP_FILE"
else
  echo "ERROR: Backup database gagal." >&2
  exit 1
fi

echo "Membersihkan backup yang lebih tua dari $RETENTION_DAYS hari..."
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +$RETENTION_DAYS -exec rm -f {} \;
echo "Pembersihan selesai."
EOF
chmod +x "$BACKUP_SCRIPT_PATH"
echo_success "Skrip backup telah dibuat di $BACKUP_SCRIPT_PATH"

# Membuat cron job
echo_info "Menjadwalkan backup otomatis harian..."
cat > /etc/cron.d/coursecentral_backup << EOF
# Backup otomatis harian untuk database CourseCentral
30 2 * * * root $BACKUP_SCRIPT_PATH >> /var/log/backup_mariadb.log 2>&1
EOF
chmod 0644 /etc/cron.d/coursecentral_backup
systemctl restart cron
echo_success "Backup otomatis telah dijadwalkan setiap hari pukul 02:30."

# --- 13. Atur PM2 untuk memulai saat boot ---
echo_info "Mengkonfigurasi PM2 untuk memulai saat sistem reboot..."
# Perintah 'pm2 startup' akan menghasilkan perintah yang perlu dijalankan sebagai root.
# Kita menangkap outputnya dan menjalankannya.
# 'env PATH=$PATH...' diperlukan agar pm2 dapat menemukan node.
STARTUP_COMMAND=$(sudo -u "$RUN_USER" env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup | tail -n 1)
if [ -n "$STARTUP_COMMAND" ]; then
    echo "Menjalankan perintah startup PM2: $STARTUP_COMMAND"
    eval "$STARTUP_COMMAND"
fi
sudo -u "$RUN_USER" pm2 save
echo_success "PM2 startup berhasil dikonfigurasi."

echo ""
echo_success "================= PROSES SELESAI ================="
echo "Aplikasi Anda sekarang berjalan dan dikelola oleh PM2."
echo_info "PM2 telah dikonfigurasi untuk memulai aplikasi secara otomatis saat server reboot."
echo ""
echo_warn "=============== INFORMASI PENTING (HARAP SIMPAN!) ==============="
echo "Kredensial Login Aplikasi (Default):"
echo "  - Username        : admin"
echo "  - Password        : password"
echo ""
echo "Kredensial Database (Disimpan di $ENV_FILE):"
echo "  - Username DB     : $DB_USER"
echo "  - Password DB     : $DB_PASS"
echo "  - Root Password DB: $DB_ROOT_PASS (Untuk akses phpMyAdmin)"
echo "===================================================================="
echo ""
echo_info "AKSES APLIKASI:"
echo "  - Aplikasi Next.js: http://<ALAMAT_IP_SERVER_ANDA>"
echo "  - Login Aplikasi  : Gunakan username 'admin' dan password 'password'."
echo "  - phpMyAdmin      : http://<ALAMAT_IP_SERVER_ANDA>/phpmyadmin"
echo ""
echo_info "LANGKAH SELANJUTNYA:"
echo "  1. SEGERA UBAH PASSWORD ADMIN DEFAULT setelah login pertama kali."
echo "  2. Edit file .env.local untuk menambahkan GEMINI_API_KEY Anda."
echo "  3. Edit file .env.local untuk mengatur NEXT_PUBLIC_BASE_URL Anda dengan domain utama."
echo "  4. Arahkan nama domain Anda (dan wildcard *.domainanda.com) ke alamat IP server ini."
echo "  5. Setelah domain diarahkan, jalankan 'sudo certbot --nginx' untuk mengaktifkan HTTPS."
echo "  6. (Sangat Disarankan) Konfigurasi domain Anda dengan Cloudflare untuk keamanan tambahan."
echo ""
echo_success "Deployment selesai!"
