'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsPage() {
  const { user, loading } = useAuth();

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

  return (
    <div className="grid gap-6">
       <Card>
        <CardHeader>
          <CardTitle>Pengaturan Akun</CardTitle>
          <CardDescription>Kelola informasi profil dan pengaturan Anda.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback>
                        <User className="h-8 w-8" />
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="text-lg font-semibold">{user.name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="name">Nama</Label>
                <Input id="name" defaultValue={user.name} readOnly />
            </div>
             <div className="space-y-2">
                <Label htmlFor="username">Nama Pengguna</Label>
                <Input id="username" defaultValue={user.username} readOnly />
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
