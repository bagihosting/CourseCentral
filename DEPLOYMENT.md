# Panduan Deployment Aplikasi ke VPS Ubuntu 24.04

Dokumen ini menjelaskan cara men-deploy aplikasi Next.js Anda ke server pribadi virtual (VPS) yang menjalankan Ubuntu 24.04 menggunakan skrip `install.sh` yang telah disediakan.

## Prasyarat

- Sebuah server VPS baru yang menjalankan **Ubuntu 24.04**.
- Akses SSH ke server Anda dengan pengguna yang memiliki hak `sudo`.
- Nama domain yang sudah Anda beli (opsional, tapi sangat disarankan).

---

## Langkah 1: Persiapan

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

---

## Langkah 2: Konfigurasi dan Instalasi

1.  **Konfigurasi Skrip (Opsional)**:
    Buka skrip `install.sh` menggunakan editor teks seperti `nano` untuk memeriksa konfigurasinya.
    ```bash
    nano install.sh
    ```
    Pastikan `PROJECT_DIR_NAME` cocok dengan nama folder proyek Anda. Biasanya Anda tidak perlu mengubah yang lain.

2.  **Jadikan Skrip Dapat Dieksekusi**:
    Berikan izin eksekusi pada skrip.
    ```bash
    chmod +x install.sh
    ```

3.  **Jalankan Skrip Instalasi**:
    Jalankan skrip dengan hak akses `sudo`.
    ```bash
    sudo ./install.sh
    ```
    Skrip akan melakukan semua hal berikut secara otomatis:
    - Memperbarui sistem.
    - Menginstal Nginx, Node.js, dan PM2.
    - Menginstal dependensi proyek (`npm install`).
    - Membangun aplikasi Next.js untuk produksi (`npm run build`).
    - Menjalankan aplikasi di latar belakang menggunakan PM2.
    - Mengkonfigurasi Nginx sebagai reverse proxy.
    - Mengatur firewall (UFW).

---

## Langkah 3: Mengarahkan Domain (Penting)

Setelah skrip selesai, aplikasi Anda sudah berjalan di alamat IP server. Langkah terakhir adalah mengarahkan nama domain Anda ke alamat IP tersebut.

1.  **Dapatkan Alamat IP Server Anda**.
2.  **Masuk ke Registrar Domain Anda** (GoDaddy, Namecheap, dll.).
3.  Cari **Pengaturan DNS**.
4.  Edit **A Record** untuk domain utama (`@` atau `domainanda.com`) dan arahkan ke alamat IP server Anda.
5.  Tunggu beberapa saat untuk proses propagasi DNS.

---

## Memperbarui Aplikasi

Untuk memperbarui aplikasi Anda di masa mendatang:
1.  Unggah versi baru folder proyek Anda (ZIP).
2.  Hapus folder proyek lama di server.
3.  Ekstrak folder proyek yang baru.
4.  Jalankan kembali skrip `sudo ./install.sh`. Skrip ini dirancang untuk dapat dijalankan ulang dan akan menangani proses pembaruan secara otomatis.

---

## Troubleshooting (Jika Terjadi Masalah)

Jika Anda melihat error "502 Bad Gateway" setelah instalasi, coba langkah-langkah berikut di server Anda:

1.  **Cek Status Aplikasi dengan PM2**:
    ```bash
    pm2 status
    ```
    Pastikan aplikasi Anda berstatus `online`.

2.  **Lihat Log Error Aplikasi**:
    Ini adalah langkah paling penting untuk menemukan masalah.
    ```bash
    pm2 logs CourseCentral
    ```
    Periksa pesan error yang muncul. Mungkin ada masalah dengan dependensi atau variabel lingkungan.

3.  **Uji Konfigurasi Nginx**:
    ```bash
    sudo nginx -t
    ```
    Pastikan outputnya menunjukkan `syntax is ok` dan `test is successful`.

4.  **Edit Variabel Lingkungan**:
    Pastikan Anda telah mengisi `GEMINI_API_KEY` di file `.env.local` di dalam folder proyek Anda.
    ```bash
    nano /home/username/CourseCentral/.env.local
    ```
    Setelah mengedit, restart aplikasi: `pm2 restart CourseCentral`.