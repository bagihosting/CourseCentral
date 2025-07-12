# Panduan Lengkap Instalasi & Deployment

Dokumen ini berisi metode untuk development dan deployment aplikasi Next.js Anda.

- **Metode 0** adalah untuk menjalankan aplikasi di komputer **lokal** Anda untuk development. **Mulai dari sini jika Anda baru pertama kali menjalankan proyek.**
- **Metode 1** adalah **panduan manual langkah-demi-langkah** untuk deployment di server VPS menggunakan Nginx dan PM2.
- **Metode 2** adalah cara modern menggunakan Docker dan Portainer, yang sangat direkomendasikan untuk skalabilitas dan kemudahan pengelolaan.
- **Metode Keamanan (Sangat Direkomendasikan)** menjelaskan cara menggunakan Cloudflare untuk proteksi DDoS, anti-scraping, dan menyembunyikan IP asli server Anda.
- **Backup & Restore Database (Penting)** menjelaskan fitur backup otomatis dan cara melakukan restore.

---

## Metode 0: Development di Komputer Lokal

Gunakan metode ini untuk menjalankan aplikasi di laptop/PC Anda. Anda memerlukan aplikasi server lokal seperti **XAMPP** atau **Laragon**.

### Prasyarat
- **Node.js**: Pastikan Node.js (versi 20 atau lebih baru) sudah terinstal.
- **Server Lokal**: Pastikan Anda sudah menginstal dan menjalankan **XAMPP** atau **Laragon**. Pastikan service **Apache** dan **MySQL** sudah berjalan.
- **Kode Proyek**: Anda sudah memiliki folder kode proyek ini.

### Langkah 1: Setup Database
1. Buka `phpMyAdmin` dari panel kontrol XAMPP/Laragon Anda.
2. Buat database baru dengan nama `coursecentral_db`. Pastikan collation diatur ke `utf8mb4_unicode_ci`.
3. Setelah database dibuat, klik tab "SQL" atau "Import".
4. Buka file `schema.sql` dari folder proyek Anda, salin seluruh isinya, dan tempelkan ke dalam kotak teks SQL, lalu jalankan. Ini akan membuat semua tabel yang diperlukan beserta **data admin default (username: `admin`, password: `password`)**.

### Langkah 2: Konfigurasi File Environment
1. Di folder utama proyek, buat salinan dari file `.env.example` dan ganti namanya menjadi `.env.local`.
2. Buka file `.env.local` yang baru Anda buat.
3. Isi `GEMINI_API_KEY` dengan API key Anda.
4. Pastikan detail koneksi database sudah benar untuk setup lokal Anda. Untuk XAMPP/Laragon standar, konfigurasinya biasanya adalah:
   ```env
   # .env.local

   GEMINI_API_KEY="PASTE_YOUR_GEMINI_API_KEY_HERE"
   
   # Detail koneksi database untuk development lokal
   DB_HOST="127.0.0.1"
   DB_PORT="3306"
   DB_USER="root"
   DB_PASSWORD=""
   DB_NAME="coursecentral_db"
   NEXT_PUBLIC_BASE_URL="http://localhost:3000"
   ```
   Jika password `root` MySQL Anda berbeda, silakan sesuaikan `DB_PASSWORD`.

### Langkah 3: Jalankan Aplikasi
1. Buka terminal atau command prompt di dalam folder proyek Anda.
2. Jalankan perintah `npm install` untuk menginstal semua dependensi.
3. Setelah selesai, jalankan `npm run dev` untuk memulai server development.
4. Buka browser dan akses `http://localhost:3000`.

### Troubleshooting: Error `ECONNREFUSED`
Jika Anda melihat error `ECONNREFUSED` di konsol, itu artinya:
- **MySQL Anda tidak berjalan.** Pastikan service tersebut aktif di XAMPP atau Laragon.
- **Port atau Host salah.** Pastikan `DB_HOST` dan `DB_PORT` di file `.env.local` Anda sudah sesuai dengan konfigurasi MySQL di komputer Anda. Konsol terminal juga akan memberikan petunjuk spesifik saat aplikasi dimulai.

---

## Metode 1: Instalasi Manual di VPS (Nginx + PM2)

Gunakan panduan ini untuk melakukan instalasi dari nol di server **Ubuntu** (20.04, 22.04, atau 24.04).

