# Panduan Deployment dengan Docker & Portainer

Metode ini mengemas aplikasi dan database MySQL Anda ke dalam sebuah kontainer Docker, yang kemudian dapat dikelola melalui antarmuka web Portainer atau langsung dari command line. Ini adalah pendekatan yang paling modern, terisolasi, dan sangat direkomendasikan untuk lingkungan produksi.

## Prasyarat

-   Server VPS baru (misalnya Ubuntu) yang sudah terinstal **Docker** dan **Portainer**. Jika belum, Anda bisa mengikuti banyak panduan online untuk menginstalnya.
-   Nama domain yang sudah Anda beli (opsional, tapi direkomendasikan).

## Langkah 1: Unggah Folder Proyek ke Server

1.  **Kompres Folder Proyek**: Di komputer lokal Anda, kompres seluruh folder proyek ini menjadi satu file ZIP (misalnya, `proyek.zip`).
2.  **Unggah ke Server**: Gunakan `scp` atau klien SFTP (seperti FileZilla atau Termius) untuk mengunggah file ZIP tersebut ke direktori `/root/` di server Anda.
3.  **Ekstrak di Server**:
    -   Masuk ke server Anda melalui SSH.
    -   Buat direktori proyek: `sudo mkdir -p /opt/coursecentral`
    -   Pindahkan zip ke sana: `sudo mv /root/proyek.zip /opt/coursecentral/`
    -   Instal `unzip` jika belum ada: `sudo apt update && sudo apt install -y unzip`.
    -   Pindah ke direktori tujuan: `cd /opt/coursecentral`.
    -   Ekstrak file Anda: `sudo unzip proyek.zip`.
    -   Atur kepemilikan: `sudo chown -R $USER:$USER /opt/coursecentral` (Ganti `$USER` dengan username Anda jika perlu).

## Langkah 2: Buat dan Isi File `.env` (Langkah Paling Kritis!)

Aplikasi Anda **tidak akan bisa berjalan** tanpa file konfigurasi ini.

1.  **Masuk ke Folder Proyek**: Pastikan Anda berada di dalam folder proyek Anda di server (yaitu, `/opt/coursecentral`).
2.  **Buat File `.env`**: Salin file contoh yang sudah disediakan.
    ```bash
    cp .env.example .env
    ```
3.  **Edit File `.env`**: Buka file tersebut dengan editor teks seperti `nano`.
    ```bash
    nano .env
    ```
4.  **Isi Semua Variabel**: Ganti **semua nilai placeholder** seperti `PASTE_YOUR_GEMINI_API_KEY_HERE` dan `ganti_dengan_password...` dengan nilai Anda yang sebenarnya. Ini sangat penting untuk keamanan dan fungsionalitas aplikasi. Pastikan semua variabel diisi.

## Langkah 3: Deploy dari Command Line (Cara Cepat & Andal)

Ini adalah cara termudah dan paling direkomendasikan untuk memulai. `docker-compose` akan membaca konfigurasi Anda dan membuat kontainer untuk aplikasi dan database secara otomatis.

1.  **Jalankan Docker Compose**: Pastikan Anda berada di dalam folder proyek (`/opt/coursecentral`), lalu jalankan perintah berikut:
    ```bash
    docker-compose up --build -d
    ```
    -   `--build`: Memaksa Docker untuk membangun *image* aplikasi baru dari `Dockerfile` Anda. Gunakan ini saat pertama kali menjalankan atau setelah ada perubahan kode.
    -   `-d`: Menjalankan kontainer di latar belakang (detached mode).

2.  **Selesai!** Aplikasi Anda dan database MySQL sekarang berjalan di dalam kontainer Docker. Buka browser dan akses aplikasi Anda melalui `http://ALAMAT_IP_SERVER:3000`.

## Langkah 4 (Alternatif): Deploy dari Antarmuka Portainer

Gunakan metode ini jika Anda lebih suka melakukan semuanya dari antarmuka web Portainer.

1.  **Masuk ke Portainer**: Buka antarmuka web Portainer Anda.
2.  **Pilih Environment**: Pilih *environment* tempat Docker berjalan (biasanya bernama `local` atau `primary`).
3.  **Buka Stacks**: Navigasi ke menu "Stacks" di sebelah kiri.
4.  **Tambah Stack Baru**: Klik tombol "+ Add stack".
5.  **Konfigurasi Stack**:
    -   **Name**: Beri nama stack Anda, misalnya `coursecentral`.
    -   **Build method**: Pilih **Git Repository**.
    -   **Repository URL**: Masukkan URL Git repository proyek Anda.
    -   **Compose path**: Biarkan `docker-compose.yml`.
6.  **Konfigurasi Variabel Lingkungan**:
    -   Gulir ke bawah ke bagian "Environment variables".
    -   **PENTING**: Daripada menambahkan variabel satu per satu, klik tombol **"Load variables from .env file"** dan unggah file `.env` yang sudah Anda isi pada Langkah 2.
7.  **Deploy Stack**: Gulir ke bawah dan klik tombol "Deploy the stack". Portainer akan menarik proyek dari Git, membaca file compose, membangun *image*, dan menjalankan kontainer aplikasi serta database Anda.

## Langkah Selanjutnya: Mengamankan dengan Domain & Cloudflare

Setelah aplikasi Anda berjalan, sangat disarankan untuk melapisinya dengan Cloudflare untuk keamanan dan kemudahan akses.

-   **Daftar Cloudflare**: Buat akun gratis di Cloudflare dan tambahkan domain Anda.
-   **Ubah Nameserver**: Ganti nameserver di registrar domain Anda dengan nameserver yang diberikan oleh Cloudflare.
-   **Buat A Record**: Di dasbor DNS Cloudflare, buat `A record` baru:
    -   **Type**: `A`
    -   **Name**: `@` (untuk domain utama) atau `app` (untuk `app.domainanda.com`)
    -   **IPv4 address**: Masukkan **alamat IP server VPS Anda**.
    -   **Proxy status**: Pastikan ikon awan berwarna **oranye** (Proxied).
-   **Akses via Domain**: Sekarang, Anda seharusnya dapat mengakses aplikasi Anda melalui `http://domainanda.com` (port 3000 akan otomatis ditangani oleh Docker). Untuk HTTPS, Anda perlu mengatur *reverse proxy* seperti Nginx di depan Docker Anda atau menggunakan layanan seperti Cloudflare Tunnels.
