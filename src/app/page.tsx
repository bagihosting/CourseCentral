import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpenCheck, LogIn } from 'lucide-react';
import { login } from '@/actions/auth';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary">
            <BookOpenCheck className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-foreground">Aplikasi Kursus</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Masuk untuk mulai belajar atau mengelola.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn />
              Masuk
            </CardTitle>
            <CardDescription>
              Pilih peran Anda untuk melanjutkan ke dasbor.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <form action={async () => {
              'use server';
              await login('admin');
            }}>
              <Button type="submit" variant="outline" className="w-full h-12 text-base">
                Admin
              </Button>
            </form>
            <form action={async () => {
              'use server';
              await login('member');
            }}>
              <Button type="submit" className="w-full h-12 text-base">
                Member
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