### Langkah 1: Persiapan Server Awal
1.  **Update Sistem**: Masuk ke server Anda melalui SSH, dan jalankan perintah berikut untuk memastikan semua paket sistem terbaru:
    ```bash
    sudo apt update && sudo apt upgrade -y
    ```
2.  **Instal Dependensi Inti**: Instal Nginx, MySQL, dan dependensi lain yang dibutuhkan.
    ```bash
    sudo apt install -y nginx mysql-server mysql-client curl build-essential psmisc unzip
    ```
3.  **Instal Node.js v20**:
    ```bash
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    ```
4.  **Instal PM2**: PM2 adalah manajer proses yang akan menjaga aplikasi Anda tetap berjalan.
    ```bash
    sudo npm install -g pm2
    ```

### Langkah 2: Konfigurasi Database MySQL
1.  **Amankan MySQL**: Jalankan skrip keamanan interaktif untuk mengatur kata sandi `root`, menghapus pengguna anonim, dll.
    ```bash
    sudo mysql_secure_installation
    ```
    - Saat diminta kata sandi `root` saat ini, tekan Enter (karena belum ada).
    - Jawab `Y` (Yes) untuk semua pertanyaan selanjutnya untuk menerapkan pengaturan keamanan standar.
2.  **Buat Database & Pengguna**:
    - Masuk ke MySQL sebagai `root`: `sudo mysql -u root -p` (masukkan kata sandi root yang baru Anda buat).
    - Jalankan perintah SQL berikut satu per satu. **Ganti `password_yang_kuat`** dengan kata sandi yang aman.
      ```sql
      CREATE DATABASE coursecentral_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      CREATE USER 'coursecentral_user'@'localhost' IDENTIFIED BY 'password_yang_kuat';
      GRANT ALL PRIVILEGES ON coursecentral_db.* TO 'coursecentral_user'@'localhost';
      FLUSH PRIVILEGES;
      EXIT;
      ```

### Langkah 3: Unggah & Siapkan Aplikasi
1.  **Unggah File**: Kompres folder proyek Anda di lokal menjadi `project.zip`, lalu unggah ke server menggunakan `scp` atau FileZilla. Ekstrak file tersebut di server di `/opt/coursecentral`.
    ```bash
    # Di server Anda
    sudo mkdir -p /opt/coursecentral
    sudo mv /path/to/your/project.zip /opt/coursecentral/
    cd /opt/coursecentral
    sudo unzip project.zip
    ```
2.  **Impor Skema Database**: Masuk ke folder proyek Anda dan impor `schema.sql`:
    ```bash
    # Masih di dalam /opt/coursecentral
    mysql -u coursecentral_user -p coursecentral_db < schema.sql
    ```
3.  **Konfigurasi Environment**:
    - Buat file `.env.local` dari contoh: `cp .env.example .env.local`
    - Buka file tersebut: `nano .env.local`
    - Isi semua detailnya, terutama detail database yang baru Anda buat. `DB_HOST` harus `127.0.0.1`.
      ```env
      GEMINI_API_KEY="PASTE_YOUR_GEMINI_API_KEY_HERE"
      DB_HOST="127.0.0.1"
      DB_PORT="3306"
      DB_USER="coursecentral_user"
      DB_PASSWORD="password_yang_kuat_yang_anda_buat_tadi"
      DB_NAME="coursecentral_db"
      NEXT_PUBLIC_BASE_URL="http://ALAMAT_IP_SERVER_ANDA"
      ```
4.  **Atur Kepemilikan (Penting)**: Pastikan pengguna non-root dapat mengakses file.
    ```bash
    # Ganti 'sadewa' dengan username non-root Anda jika berbeda
    sudo chown -R sadewa:sadewa /opt/coursecentral 
    ```
5.  **Instal Dependensi & Build Aplikasi**:
    ```bash
    # Jalankan sebagai pengguna non-root yang sesuai (sadewa)
    sudo -u sadewa bash -c 'cd /opt/coursecentral && npm install'
    sudo -u sadewa bash -c 'cd /opt/coursecentral && npm run build'
    ```

### Langkah 4: Jalankan Aplikasi dengan PM2
1.  **Mulai Aplikasi**: Dari dalam folder proyek Anda, jalankan sebagai pengguna non-root:
    ```bash
    # Pastikan Anda bukan root. Jika iya, jalankan `su - sadewa`
    cd /opt/coursecentral
    pm2 start npm --name "coursecentral" -- start
    ```
