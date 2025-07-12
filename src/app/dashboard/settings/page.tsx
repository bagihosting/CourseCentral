
'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Loader2, Camera, Star } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import imageCompression from 'browser-image-compression';
import type { UpdateUserInput } from '@/types';
import { getCompletedCourseCount } from '@/actions/enrollments';
import { getTestimonialByUserId, addOrUpdateTestimonial } from '@/actions/settings';
import type { Testimonial } from '@/types';
import { getRank } from '@/lib/ranks';
import { RankBadge } from '@/components/rank-badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { validatePassword } from '@/lib/validation';
import { fetchUserById } from '@/data/users';

function TestimonialForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [testimonial, setTestimonial] = useState<Testimonial | null>(null);
  const [quote, setQuote] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchTestimonial() {
      if (user) {
        const existingTestimonial = await getTestimonialByUserId(user.id);
        if (existingTestimonial) {
          setTestimonial(existingTestimonial);
          setQuote(existingTestimonial.quote);
          setRating(existingTestimonial.rating);
        }
      }
    }
    fetchTestimonial();
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (rating === 0) {
      toast({ title: 'Rating Diperlukan', description: 'Harap berikan rating bintang.', variant: 'destructive' });
      return;
    }
    if (quote.trim().length < 10) {
      toast({ title: 'Ulasan Terlalu Pendek', description: 'Harap tulis ulasan minimal 10 karakter.', variant: 'destructive' });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await addOrUpdateTestimonial({ userId: user.id, quote, rating });
      toast({ title: 'Terima Kasih!', description: 'Testimoni Anda telah berhasil disimpan.' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
      toast({ title: 'Gagal Menyimpan', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
     <Card>
        <CardHeader>
          <CardTitle>Testimoni & Ulasan Anda</CardTitle>
          <CardDescription>Bagikan pengalaman Anda menggunakan platform ini. Testimoni Anda mungkin akan ditampilkan di halaman depan.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label>Rating Anda</Label>
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 transition-transform hover:scale-110"
                        >
                        <Star className={cn(
                            "h-7 w-7",
                            star <= rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"
                        )} />
                        </button>
                    ))}
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="quote">Ulasan Anda</Label>
                <Textarea 
                    id="quote"
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    placeholder="Tuliskan testimoni Anda di sini..."
                    rows={5}
                />
            </div>
        </CardContent>
        <CardFooter>
             <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {testimonial ? 'Perbarui Testimoni' : 'Kirim Testimoni'}
            </Button>
        </CardFooter>
        </form>
    </Card>
  )
}


export default function SettingsPage() {
  const { user, loading, updateUser } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>();
  const [completedCourses, setCompletedCourses] = useState(0);

  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchInitialData() {
        if (user) {
            const freshUser = await fetchUserById(user.id);
            if (freshUser) {
                setName(freshUser.name);
                setWhatsapp(freshUser.whatsapp || '');
                setAvatarPreview(freshUser.avatarUrl);
                if (freshUser.role === 'member' || freshUser.role === 'pro') {
                    const count = await getCompletedCourseCount(freshUser.id);
                    setCompletedCourses(count);
                }
            }
        }
    }
    if(user) {
        fetchInitialData();
    }
  }, [user]);

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
        const options = {
            maxSizeMB: 0.1,
            maxWidthOrHeight: 256,
            useWebWorker: true,
            fileType: 'image/webp',
        };
        const compressedFile = await imageCompression(file, options);
        
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(compressedFile);

    } catch (error) {
        toast({
            title: 'Gagal Mengompres Gambar',
            description: 'Terjadi kesalahan saat mengompres gambar.',
            variant: 'destructive',
        });
        console.error(error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'Gagal Menyimpan',
        description: 'Konfirmasi kata sandi tidak cocok.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
        const updateData: UpdateUserInput = {
            name,
            whatsapp,
            avatarUrl: avatarPreview,
        };

        if (password.trim() !== '') {
            if (!validatePassword(password)) {
                toast({
                    title: 'Kata Sandi Lemah',
                    description: 'Kata sandi baru Anda tidak memenuhi persyaratan keamanan.',
                    variant: 'destructive',
                    duration: 7000,
                });
                setIsSubmitting(false);
                return;
            }
            updateData.password = password;
        }

        await updateUser(updateData);
        
        toast({
            title: 'Sukses',
            description: 'Profil Anda telah berhasil diperbarui.',
        });
        setPassword('');
        setConfirmPassword('');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
      toast({
        title: 'Gagal Menyimpan',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-5 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </CardContent>
        </Card>
    )
  }

  if (!user) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Pengguna Tidak Ditemukan</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Silakan masuk untuk mengakses halaman ini.</p>
            </CardContent>
        </Card>
    );
  }

  const rank = getRank(completedCourses, user.role);

  return (
    <div className="grid gap-6">
       <Card>
        <CardHeader>
          <CardTitle>Pengaturan Akun</CardTitle>
          <CardDescription>Kelola informasi profil dan pengaturan Anda. Perubahan akan disimpan saat Anda menekan tombol simpan.</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
                 <div className="space-y-4 flex flex-col items-center">
                    <div className="relative">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={avatarPreview} alt={name} />
                            <AvatarFallback><User className="h-12 w-12" /></AvatarFallback>
                        </Avatar>
                        <Button type="button" size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8" onClick={() => fileInputRef.current?.click()}>
                            <Camera className="h-4 w-4" />
                            <span className="sr-only">Ubah foto profil</span>
                        </Button>
                    </div>
                    <RankBadge rank={rank} />
                    <Input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nama Lengkap</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="username">Nama Pengguna</Label>
                        <Input id="username" defaultValue={user.username} readOnly disabled />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="whatsapp">Nomor WhatsApp</Label>
                    <Input id="whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="Contoh: 08123456789" />
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Ubah Kata Sandi</CardTitle>
                        <CardDescription>Biarkan kosong jika tidak ingin mengubah kata sandi.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Kata Sandi Baru</Label>
                            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                            <p className="text-xs text-muted-foreground">
                                Minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan karakter khusus.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi Baru</Label>
                            <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Simpan Perubahan
                    </Button>
                </div>
            </form>
        </CardContent>
      </Card>

      <TestimonialForm />

    </div>
  );
}
