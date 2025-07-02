import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export default function CourseSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pengaturan Kursus</h1>
        <p className="text-muted-foreground">Kelola pengaturan global untuk platform kursus Anda.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Umum</CardTitle>
          <CardDescription>Konfigurasi dasar untuk platform Anda.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="platform-name">Nama Platform</Label>
            <Input id="platform-name" defaultValue="Aplikasi Kursus" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">Bahasa Default</Label>
            <Select defaultValue="id">
              <SelectTrigger id="language">
                <SelectValue placeholder="Pilih bahasa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">Bahasa Indonesia</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Mata Uang Default</Label>
            <Select defaultValue="idr">
              <SelectTrigger id="currency">
                <SelectValue placeholder="Pilih mata uang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="idr">IDR - Rupiah Indonesia</SelectItem>
                <SelectItem value="usd">USD - United States Dollar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan AI</CardTitle>
          <CardDescription>Kelola fitur berbasis kecerdasan buatan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="ai-recommendations" className="font-semibold">Aktifkan Rekomendasi AI</Label>
              <p className="text-sm text-muted-foreground">
                Tampilkan saran kursus yang dipersonalisasi di halaman katalog.
              </p>
            </div>
            <Switch id="ai-recommendations" defaultChecked />
          </div>
           <div className="space-y-2">
            <Label htmlFor="ai-model">Model AI</Label>
            <Select defaultValue="gemini-flash">
              <SelectTrigger id="ai-model">
                <SelectValue placeholder="Pilih model AI" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini-flash">Gemini 2.0 Flash (Direkomendasikan)</SelectItem>
                <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Simpan Perubahan</Button>
      </div>
    </div>
  );
}