2.  **Simpan Proses**: Agar aplikasi berjalan otomatis saat server reboot, jalankan:
    ```bash
    pm2 save
    pm2 startup
    ```
    Salin dan tempel perintah output dari `pm2 startup` untuk menyelesaikannya.

### Langkah 5: Konfigurasi Nginx sebagai Reverse Proxy
1.  **Buat File Konfigurasi Baru**:
    ```bash
    sudo nano /etc/nginx/sites-available/coursecentral
    ```
2.  **Tempelkan Konfigurasi Berikut**: Ganti `ALAMAT_IP_SERVER_ANDA` dengan IP server Anda.
    ```nginx
    server {
        listen 80;
        listen [::]:80;
        server_name ALAMAT_IP_SERVER_ANDA www.domainanda.com domainanda.com; # Ganti dengan IP atau domain Anda

        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
    ```
3.  **Aktifkan Situs & Uji Konfigurasi**:
    ```bash
    # Buat tautan simbolis untuk mengaktifkan konfigurasi
    sudo ln -s /etc/nginx/sites-available/coursecentral /etc/nginx/sites-enabled/
    
    # Hapus konfigurasi default untuk menghindari konflik
    sudo rm /etc/nginx/sites-enabled/default
    
    # Uji konfigurasi Nginx
    sudo nginx -t
    
    # Jika OK, restart Nginx
    sudo systemctl restart nginx
    ```
4.  **Selesai!** Aplikasi Anda sekarang dapat diakses melalui alamat IP server Anda. Lanjutkan ke **Metode Keamanan Server** untuk mengaktifkan domain dan HTTPS.

---

## Metode 2: Deployment menggunakan Docker & Portainer (Disarankan)

Metode ini mengemas aplikasi dan database MySQL Anda ke dalam sebuah kontainer Docker, yang kemudian dikelola melalui antarmuka web Portainer. Ini adalah pendekatan yang lebih modern, terisolasi, dan andal.

### Prasyarat

- Server dengan **Docker** dan **Portainer** yang sudah terinstal. Jika belum, Anda bisa mengikuti panduan instalasi resmi mereka.
- Nama domain yang sudah Anda beli.

### Langkah 1: Persiapan File

1.  **Unggah Folder Proyek**: Sama seperti metode pertama, unggah seluruh folder proyek Anda ke server ke direktori `/opt/coursecentral`. Folder ini sudah berisi `Dockerfile` dan `docker-compose.yml` yang diperlukan.

### Langkah 2: Buat dan Konfigurasi File Environment

Ini adalah langkah **paling penting**. Aplikasi Anda tidak akan berjalan tanpanya.

1.  Di dalam folder proyek di server (`/opt/coursecentral`), buat file baru bernama `.env`.
    ```bash
    # Masuk ke folder proyek
    cd /opt/coursecentral
    
    # Buat file .env dari contoh
    cp .env.example .env
    
    # Buka dan edit file .env
    nano .env
    ```
2.  **Isi semua nilai placeholder**. Buka file `.env` dan ganti semua nilai seperti `PASTE_YOUR_GEMINI_API_KEY_HERE` dan `ganti_dengan_password...` dengan nilai Anda yang sebenarnya. Ini sangat penting untuk keamanan dan fungsionalitas.

### Langkah 3: Deploy dari Command Line (Disarankan)

Ini adalah cara termudah dan paling andal untuk memulai. `docker-compose` akan secara otomatis membuat kontainer untuk aplikasi dan database Anda.

1.  **Jalankan Docker Compose**: Pastikan Anda berada di dalam folder proyek Anda (`/opt/coursecentral`), lalu jalankan perintah:
    ```bash
    docker-compose up --build -d
    ```
    - `--build`: Memaksa Docker untuk membangun image aplikasi baru dari `Dockerfile`.
    - `-d`: Menjalankan kontainer di latar belakang (detached mode).

2.  **Selesai!** Aplikasi Anda dan database MySQL sekarang berjalan di dalam kontainer Docker. Lanjutkan ke **Metode Keamanan Server** untuk mengarahkan domain dan mengaktifkan proteksi.

