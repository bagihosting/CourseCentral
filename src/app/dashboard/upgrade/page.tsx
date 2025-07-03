'use client';

import { useState, FormEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Banknote, CheckCircle, ChevronRight, Loader2, Sparkles, Send, Clock, BadgeCheck } from 'lucide-react';
import { getAllUsers, createUpgradeRequest, getUpgradeRequestByUserId } from '@/lib/data';
import type { UpgradeRequest } from '@/types';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';

const PAYMENT_DETAILS = {
  bankName: 'Bank BCA',
  accountNumber: '1234567890',
  accountHolder: 'Admin Aplikasi Kursus',
  amount: 50000,
};

function UpgradeForm({ onSubmitted }: { onSubmitted: () => void }) {
  const { user } = useAuth();
  const [bankName, setBankName] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [adminWhatsapp, setAdminWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const adminUser = getAllUsers().find(u => u.role === 'admin');
    if (adminUser && adminUser.whatsapp) {
      let formattedNumber = adminUser.whatsapp.trim().replace(/[^0-9]/g, '');
      if (formattedNumber.startsWith('0')) {
        formattedNumber = '62' + formattedNumber.substring(1);
      }
      setAdminWhatsapp(formattedNumber);
    } else {
      setAdminWhatsapp('6281234567890');
    }
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!bankName || !accountHolder || !user) {
      toast({ title: 'Form Tidak Lengkap', description: 'Harap isi semua kolom konfirmasi.', variant: 'destructive' });
      return;
    }
    setLoading(true);

    try {
      // 1. Create the upgrade request in the database
      createUpgradeRequest(user.id, bankName, accountHolder);

      // 2. Prepare and open the WhatsApp message
      const message = `
*Konfirmasi Pembayaran Upgrade Pro*

Halo Admin, saya telah melakukan pembayaran untuk upgrade ke akun Pro atas nama pengguna: *${user.username}*.

Berikut adalah detailnya:
- *Jumlah Transfer:* Rp${PAYMENT_DETAILS.amount.toLocaleString('id-ID')}
- *Bank Pengirim:* ${bankName}
- *Atas Nama Pengirim:* ${accountHolder}

Mohon segera diproses. Saya akan mengirimkan bukti transfer setelah pesan ini. Terima kasih!
      `.trim();
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${adminWhatsapp}?text=${encodedMessage}`;
      
      window.open(whatsappUrl, '_blank');
      
      toast({ title: 'Mengarahkan ke WhatsApp', description: 'Silakan lanjutkan percakapan dan kirim bukti transfer Anda.' });
      
      // 3. Notify parent component to refresh state, with a small delay
      // This allows the new tab to open properly before the component unmounts.
      setTimeout(() => {
        onSubmitted();
      }, 300);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan";
      toast({ title: "Gagal Mengirim Permintaan", description: errorMessage, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
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
  )
}

function RequestStatus({ request }: { request: UpgradeRequest }) {
  if (request.status === 'pending') {
    return (
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertTitle className="font-semibold">Permintaan Anda Sedang Ditinjau</AlertTitle>
        <AlertDescription>
          <p>Kami telah menerima konfirmasi pembayaran Anda pada {new Date(request.requestDate).toLocaleString('id-ID')}. Admin akan segera memverifikasi pembayaran Anda.</p>
          <p className="mt-2">Proses ini biasanya memakan waktu 1x24 jam. Anda akan otomatis menjadi anggota Pro setelah disetujui.</p>
        </AlertDescription>
      </Alert>
    );
  }

  if (request.status === 'approved') {
     return (
      <Alert variant="default" className="border-green-500/50 text-green-700 dark:text-green-400 [&>svg]:text-green-600">
        <BadgeCheck className="h-4 w-4" />
        <AlertTitle className="font-semibold">Selamat! Anda Sekarang Anggota Pro.</AlertTitle>
        <AlertDescription>
          <p>Permintaan Anda telah disetujui. Anda kini memiliki akses ke semua fitur Pro, termasuk halaman Unduhan dan semua Aplikasi AI.</p>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

export default function UpgradePage() {
  const { user, loading: userLoading } = useAuth();
  const [request, setRequest] = useState<UpgradeRequest | undefined | null>(null);
  
  const refreshRequestStatus = () => {
    if (user) {
      const userRequest = getUpgradeRequestByUserId(user.id);
      setRequest(userRequest);
    }
  }

  useEffect(() => {
    if (!userLoading && user) {
      refreshRequestStatus();
    }
  }, [user, userLoading]);


  const proFeatures = [
    'Akses ke semua alat bantu AI canggih.',
    'Akses ke semua materi kursus yang dapat diunduh.',
    'Lencana "Pro" eksklusif pada profil Anda.',
    'Prioritas dukungan pelanggan.',
    'Akses awal ke fitur-fitur baru.',
  ];

  if(userLoading) {
    return <Skeleton className="w-full h-96" />
  }

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
            
            {request ? (
                <RequestStatus request={request} />
            ) : (
              <>
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
                <UpgradeForm onSubmitted={refreshRequestStatus} />
              </>
            )}

        </CardContent>
      </Card>
    </div>
  )
}
