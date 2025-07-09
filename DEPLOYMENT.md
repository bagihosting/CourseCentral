
Dokumen ini berisi metode untuk development dan deployment aplikasi Next.js Anda.

- **Metode 0** adalah untuk menjalankan aplikasi di komputer **lokal** Anda untuk development. **Mulai dari sini jika Anda baru pertama kali menjalankan proyek.**
- **Metode 1** adalah cara deployment langsung di server VPS menggunakan Nginx dan PM2, diotomatisasi dengan skrip.
- **Metode 2** adalah cara modern menggunakan Docker dan Portainer, yang sangat direkomendasikan untuk skalabilitas dan kemudahan pengelolaan.
- **Metode Keamanan (Sangat Direkomendasikan)** menjelaskan cara menggunakan Cloudflare untuk proteksi DDoS, anti-scraping, dan menyembunyikan IP asli server Anda.
- **Backup & Restore Database (Penting)** menjelaskan fitur backup otomatis dan cara melakukan restore.

---

## Metode 0: Development di Komputer Lokal

Gunakan metode ini untuk menjalankan aplikasi di laptop/PC Anda. Anda memerlukan aplikasi server lokal seperti **XAMPP** atau **Laragon**.

### Prasyarat
- **Node.js**: Pastikan Node.js (versi 20 atau lebih baru) sudah terinstal.
- **Server Lokal**: Pastikan Anda sudah menginstal dan menjalankan **XAMPP** atau **Laragon**. Pastikan service **Apache** dan **MySQL/MariaDB** sudah berjalan.
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
   ```
   Jika password `root` MariaDB Anda berbeda, silakan sesuaikan `DB_PASSWORD`.

### Langkah 3: Jalankan Aplikasi
1. Buka terminal atau command prompt di dalam folder proyek Anda.
2. Jalankan perintah `npm install` untuk menginstal semua dependensi.
3. Setelah selesai, jalankan `npm run dev` untuk memulai server development.
4. Buka browser dan akses `http://localhost:3000`.

### Troubleshooting: Error `ECONNREFUSED`
Jika Anda melihat error `ECONNREFUSED` di konsol, itu artinya:
- **MariaDB/MySQL Anda tidak berjalan.** Pastikan service tersebut aktif di XAMPP atau Laragon.
- **Port atau Host salah.** Pastikan `DB_HOST` dan `DB_PORT` di file `.env.local` Anda sudah sesuai dengan konfigurasi MariaDB di komputer Anda. Konsol terminal juga akan memberikan petunjuk spesifik saat aplikasi dimulai.

---

## Metode 1: Deployment di VPS (Nginx + PM2) dengan Auto-Installer

Metode ini menggunakan skrip `install.sh` untuk mengotomatiskan seluruh proses instalasi dan konfigurasi di server, termasuk instalasi phpMyAdmin untuk kemudahan pengelolaan database.

### Prasyarat

- Sebuah server VPS baru yang menjalankan **Ubuntu 20.04, 22.04, atau 24.04**.
- Akses SSH ke server Anda dengan pengguna non-root yang memiliki hak `sudo`.

### Langkah 1: Unggah File ke Server

1.  **Kompres Folder Proyek**: Di komputer lokal Anda, kompres seluruh folder proyek Anda (termasuk file `schema.sql` dan `install.sh`) menjadi satu file, misalnya `proyek-kursus.zip`.
2.  **Unggah File ke Server**: Gunakan `scp` atau klien SFTP (seperti FileZilla) untuk mengunggah file ZIP tersebut ke direktori home pengguna di server Anda.
    ```bash
    # Contoh menggunakan scp
    scp /path/to/your/local/proyek-kursus.zip username@alamat_ip_server:~/
    ```
3.  **Masuk ke Server dan Ekstrak**:
    - Masuk ke server Anda melalui SSH: `ssh username@alamat_ip_server`
    - Instal `unzip` jika belum ada: `sudo apt update && sudo apt install -y unzip`
    - Ekstrak file proyek Anda. Nama folder hasil ekstraksi tidak penting.
      ```bash
      unzip proyek-kursus.zip
      ```

### Langkah 2: Jalankan Skrip Instalasi

Ini adalah langkah terakhir. Skrip akan melakukan semuanya untuk Anda.

