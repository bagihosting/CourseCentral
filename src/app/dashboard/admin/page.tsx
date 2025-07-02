import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Fitur Dihapus</CardTitle>
          <CardDescription>Manajemen pengguna telah dihapus dari aplikasi.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            Halaman ini tidak lagi digunakan.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
