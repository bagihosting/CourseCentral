import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpenCheck } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl text-center">
        <div className="mb-8 flex flex-col items-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary">
                <BookOpenCheck className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-foreground">Selamat Datang di Aplikasi Anda</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Ini adalah titik awal untuk proyek baru Anda. Fitur login telah dihapus.
            </p>
        </div>
        <Card className="text-left">
          <CardHeader>
            <CardTitle>Mulai</CardTitle>
            <CardDescription>
              Akses dasbor untuk mulai membangun aplikasi Anda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard" passHref>
              <Button className="w-full">
                Buka Dasbor
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
