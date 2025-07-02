'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/hooks/use-user';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user } = useUser();
  const userName = user?.name || 'Pengguna';

  if (!user) {
    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>
                        <Skeleton className="h-8 w-64"/>
                    </CardTitle>
                    <CardDescription>
                        <Skeleton className="h-5 w-48 mt-1"/>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-5 w-96"/>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Selamat datang kembali, {userName}!</CardTitle>
          <CardDescription>
            Ini adalah dasbor utama Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Anda dapat mulai menjelajahi kursus atau mengelola pengaturan dari sini.</p>
        </CardContent>
      </Card>
    </div>
  );
}
