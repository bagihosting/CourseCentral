import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function DownloadsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Unduhan</h1>
        <p className="text-muted-foreground">Akses semua materi kursus yang dapat diunduh di sini.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Materi Kursus</CardTitle>
          <CardDescription>
            Tidak ada materi yang tersedia untuk diunduh saat ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            Fitur kursus telah dihapus.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
