Dokumen ini berisi dua metode untuk men-deploy aplikasi Next.js Anda ke server pribadi virtual (VPS) yang menjalankan Ubuntu 24.04.

- **Metode 1** adalah cara tradisional menggunakan Nginx dan PM2 secara langsung di server. Ini bagus untuk pemula.
- **Metode 2** adalah cara modern menggunakan Docker dan Portainer, yang sangat direkomendasikan untuk skalabilitas dan kemudahan pengelolaan.

---

## Metode 1: Deployment Langsung di VPS (Nginx + PM2)

Metode ini menggunakan skrip `install.sh` untuk mengotomatiskan instalasi langsung di server.

### Prasyarat

- Sebuah server VPS baru yang menjalankan **Ubuntu 24.04**.
- Akses SSH ke server Anda dengan pengguna yang memiliki hak `sudo`.

### Langkah 1: Persiapan

Sebelum menjalankan skrip, Anda perlu mengunggah file proyek Anda ke server.

1.  **Kompres Folder Proyek Anda**: Di komputer lokal Anda, kompres seluruh folder proyek Anda menjadi satu file (misalnya `CourseCentral.zip`).
2.  **Unggah File ke Server**: Gunakan `scp` (atau klien SFTP seperti FileZilla) untuk mengunggah file ZIP tersebut ke direktori home pengguna di server Anda.
    ```bash
    # Contoh menggunakan scp
    scp /path/to/your/local/CourseCentral.zip username@alamat_ip_server:~/
    ```
3.  **Unggah Skrip Instalasi**: Unggah juga skrip `install.sh` ke direktori home yang sama.
    ```bash
    scp /path/to/your/local/install.sh username@alamat_ip_server:~/
    ```
4.  **Masuk ke Server dan Ekstrak**:
    - Masuk ke server Anda melalui SSH: `ssh username@alamat_ip_server`
    - Instal `unzip` jika belum ada: `sudo apt update && sudo apt install unzip`
    - Ekstrak file proyek Anda: `unzip CourseCentral.zip`
    Sekarang, Anda seharusnya memiliki folder proyek (misalnya `/home/username/CourseCentral`) dan file `install.sh` di direktori home Anda.

### Langkah 2: Konfigurasi dan Instalasi

1.  **Jadikan Skrip Dapat Dieksekusi**: `chmod +x install.sh`
2.  **Jalankan Skrip Instalasi**: Jalankan skrip dengan hak akses `sudo`.
    ```bash
    sudo ./install.sh
    ```
    Skrip akan menangani semua proses instalasi dan konfigurasi secara otomatis.

### Langkah 3: Mengarahkan Domain

Setelah skrip selesai, aplikasi Anda sudah berjalan. Arahkan nama domain Anda ke alamat IP server melalui pengaturan DNS di registrar domain Anda (ubah **A Record**).

---

## Metode 2: Deployment menggunakan Docker & Portainer (Disarankan)

Metode ini mengemas aplikasi dan database MariaDB Anda ke dalam sebuah kontainer Docker, yang kemudian dikelola melalui antarmuka web Portainer. Ini adalah pendekatan yang lebih modern, terisolasi, dan andal.

### Prasyarat

- Server dengan **Docker** dan **Portainer** yang sudah terinstal. Jika belum, Anda bisa mengikuti panduan instalasi resmi mereka.
- Nama domain yang sudah Anda beli.

### Langkah 1: Persiapan File

1.  **Unggah Folder Proyek**: Sama seperti metode pertama, unggah seluruh folder proyek Anda ke server, misalnya ke direktori `/root/coursecentral`. Folder ini sudah berisi `Dockerfile` dan `docker-compose.yml` yang diperlukan.

2.  **Buat dan Konfigurasi File Environment**: Di dalam folder proyek di server (`/root/coursecentral`), buat file baru bernama `.env`.
    ```bash
    # Masuk ke folder proyek
    cd /root/coursecentral
    
    # Buat dan edit file .env
    nano .env
    ```
    Salin dan tempel **seluruh isi** dari file `.env` yang ada di proyek lokal Anda. Kemudian, **ganti semua nilai placeholder** (seperti `ganti_dengan_password...` dan `AIzaSy...`) dengan nilai Anda yang sebenarnya. Ini sangat penting untuk keamanan dan fungsionalitas.