### Langkah 4: (Alternatif) Deploy Murni dari Portainer

Gunakan metode ini jika Anda lebih suka melakukan semuanya dari antarmuka web Portainer.

1.  **Masuk ke Portainer**: Buka antarmuka web Portainer Anda.
2.  **Pilih Environment**: Pilih environment (biasanya bernama `local` atau `primary`) tempat Docker berjalan.
3.  **Buka Stacks**: Navigasi ke menu "Stacks" di sebelah kiri.
4.  **Tambah Stack Baru**: Klik tombol "+ Add stack".
5.  **Konfigurasi Stack**:
    - **Name**: Beri nama stack Anda, misalnya `coursecentral`.
    - **Build method**: Pilih **Web editor**. Salin **seluruh isi** dari file `docker-compose.yml` yang ada di proyek Anda, dan tempelkan ke dalam editor teks.
6.  **Konfigurasi Variabel Lingkungan**:
    - Gulir ke bawah ke bagian "Environment variables".
    - **PENTING**: Alih-alih menambahkan variabel satu per satu, klik tombol **"Load variables from .env file"** dan unggah file `.env` yang sudah Anda isi pada Langkah 2.
7.  **Deploy Stack**: Gulir ke bawah dan klik tombol "Deploy the stack". Portainer akan membaca file compose, membangun image, dan menjalankan kontainer aplikasi dan database Anda.
8.  **Arahkan Domain & Aktifkan Keamanan**: Lanjutkan ke **Metode Keamanan Server** di bawah ini.

---

## Metode Keamanan Server (Sangat Direkomendasikan)

Metode ini menggunakan **Cloudflare** sebagai lapisan pelindung pertama untuk server Anda. Ini adalah praktik terbaik untuk aplikasi produksi.

**Keuntungan menggunakan Cloudflare (Gratis):**
-   **Anti-DDoS**: Secara otomatis memblokir serangan DDoS yang dapat melumpuhkan server Anda.
-   **Anti-Scraping & Bot Jahat**: Fitur "Bot Fight Mode" akan menyaring lalu lintas dari bot berbahaya.
-   **Menyembunyikan IP Asli Server**: Pengunjung hanya akan melihat IP Cloudflare, bukan IP server VPS Anda, sehingga lebih aman dari serangan langsung.
-   **SSL/HTTPS Gratis**: Menyediakan sertifikat SSL untuk mengenkripsi koneksi antara pengunjung dan server.
-   **CDN (Content Delivery Network)**: Mempercepat waktu muat situs Anda di seluruh dunia.

### Langkah 1: Daftar dan Tambahkan Domain Anda ke Cloudflare