1.  **Masuk ke Folder Proyek**: Masuk ke folder yang baru saja Anda ekstrak.
    ```bash
    # Contoh: jika zip Anda bernama proyek-kursus.zip, folder hasil ekstrak mungkin bernama 'proyek-kursus'
    cd nama-folder-hasil-ekstrak
    ```
2.  **Jadikan Skrip Dapat Dieksekusi**: `chmod +x install.sh`
3.  **Jalankan Skrip dengan Sudo**:
    ```bash
    sudo ./install.sh
    ```
    Skrip akan meminta password sudo Anda, lalu akan berjalan secara otomatis. Skrip ini akan:
    - Menginstal semua dependensi (Nginx, MariaDB, Node.js, PM2, phpMyAdmin, dll.).
    - Membuat database dan pengguna baru dengan password acak yang aman.
    - **Mengimpor semua tabel dan data awal** (termasuk admin default) dari file `schema.sql` Anda.
    - Membangun aplikasi Next.js Anda.
    - Menghentikan proses lama yang mungkin berjalan di port 3000.
    - Menjalankan aplikasi Anda dengan PM2.
    - Mengkonfigurasi Nginx untuk melayani aplikasi Anda dan **phpMyAdmin**.
    - **Secara otomatis mendeteksi dan mengkonfigurasi semua domain kustom** yang telah diatur oleh para pengajar di database.
    - **Menginstal dan mengkonfigurasi Fail2Ban** untuk keamanan server dari serangan brute-force.
    - **Mengatur backup database otomatis** yang berjalan setiap hari.

### Langkah 3: Langkah Final Setelah Skrip Selesai

1.  **Isi API Key**: Skrip telah secara otomatis membuat dan mengisi file `.env.local` dengan semua kredensial database yang diperlukan. **Satu-satunya hal yang perlu Anda lakukan** adalah mengedit file ini dan memasukkan `GEMINI_API_KEY` Anda.
    ```bash
    # Pastikan Anda masih berada di dalam folder proyek Anda
    nano .env.local
    ```
2.  **Akses Aplikasi Anda**: Buka browser Anda dan akses aplikasi melalui IP server Anda. Anda juga dapat mengelola database melalui `http://ALAMAT_IP_ANDA/phpmyadmin`. Kredensial login untuk phpMyAdmin (`root` dan password-nya) akan ditampilkan di akhir proses instalasi.
3.  **Arahkan Domain & Aktifkan Keamanan**: Lanjutkan ke **Metode Keamanan Server** di bawah untuk mengarahkan domain Anda melalui Cloudflare dan mengaktifkan proteksi DDoS.

---

## Metode 2: Deployment menggunakan Docker & Portainer (Disarankan)

Metode ini mengemas aplikasi dan database MariaDB Anda ke dalam sebuah kontainer Docker, yang kemudian dikelola melalui antarmuka web Portainer. Ini adalah pendekatan yang lebih modern, terisolasi, dan andal.

### Prasyarat

- Server dengan **Docker** dan **Portainer** yang sudah terinstal. Jika belum, Anda bisa mengikuti panduan instalasi resmi mereka.
- Nama domain yang sudah Anda beli.

### Langkah 1: Persiapan File

1.  **Unggah Folder Proyek**: Sama seperti metode pertama, unggah seluruh folder proyek Anda ke server, misalnya ke direktori `/root/coursecentral`. Folder ini sudah berisi `Dockerfile` dan `docker-compose.yml` yang diperlukan.

### Langkah 2: Buat dan Konfigurasi File Environment

Ini adalah langkah **paling penting**. Aplikasi Anda tidak akan berjalan tanpanya.

1.  Di dalam folder proyek di server (`/root/coursecentral`), buat file baru bernama `.env`.
    ```bash
    # Masuk ke folder proyek
    cd /root/coursecentral
    
    # Buat file .env dari contoh
    cp .env.example .env
    
    # Buka dan edit file .env
    nano .env
    ```
2.  **Isi semua nilai placeholder**. Buka file `.env` dan ganti semua nilai seperti `PASTE_YOUR_GEMINI_API_KEY_HERE` dan `ganti_dengan_password...` dengan nilai Anda yang sebenarnya. Ini sangat penting untuk keamanan dan fungsionalitas.

### Langkah 3: Deploy dari Command Line (Disarankan)

Ini adalah cara termudah dan paling andal untuk memulai. `docker-compose` akan secara otomatis membuat kontainer untuk aplikasi dan database Anda.

