import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpenCheck } from 'lucide-react';
import { login } from '@/actions/auth';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
                <BookOpenCheck className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">CourseCentral</h1>
            <p className="text-muted-foreground">Selamat datang! Silakan masuk untuk melanjutkan.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Masuk</CardTitle>
            <CardDescription>Pilih peran untuk masuk.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={login} className="grid gap-4">
              <Button name="userId" value="user-2" type="submit">
                Masuk sebagai Admin
              </Button>
              <Button name="userId" value="user-1" type="submit" variant="secondary">
                Masuk sebagai Member
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              Belum punya akun?{' '}
              <Link href="#" className="underline" prefetch={false}>
                Daftar
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
