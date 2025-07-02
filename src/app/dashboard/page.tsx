import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function DashboardPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Selamat datang di Dasbor Anda</CardTitle>
          <CardDescription>
            Ini adalah dasbor utama aplikasi Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Anda dapat mulai membangun fitur Anda di sini.</p>
        </CardContent>
      </Card>
    </div>
  );
}
