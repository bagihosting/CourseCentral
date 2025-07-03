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
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';

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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const validatePassword = (password: string): boolean => {
    // Requires 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special char.
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !password || !confirmPassword) {
      toast({ title: 'Gagal Daftar', description: 'Semua kolom wajib diisi.', variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
        toast({ title: 'Gagal Daftar', description: 'Konfirmasi kata sandi tidak cocok.', variant: 'destructive' });
        return;
    }
    if (!validatePassword(password)) {
        toast({ 
            title: 'Kata Sandi Lemah', 
            description: 'Kata sandi harus memenuhi persyaratan keamanan yang ditentukan.', 
            variant: 'destructive',
            duration: 7000,
        });
        return;
    }
    if (!agreed) {
      toast({ title: 'Gagal Daftar', description: 'Anda harus menyetujui syarat dan ketentuan.', variant: 'destructive' });
      return;
    }
    
    setLoading(true);
    try {
      await register({ name, username, password, whatsapp });
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
        <Label htmlFor="register-whatsapp">Nomor WhatsApp</Label>
        <Input id="register-whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="Contoh: 081234567890" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-password">Kata Sandi</Label>
        <Input id="register-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <p className="text-xs text-muted-foreground p-2 border rounded-md bg-muted/50">
            Minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan karakter khusus (!@#$, dll.).
        </p>
      </div>
       <div className="space-y-2">
        <Label htmlFor="register-confirm-password">Konfirmasi Kata Sandi</Label>
        <Input id="register-confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
      </div>
      <div className="flex items-start space-x-2">
        <Checkbox id="terms" checked={agreed} onCheckedChange={(checked) => setAgreed(!!checked)} className="mt-1" />
        <div className="grid gap-1.5 leading-none">
          <label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Saya setuju dengan{' '}
            <Link href="#" className="underline hover:text-primary">
              Syarat & Ketentuan
            </Link>
          </label>
          <p className="text-sm text-muted-foreground">
            Anda setuju untuk menerima email dan pemberitahuan dari kami.
          </p>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={loading || !agreed}>
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
        document.title = `Login - ${settings.platformName}`;
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
            <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary">
                    <BookOpenCheck className="h-8 w-8 text-primary-foreground" />
                </div>
            </Link>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{platformName}</h1>
          <p className="mt-2 text-lg text-muted-foreground">
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
