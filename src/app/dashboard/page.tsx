import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getUserById } from '@/lib/data';
import { BookCheck, Users } from 'lucide-react';
import type { User } from '@/types';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const userId = cookies().get('userId')?.value;

  if (!userId) {
    redirect('/');
  }
  
  const user: User | undefined = await getUserById(userId);

  if (!user) {
    redirect('/');
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Selamat datang kembali, {user.name}!</CardTitle>
          <CardDescription>
            {user.role === 'admin'
              ? "Berikut adalah ikhtisar platform Anda."
              : "Semoga harimu menyenangkan!"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user.role === 'member' && user.membershipDuration && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Status Keanggotaan</p>
              <Badge variant="default">Anggota Premium</Badge>
              <p className="text-xs text-muted-foreground">
                Keanggotaan Anda aktif untuk {user.membershipDuration} bulan ke depan.
              </p>
            </div>
          )}
           {user.role === 'admin' && (
              <div className="grid grid-cols-2 gap-4">
                   <div className="flex items-center gap-4 rounded-lg bg-secondary p-4">
                      <Users className="h-8 w-8 text-muted-foreground" />
                      <div>
                          <p className="text-2xl font-bold">1,234</p>
                          <p className="text-sm text-muted-foreground">Total Pengguna</p>
                      </div>
                  </div>
              </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
