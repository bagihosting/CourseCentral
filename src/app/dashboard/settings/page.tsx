import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getUser } from '@/actions/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default async function SettingsPage() {
  const user = await getUser();

  if (!user) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Pengguna Tidak Ditemukan</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Silakan login untuk mengakses halaman ini.</p>
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
                    <p className="text-sm text-muted-foreground">{user.role}</p>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="name">Nama</Label>
                <Input id="name" defaultValue={user.name} readOnly />
            </div>
             <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" defaultValue={`${user.id}@example.com`} readOnly />
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
