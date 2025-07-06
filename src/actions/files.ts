
'use server';

// =======================================================================================
// CATATAN PENTING TENTANG KEAMANAN & PENANGANAN FILE
// =======================================================================================
//
// Aplikasi ini, berdasarkan desain, TIDAK PERNAH menangani unggahan file secara langsung.
// Sebaliknya, aplikasi ini hanya menyimpan URL ke file yang di-host secara eksternal.
// Ini adalah fitur keamanan yang disengaja dan merupakan praktik terbaik untuk beberapa alasan:
//
// 1.  **MENGURANGI VEKTOR SERANGAN**: Dengan tidak menerima unggahan file, server aplikasi Next.js
//     Anda terlindungi dari file berbahaya, malware, atau shell backdoor yang mungkin
//     diunggah oleh pengguna. Beban kerja server juga menjadi lebih ringan.
//
// 2.  **MEMISAHKAN TANGGUNG JAWAB**: Keamanan dan pemindaian file menjadi tanggung jawab
//     server tempat file tersebut disimpan (misalnya, server VPS Anda, AWS S3, Google Cloud
//     Storage, dll.). Ini memungkinkan Anda menerapkan solusi keamanan khusus file di
//     lingkungan yang tepat.
//
// **IMPLEMENTASI PEMINDAIAN MALWARE (PRAKTIK TERBAIK):**
//
// Pemindaian malware/backdoor harus dilakukan di server tempat file Anda diunggah dan disimpan,
// BUKAN di dalam kode aplikasi Next.js ini.
//
// CONTOH ALUR KERJA YANG AMAN DI SERVER VPS ANDA:
//
// a.  **Siapkan Titik Unggah**: Buat skrip atau titik akhir (endpoint) terpisah di server Anda
//     (misalnya, dengan PHP, Python, atau Node.js/Express) untuk menerima unggahan file.
//
// b.  **Instal Pemindai**: Instal perangkat lunak pemindai malware seperti ClamAV di server Anda.
//     (Contoh di Ubuntu: `sudo apt-get install clamav-daemon`)
//
// c.  **Pindai Saat Unggah**: Dalam skrip unggahan Anda, setelah file diterima, jalankan
//     perintah pemindaian pada file tersebut.
//     Contoh (bash): `clamscan --infected --remove /path/to/uploaded/file.zip`
//
// d.  **Proses Hasil**:
//     -   **Jika file terinfeksi**: Perintah `clamscan` akan menghapusnya. Beri tahu
//         pengguna bahwa unggahan gagal karena terdeteksi ancaman.
//     -   **Jika file bersih**: Pindahkan file ke direktori publik yang dapat diakses web
//         dan kembalikan URL publiknya kepada pengguna.
//
// e.  **Simpan URL**: Pengguna kemudian menyalin URL publik yang aman ini dan menempelkannya
//     ke dalam formulir kurikulum di aplikasi Next.js ini.
//
// Dengan mengikuti model ini, Anda memastikan bahwa hanya file yang sudah terverifikasi
// dan aman yang tautannya disimpan di database Anda, menjaga aplikasi dan server utama Anda
// tetap terlindungi.
//
// File ini sengaja dibiarkan untuk tujuan dokumentasi.
//
