'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpenCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { getSeoSettings } from '@/lib/data';

function LoginForm() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({ title: 'Gagal Masuk', description: 'Nama pengguna dan kata sandi tidak boleh kosong.', variant: 'destructive'});
      return;
    }
    setLoading(true);
    try {
      await login(username, password);
      toast({ title: 'Selamat Datang!', description: 'Anda berhasil masuk.'});
      // The context will handle redirection
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
      toast({ title: 'Gagal Masuk', description: errorMessage, variant: 'destructive'});
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-username">Nama Pengguna</Label>
        <Input id="login-username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Kata Sandi</Label>
        <Input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" required />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Masuk
      </Button>
    </form>
  );
}

function RegisterForm() {
  const { register } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !password) {
      toast({ title: 'Gagal Daftar', description: 'Semua kolom wajib diisi.', variant: 'destructive' });
      return;
    }
    if (password.length < 6) {
        toast({ title: 'Gagal Daftar', description: 'Kata sandi minimal 6 karakter.', variant: 'destructive' });
        return;
    }
    setLoading(true);
    try {
      await register({ name, username, password });
      toast({ title: 'Pendaftaran Berhasil!', description: 'Anda sekarang dapat masuk dengan akun baru Anda.' });
       // The context will handle redirection
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
      toast({ title: 'Gagal Daftar', description: errorMessage, variant: 'destructive' });
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="register-name">Nama Lengkap</Label>
        <Input id="register-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-username">Nama Pengguna</Label>
        <Input id="register-username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="johndoe" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-password">Kata Sandi</Label>
        <Input id="register-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Daftar
      </Button>
    </form>
  );
}

export default function AuthPage() {
  const [platformName, setPlatformName] = useState('Aplikasi Kursus');

  useEffect(() => {
    const settings = getSeoSettings();
    if (settings && settings.platformName) {
        setPlatformName(settings.platformName);
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary">
            <BookOpenCheck className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-foreground">{platformName}</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Masuk untuk mulai belajar atau mendaftar jika Anda pengguna baru.
          </p>
        </div>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Masuk</TabsTrigger>
            <TabsTrigger value="register">Daftar</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Selamat Datang Kembali</CardTitle>
                <CardDescription>Masukkan kredensial Anda untuk mengakses dasbor.</CardDescription>
              </CardHeader>
              <CardContent>
                <LoginForm />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Buat Akun</CardTitle>
                <CardDescription>Daftar untuk menjadi anggota dan mulai belajar.</CardDescription>
              </CardHeader>
              <CardContent>
                <RegisterForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
