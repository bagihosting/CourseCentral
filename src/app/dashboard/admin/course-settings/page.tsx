'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { getPaymentSettings, updatePaymentSettings } from '@/lib/data';
import type { PaymentSettings } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function CourseSettingsPage() {
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const settings = getPaymentSettings();
    setPaymentSettings(settings);
    setLoading(false);
  }, []);

  const handlePaymentSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setSaving(true);
    try {
      updatePaymentSettings(paymentSettings);
      toast({
        title: 'Sukses',
        description: 'Pengaturan pembayaran berhasil disimpan.',
      });
    } catch (error) {
       const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
      toast({
        title: 'Gagal Menyimpan',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pengaturan Global</h1>
        <p className="text-muted-foreground">Kelola pengaturan global untuk platform kursus Anda.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Pembayaran</CardTitle>
          <CardDescription>
            Konfigurasi rekening bank untuk menerima pembayaran upgrade ke Pro. Informasi ini akan ditampilkan di halaman upgrade.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="bankName">Nama Bank</Label>
            <Input id="bankName" name="bankName" value={paymentSettings.bankName} onChange={handlePaymentSettingsChange} placeholder="Contoh: Bank BCA" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountNumber">Nomor Rekening</Label>
            <Input id="accountNumber" name="accountNumber" value={paymentSettings.accountNumber} onChange={handlePaymentSettingsChange} placeholder="Contoh: 1234567890" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountHolder">Nama Pemilik Rekening</Label>
            <Input id="accountHolder" name="accountHolder" value={paymentSettings.accountHolder} onChange={handlePaymentSettingsChange} placeholder="Contoh: PT Aplikasi Kursus" />
          </div>
        </CardContent>
      </Card>

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
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Simpan Perubahan
        </Button>
      </div>
    </div>
  );
}
