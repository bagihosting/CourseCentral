import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpenCheck } from 'lucide-react';
import Link from 'next/link';

export default function TermsConditionsPage() {
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
            <CardTitle className="text-3xl">Syarat & Ketentuan</CardTitle>
            <p className="text-sm text-muted-foreground">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>Dengan mengakses dan menggunakan platform Scriptify, Anda setuju untuk terikat oleh Syarat dan Ketentuan berikut.</p>

            <h2>1. Penggunaan Akun</h2>
            <p>Anda bertanggung jawab untuk menjaga kerahasiaan akun dan kata sandi Anda. Anda setuju untuk menerima tanggung jawab atas semua aktivitas yang terjadi di bawah akun Anda.</p>
            <p>Anda tidak boleh menggunakan platform ini untuk tujuan ilegal atau tidak sah. Anda tidak boleh, dalam penggunaan Layanan, melanggar hukum apa pun di yurisdiksi Anda.</p>

            <h2>2. Konten</h2>
            <p>Konten yang disediakan di platform ini, termasuk kursus, materi, dan teks, adalah milik Scriptify dan/atau para instrukturnya. Konten ini dilindungi oleh hak cipta dan tidak boleh didistribusikan ulang tanpa izin tertulis.</p>
            
            <h2>3. Pembayaran dan Keanggotaan Pro</h2>
            <p>Beberapa fitur mungkin memerlukan pembayaran atau keanggotaan Pro. Pembayaran bersifat final dan tidak dapat dikembalikan. Scriptify berhak untuk mengubah biaya keanggotaan kapan saja.</p>

            <h2>4. Pembatasan Tanggung Jawab</h2>
            <p>Layanan kami disediakan "sebagaimana adanya". Scriptify tidak memberikan jaminan apa pun, tersurat maupun tersirat, dan dengan ini menafikan semua jaminan lainnya. Scriptify tidak akan bertanggung jawab atas segala kerusakan yang timbul dari penggunaan atau ketidakmampuan untuk menggunakan materi di situs web kami.</p>

            <h2>5. Penghentian</h2>
            <p>Kami dapat menghentikan atau menangguhkan akses Anda ke layanan kami segera, tanpa pemberitahuan atau kewajiban sebelumnya, untuk alasan apa pun, termasuk tanpa batasan jika Anda melanggar Syarat & Ketentuan.</p>

            <h2>6. Perubahan</h2>
            <p>Kami berhak, atas kebijakan kami sendiri, untuk mengubah atau mengganti Syarat ini kapan saja. Jika revisi bersifat material, kami akan berusaha memberikan pemberitahuan setidaknya 30 hari sebelum syarat baru berlaku.</p>

            <h2>7. Hubungi Kami</h2>
            <p>Jika Anda memiliki pertanyaan tentang Syarat & Ketentuan ini, silakan hubungi kami.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
