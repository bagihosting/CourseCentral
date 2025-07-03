'use client';

import { useState, FormEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Banknote, CheckCircle, ChevronRight, Loader2, Sparkles, Send } from 'lucide-react';
import { getAllUsers } from '@/lib/data';

// Payment details (should be managed in a secure backend in a real app)
const PAYMENT_DETAILS = {
  bankName: 'Bank BCA',
  accountNumber: '1234567890',
  accountHolder: 'Admin Aplikasi Kursus',
  amount: 50000,
};

export default function UpgradePage() {
  const [bankName, setBankName] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [adminWhatsapp, setAdminWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Find the admin user to get their WhatsApp number
    const adminUser = getAllUsers().find(u => u.role === 'admin');
    if (adminUser && adminUser.whatsapp) {
      // Format WhatsApp number: remove leading '0', add country code '62'
      let formattedNumber = adminUser.whatsapp.trim().replace(/[^0-9]/g, '');
      if (formattedNumber.startsWith('0')) {
        formattedNumber = '62' + formattedNumber.substring(1);
      }
      setAdminWhatsapp(formattedNumber);
    } else {
        // Fallback number if admin whatsapp is not set
        setAdminWhatsapp('6281234567890');
    }
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!bankName || !accountHolder) {
      toast({
        title: 'Form Tidak Lengkap',
        description: 'Harap isi semua kolom konfirmasi.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const message = `
*Konfirmasi Pembayaran Upgrade Pro*

Halo Admin, saya telah melakukan pembayaran untuk upgrade ke akun Pro.

Berikut adalah detailnya:
- *Jumlah Transfer:* Rp${PAYMENT_DETAILS.amount.toLocaleString('id-ID')}
- *Bank Pengirim:* ${bankName}
- *Atas Nama Pengirim:* ${accountHolder}

Mohon segera diproses. Saya akan mengirimkan bukti transfer setelah pesan ini. Terima kasih!
    `.trim();

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${adminWhatsapp}?text=${encodedMessage}`;
    
    // Redirect to WhatsApp
    window.open(whatsappUrl, '_blank');
    
    setLoading(false);
    toast({
        title: 'Mengarahkan ke WhatsApp',
        description: 'Silakan lanjutkan percakapan dan kirim bukti transfer Anda di WhatsApp.',
    });
  };

  const proFeatures = [
    'Akses ke semua alat bantu AI canggih.',
    'Prioritas dukungan pelanggan.',
    'Lencana "Pro" eksklusif pada profil Anda.',
    'Akses awal ke fitur-fitur baru.',
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-accent p-8 text-primary-foreground">
            <h1 className="text-4xl font-bold flex items-center gap-3"><Sparkles/> Upgrade ke Akun Pro</h1>
            <p className="mt-2 text-lg text-primary-foreground/80">Buka semua potensi aplikasi dengan menjadi anggota Pro.</p>
        </div>
        <CardContent className="p-6 grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Keuntungan Menjadi Pro</h2>
                <ul className="space-y-3">
                    {proFeatures.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <Card className="bg-muted/50">
                <CardHeader>
                    <CardTitle>Biaya Keanggotaan</CardTitle>
                    <CardDescription>Satu kali bayar untuk akses selamanya.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold">
                        Rp{PAYMENT_DETAILS.amount.toLocaleString('id-ID')}
                    </p>
                    <p className="text-muted-foreground">Akses Pro Seumur Hidup</p>
                </CardContent>
            </Card>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle className="text-2xl">Langkah-langkah Upgrade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-4">
                <Alert>
                    <Banknote className="h-4 w-4" />
                    <AlertTitle className="font-semibold">Langkah 1: Lakukan Pembayaran</AlertTitle>
                    <AlertDescription>
                        <p>Silakan transfer sejumlah <strong>Rp{PAYMENT_DETAILS.amount.toLocaleString('id-ID')}</strong> ke rekening berikut:</p>
                        <ul className="mt-2 list-disc pl-5 space-y-1">
                            <li><strong>Bank:</strong> {PAYMENT_DETAILS.bankName}</li>
                            <li><strong>No. Rekening:</strong> {PAYMENT_DETAILS.accountNumber}</li>
                            <li><strong>Atas Nama:</strong> {PAYMENT_DETAILS.accountHolder}</li>
                        </ul>
                         <p className="mt-2 text-xs">Pastikan jumlah transfer sesuai untuk mempercepat proses verifikasi.</p>
                    </AlertDescription>
                </Alert>

                <Alert>
                    <ChevronRight className="h-4 w-4" />
                    <AlertTitle className="font-semibold">Langkah 2: Konfirmasi Pembayaran</AlertTitle>
                    <AlertDescription>
                       Isi formulir di bawah ini setelah Anda berhasil melakukan transfer. Anda akan diarahkan ke WhatsApp untuk mengirim pesan konfirmasi dan bukti transfer kepada Admin.
                    </AlertDescription>
                </Alert>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold">Formulir Konfirmasi</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="bankName">Bank Pengirim</Label>
                        <Input id="bankName" value={bankName} onChange={(e) => setBankName(e.target.value)} required placeholder="Contoh: Bank Mandiri" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="accountHolder">Nama Pemilik Rekening</Label>
                        <Input id="accountHolder" value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} required placeholder="Contoh: Budi Sanjaya" />
                    </div>
                </div>
                <Button type="submit" disabled={loading || !adminWhatsapp} className="w-full">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Konfirmasi via WhatsApp
                </Button>
                {!adminWhatsapp && <p className="text-xs text-center text-destructive">Nomor WhatsApp Admin tidak dikonfigurasi.</p>}
            </form>

        </CardContent>
      </Card>
    </div>
  )
}
