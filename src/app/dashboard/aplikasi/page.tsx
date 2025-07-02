'use client';

import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Zap, Sparkles, Rocket, Lock } from 'lucide-react';

function ProFeatures() {
  const proFeaturesList = [
    {
      icon: Rocket,
      title: 'Akses Fitur Beta',
      description: 'Coba fitur terbaru kami sebelum dirilis untuk umum dan berikan masukan Anda.'
    },
    {
      icon: Sparkles,
      title: 'Generator Konten AI Lanjutan',
      description: 'Gunakan model AI yang lebih canggih untuk menghasilkan materi kursus yang lebih kaya.'
    },
    {
      icon: Zap,
      title: 'Dukungan Prioritas',
      description: 'Dapatkan bantuan lebih cepat dari tim dukungan kami untuk setiap pertanyaan Anda.'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Selamat Datang di Aplikasi Pro!</h1>
        <p className="text-muted-foreground">
          Anda memiliki akses penuh ke semua fitur eksklusif kami.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {proFeaturesList.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function UpgradePrompt() {
  return (
    <Card className="text-center">
      <CardHeader>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <CardTitle>Buka Fitur Aplikasi Pro</CardTitle>
        <CardDescription>
          Upgrade ke akun Pro untuk mendapatkan akses eksklusif ke alat bantu canggih,
          <br />
          dukungan prioritas, dan banyak lagi.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button size="lg">
            <Sparkles className="mr-2" />
            Upgrade ke Pro Sekarang
        </Button>
         <p className="mt-2 text-xs text-muted-foreground">(Tombol ini adalah placeholder)</p>
      </CardContent>
    </Card>
  );
}

export default function AplikasiPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Card className="text-center">
          <CardHeader>
            <Skeleton className="mx-auto h-16 w-16 rounded-full" />
            <Skeleton className="h-7 w-56 mx-auto mt-4" />
            <Skeleton className="h-5 w-full max-w-md mx-auto mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-48 mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const isProAccess = user?.role === 'admin' || user?.role === 'pro';

  return (
    <div>
      {isProAccess ? <ProFeatures /> : <UpgradePrompt />}
    </div>
  );
}
