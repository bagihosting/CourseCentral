import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getUser } from '@/lib/data';

export default async function DashboardPage() {
  const user = await getUser();
  const userName = user?.name || 'Pengguna';

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