### Langkah 2: Deploy dari Command Line (Disarankan)

Ini adalah cara termudah dan paling andal untuk memulai. `docker-compose` akan secara otomatis membuat kontainer untuk aplikasi dan database Anda.

1.  **Jalankan Docker Compose**: Pastikan Anda berada di dalam folder proyek Anda (`/root/coursecentral`), lalu jalankan perintah:
    ```bash
    docker-compose up --build -d
    ```
    - `--build`: Memaksa Docker untuk membangun image aplikasi baru dari `Dockerfile`.
    - `-d`: Menjalankan kontainer di latar belakang (detached mode).

2.  **Selesai!** Aplikasi Anda dan database MariaDB sekarang berjalan di dalam kontainer Docker. Anda bisa lanjut ke Langkah 4 untuk mengarahkan domain. Gunakan Portainer untuk memantau dan mengelola kontainer yang sudah berjalan.

### Langkah 3: (Alternatif) Deploy Murni dari Portainer

Gunakan metode ini jika Anda lebih suka melakukan semuanya dari antarmuka web Portainer.

1.  **Masuk ke Portainer**: Buka antarmuka web Portainer Anda.
2.  **Pilih Environment**: Pilih environment (biasanya bernama `local` atau `primary`) tempat Docker berjalan.
3.  **Buka Stacks**: Navigasi ke menu "Stacks" di sebelah kiri.
4.  **Tambah Stack Baru**: Klik tombol "+ Add stack".
5.  **Konfigurasi Stack**:
    - **Name**: Beri nama stack Anda, misalnya `coursecentral`.
    - **Repository URL**: Masukkan URL repositori Git Anda (jika proyek ada di GitHub/GitLab).
    - **Compose path**: Biarkan `docker-compose.yml`.
    - **ATAU Build method**: Jika Anda mengunggah file manual, pilih **Web editor**. Salin **seluruh isi** dari file `docker-compose.yml` yang ada di proyek Anda, dan tempelkan ke dalam editor teks.
6.  **Konfigurasi Variabel Lingkungan**:
    - Gulir ke bawah ke bagian "Environment variables".
    - Klik "Add environment variable" untuk setiap baris yang ada di file `.env` Anda (seperti `GEMINI_API_KEY`, `MARIADB_ROOT_PASSWORD`, dll.) dan masukkan nilainya.
7.  **Deploy Stack**: Gulir ke bawah dan klik tombol "Deploy the stack". Portainer akan membaca file compose, membangun image, dan menjalankan kontainer aplikasi dan database Anda.

### Langkah 4: Konfigurasi Reverse Proxy & Domain

Setelah aplikasi berjalan di Docker (di port 3000), Anda masih perlu Nginx sebagai *reverse proxy* untuk mengarahkan domain Anda ke kontainer tersebut.

1.  **Buat File Konfigurasi Nginx**:
    ```bash
    sudo nano /etc/nginx/sites-available/coursecentral
    ```
2.  **Tempelkan Konfigurasi Berikut**: Ganti `domainanda.com` dengan nama domain Anda.
    ```nginx
    server {
        listen 80;
        listen [::]:80;
        
        # Ganti dengan nama domain Anda
        server_name domainanda.com www.domainanda.com;

        location / {
            proxy_pass http://localhost:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
    ```
3.  **Aktifkan Konfigurasi**:
    ```bash
    sudo ln -s /etc/nginx/sites-available/coursecentral /etc/nginx/sites-enabled/
    sudo nginx -t      # Uji konfigurasi
    sudo systemctl restart nginx
    ```
4.  **Arahkan Domain Anda**: Lakukan Langkah 3 dari Metode 1 untuk mengarahkan domain Anda ke IP server.

Sekarang aplikasi Anda berjalan melalui Docker dan dapat diakses dari domain Anda! Anda dapat memantau, menghentikan, atau melihat log kontainer melalui antarmuka Portainer.