1.  **Jalankan Docker Compose**: Pastikan Anda berada di dalam folder proyek Anda (`/root/coursecentral`), lalu jalankan perintah:
    ```bash
    docker-compose up --build -d
    ```
    - `--build`: Memaksa Docker untuk membangun image aplikasi baru dari `Dockerfile`.
    - `-d`: Menjalankan kontainer di latar belakang (detached mode).

2.  **Selesai!** Aplikasi Anda dan database MariaDB sekarang berjalan di dalam kontainer Docker. Lanjutkan ke **Metode Keamanan Server** untuk mengarahkan domain dan mengaktifkan proteksi.

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
3.  (Opsional) Jika Anda ingin subdomain `www` juga berfungsi, buat `CNAME record`:
    -   **Type**: `CNAME`
    -   **Name**: `www`
    -   **Target**: `@` atau `domainanda.com`
    -   **Proxy status**: Pastikan ikon awan berwarna **oranye** (Proxied).
4.  (Penting) Jika Anda menggunakan **Domain Kustom** untuk instruktur, Anda harus membuat `CNAME record` untuk setiap domain tersebut di Cloudflare, mengarahkannya ke domain utama Anda.
    -   **Type**: `CNAME`
    -   **Name**: `kursus.domaininstruktur.com`
    -   **Target**: `domainutamaanda.com`
    -   **Proxy status**: **Oranye** (Proxied).

### Langkah 3: Konfigurasi Keamanan di Cloudflare

1.  Buka menu **SSL/TLS**. Di tab **Overview**, pastikan mode enkripsi Anda adalah **Full (Strict)**. Ini adalah yang paling aman.
2.  Agar mode **Full (Strict)** berfungsi, Anda harus menginstal sertifikat SSL di server Anda.
    -   **Jika menggunakan Metode 1 (Nginx)**: Jalankan `sudo certbot --nginx` di server Anda setelah mengarahkan domain.
    -   **Jika menggunakan Metode 2 (Docker)**: Biasanya, Anda akan menempatkan Nginx atau reverse proxy lain (seperti Traefik) di depan Docker untuk menangani SSL. Konfigurasi Nginx dari **Metode 1** dapat diadaptasi untuk ini.
3.  Buka menu **Security > Bots**. Aktifkan **Bot Fight Mode**. Ini akan secara otomatis memblokir banyak bot jahat.

### Selesai!

Sekarang, semua lalu lintas ke domain Anda akan melewati Cloudflare terlebih dahulu. Server Anda terlindungi dari DDoS, bot jahat, dan IP aslinya tersembunyi.

---

## Backup & Restore Database (Penting)

Jika Anda menggunakan **Metode 1 (Auto-Installer)**, sistem backup database otomatis telah disiapkan untuk Anda.

### Fitur Backup Otomatis
- **Jadwal**: Backup dilakukan secara otomatis setiap hari pada pukul 02:30 pagi.
- **Lokasi**: File backup (dalam format `.sql.gz`) disimpan di direktori aman `/var/backups/mariadb/`. Direktori ini tidak dapat diakses dari web.
- **Retensi**: Sistem akan secara otomatis menghapus backup yang lebih tua dari 7 hari untuk menghemat ruang disk.

### Cara Melakukan Restore Manual
Jika terjadi keadaan darurat dan Anda perlu mengembalikan database dari file backup, ikuti langkah-langkah berikut di server Anda:

1.  **Temukan File Backup**: Buka direktori backup dan temukan file yang ingin Anda pulihkan.
    ```bash
    ls -l /var/backups/mariadb/
    ```
2.  **Dapatkan Kredensial Database**: Anda memerlukan username dan password database. Anda bisa menemukannya di dalam file `.env.local` di direktori proyek Anda.
    ```bash
    # Masuk ke direktori proyek Anda
    # cd /path/to/your/project
    cat .env.local
    ```
3.  **Jalankan Perintah Restore**: Gunakan perintah di bawah ini. Ganti `nama_file_backup.sql.gz` dengan nama file yang benar. Anda akan diminta untuk memasukkan password database yang Anda temukan di langkah sebelumnya.
    ```bash
    gunzip < /var/backups/mariadb/nama_file_backup.sql.gz | mysql -u coursecentral_user -p coursecentral_db
    ```
    **Peringatan**: Perintah ini akan menimpa seluruh data yang ada di database `coursecentral_db` dengan data dari file backup. Pastikan Anda memilih file backup yang benar.
