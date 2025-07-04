import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpenCheck } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-muted/30 min-h-screen">
      <header className="py-4 px-4 md:px-6 bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <BookOpenCheck className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold">Scriptify</span>
          </Link>
          <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
            Kembali ke Aplikasi
          </Link>
        </div>
      </header>
      <main className="container mx-auto py-12 md:py-16 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Kebijakan Privasi</CardTitle>
            <p className="text-sm text-muted-foreground">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>Selamat datang di Scriptify. Kami menghargai privasi Anda dan berkomitmen untuk melindunginya. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda.</p>

            <h2>1. Informasi yang Kami Kumpulkan</h2>
            <p>Kami dapat mengumpulkan informasi berikut:</p>
            <ul>
              <li><strong>Informasi Pendaftaran:</strong> Nama, nama pengguna, alamat email, dan kata sandi saat Anda membuat akun.</li>
              <li><strong>Informasi Profil:</strong> Informasi tambahan yang Anda berikan seperti foto profil dan nomor WhatsApp.</li>
              <li><strong>Data Penggunaan:</strong> Informasi tentang bagaimana Anda menggunakan layanan kami, termasuk kursus yang diikuti dan kemajuan belajar.</li>
              <li><strong>Informasi Teknis:</strong> Alamat IP, jenis browser, dan sistem operasi.</li>
            </ul>

            <h2>2. Bagaimana Kami Menggunakan Informasi Anda</h2>
            <p>Kami menggunakan informasi Anda untuk:</p>
            <ul>
              <li>Menyediakan, mengoperasikan, dan memelihara layanan kami.</li>
              <li>Meningkatkan, mempersonalisasi, dan memperluas layanan kami.</li>
              <li>Memahami dan menganalisis bagaimana Anda menggunakan layanan kami.</li>
              <li>Mengembangkan produk, layanan, fitur, dan fungsionalitas baru.</li>
              <li>Berkomunikasi dengan Anda, baik secara langsung atau melalui salah satu mitra kami, termasuk untuk layanan pelanggan, untuk memberi Anda pembaruan dan informasi lain yang berkaitan dengan situs web, dan untuk tujuan pemasaran dan promosi.</li>
            </ul>

            <h2>3. Keamanan Data</h2>
            <p>Kami menggunakan berbagai tindakan keamanan untuk menjaga keamanan informasi pribadi Anda. Data Anda disimpan di lingkungan yang aman dan hanya dapat diakses oleh sejumlah orang terbatas yang memiliki hak akses khusus ke sistem tersebut.</p>

            <h2>4. Cookie</h2>
            <p>Situs kami tidak secara aktif menggunakan cookie untuk melacak pengguna. Kami menggunakan `localStorage` dan `sessionStorage` untuk fungsionalitas aplikasi esensial, seperti menjaga Anda tetap masuk dan menyimpan kemajuan Anda.</p>

            <h2>5. Hak Anda</h2>
            <p>Anda memiliki hak untuk mengakses, memperbaiki, atau menghapus informasi pribadi Anda. Silakan hubungi kami jika Anda ingin menggunakan hak-hak ini.</p>

            <h2>6. Perubahan pada Kebijakan Ini</h2>
            <p>Kami dapat memperbarui Kebijakan Privasi kami dari waktu ke waktu. Kami akan memberitahu Anda tentang perubahan apa pun dengan memposting Kebijakan Privasi baru di halaman ini.</p>

            <h2>7. Hubungi Kami</h2>
            <p>Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami melalui halaman Kontak kami.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