1.  Buat akun gratis di [cloudflare.com](https://cloudflare.com).
2.  Klik **"Add a site"** dan masukkan nama domain Anda (contoh: `domainanda.com`). Pilih paket **Free**.
3.  Cloudflare akan memindai DNS record Anda. Anda tidak perlu mengubah apa pun di sini, cukup klik **"Continue"**.
4.  Cloudflare akan menampilkan dua **Nameserver**. Anda perlu mengganti nameserver lama Anda di registrar domain (tempat Anda membeli domain, seperti Namecheap, GoDaddy, dll.) dengan dua nameserver dari Cloudflare ini. Proses ini mungkin memerlukan waktu hingga 24 jam untuk aktif.

### Langkah 2: Konfigurasi DNS di Cloudflare

Setelah nameserver Anda aktif, kembali ke dasbor Cloudflare Anda.
1.  Buka menu **DNS > Records**.
2.  Klik **"Add record"** dan buat `A record`:
    -   **Type**: `A`
    -   **Name**: `@` (ini mewakili domain utama Anda)
    -   **IPv4 address**: Masukkan **alamat IP server VPS Anda**.
    -   **Proxy status**: Pastikan ikon awan berwarna **oranye** (Proxied). Ini yang mengaktifkan semua fitur keamanan Cloudflare.
3.  (Penting) Untuk **Sistem SaaS Multi-Tenant**: Anda harus membuat `A record` **wildcard** untuk menangani semua subdomain secara otomatis.
    -   **Type**: `A`
    -   **Name**: `*` (tanda bintang)
    -   **IPv4 address**: Masukkan **alamat IP server VPS Anda**.
    -   **Proxy status**: **Oranye** (Proxied).
    - Ini akan menangani `subdomain1.domainanda.com`, `subdomain2.domainanda.com`, dan seterusnya.

### Langkah 3: Konfigurasi Keamanan di Cloudflare

1.  Buka menu **SSL/TLS**. Di tab **Overview**, pastikan mode enkripsi Anda adalah **Full (Strict)**. Ini adalah yang paling aman.
2.  Agar mode **Full (Strict)** berfungsi, Anda harus menginstal sertifikat SSL di server Anda.
    -   **Jika menggunakan Metode 1 (Nginx)**: Jalankan `sudo apt install certbot python3-certbot-nginx` lalu `sudo certbot --nginx` di server Anda setelah mengarahkan domain. Certbot akan secara otomatis mendeteksi domain utama dan wildcard Anda untuk membuat sertifikat yang sesuai.
    -   **Jika menggunakan Metode 2 (Docker)**: Biasanya, Anda akan menempatkan Nginx atau reverse proxy lain (seperti Traefik) di depan Docker untuk menangani SSL. Konfigurasi Nginx dari **Metode 1** dapat diadaptasi untuk ini.
3.  Buka menu **Security > Bots**. Aktifkan **Bot Fight Mode**. Ini akan secara otomatis memblokir banyak bot jahat.

### Selesai!

Sekarang, semua lalu lintas ke domain Anda akan melewati Cloudflare terlebih dahulu. Server Anda terlindungi dari DDoS, bot jahat, dan IP aslinya tersembunyi.

---

## Backup & Restore Database (Penting)

Jika Anda menggunakan **Metode 1 (Auto-Installer)** atau **Metode 1 (Manual)**, Anda dapat mengatur backup database otomatis.

### Cara Membuat Skrip Backup Otomatis
1.  Buat direktori backup: `sudo mkdir -p /var/backups/mysql`
2.  Buat skrip backup: `sudo nano /usr/local/bin/backup-mysql.sh`
3.  Isi dengan konten berikut. Ganti `DB_USER`, `DB_PASSWORD`, dan `DB_NAME` dengan kredensial Anda yang sebenarnya.
    ```bash
    #!/bin/bash
    DB_USER="coursecentral_user"
    DB_PASSWORD="password_anda"
    DB_NAME="coursecentral_db"
    BACKUP_DIR="/var/backups/mysql"
    DATE=$(date +"%Y-%m-%d_%H%M%S")

    # Membuat file backup
    mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME | gzip > $BACKUP_DIR/$DB_NAME-$DATE.sql.gz
    
    # Menghapus backup yang lebih tua dari 7 hari
    find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +7 -delete
    ```
4.  Jadikan skrip dapat dieksekusi: `sudo chmod +x /usr/local/bin/backup-mysql.sh`
5.  Jalankan secara otomatis dengan cron. Buka editor cron: `sudo crontab -e`.
6.  Tambahkan baris berikut untuk menjalankannya setiap hari pukul 2:30 pagi:
    ```
    30 2 * * * /usr/local/bin/backup-mysql.sh
    ```

### Cara Melakukan Restore Manual
Jika terjadi keadaan darurat dan Anda perlu mengembalikan database dari file backup, ikuti langkah-langkah berikut di server Anda:

1.  **Temukan File Backup**: Buka direktori backup dan temukan file yang ingin Anda pulihkan.
    ```bash
    ls -l /var/backups/mysql/
    ```
2.  **Dapatkan Kredensial Database**: Anda memerlukan username dan password database. Anda bisa menemukannya di dalam file `.env.local` di direktori proyek Anda.
    ```bash
    # Masuk ke direktori proyek Anda
    cd /opt/coursecentral
    cat .env.local
    ```
3.  **Jalankan Perintah Restore**: Gunakan perintah di bawah ini. Ganti `nama_file_backup.sql.gz` dengan nama file yang benar. Anda akan diminta untuk memasukkan password database yang Anda temukan di langkah sebelumnya.
    ```bash
    gunzip < /var/backups/mysql/nama_file_backup.sql.gz | mysql -u coursecentral_user -p coursecentral_db
    ```
    **Peringatan**: Perintah ini akan menimpa seluruh data yang ada di database `coursecentral_db` dengan data dari file backup. Pastikan Anda memilih file backup yang benar.
