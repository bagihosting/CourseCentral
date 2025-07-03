'use client';

import { useState, FormEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Banknote, CheckCircle, ChevronRight, Loader2, Sparkles, Send, Clock, BadgeCheck } from 'lucide-react';
import { getAllUsers, createUpgradeRequest, getUpgradeRequestByUserId, getPaymentSettings, cancelUpgradeRequest } from '@/lib/data';
import type { UpgradeRequest, PaymentAccount } from '@/types';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


const UPGRADE_AMOUNT = 50000;

function UpgradeForm({ onSubmitted, admins }: { onSubmitted: () => void; admins: { name: string; whatsapp: string; }[] }) {
  const { user } = useAuth();
  const [bankName, setBankName] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSelectionDialogOpen, setSelectionDialogOpen] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState('');
  const { toast } = useToast();

  const handleAdminSelect = (whatsappNumber: string) => {
    const encodedMessage = encodeURIComponent(generatedMessage);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    setSelectionDialogOpen(false);
    toast({ title: 'Mengarahkan ke WhatsApp', description: 'Silakan lanjutkan percakapan dan kirim bukti transfer Anda.' });
    setTimeout(() => {
        onSubmitted();
    }, 500);
  }
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!bankName || !accountHolder || !user) {
      toast({ title: 'Form Tidak Lengkap', description: 'Harap isi semua kolom konfirmasi.', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      createUpgradeRequest(user.id, bankName, accountHolder);

      const message = `
*Konfirmasi Pembayaran Upgrade Pro*

Halo Admin, saya telah melakukan pembayaran untuk upgrade ke akun Pro atas nama pengguna: *${user.username}*.

Berikut adalah detailnya:
- *Jumlah Transfer:* Rp${UPGRADE_AMOUNT.toLocaleString('id-ID')}
- *Bank Pengirim:* ${bankName}
- *Atas Nama Pengirim:* ${accountHolder}

Mohon segera diproses. Saya akan mengirimkan bukti transfer setelah pesan ini. Terima kasih!
      `.trim();
      
      setGeneratedMessage(message);

      if (admins.length === 0) {
        toast({ title: 'Gagal', description: 'Nomor WhatsApp Admin tidak dikonfigurasi.', variant: 'destructive' });
      } else if (admins.length === 1) {
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${admins[0].whatsapp}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
        toast({ title: 'Mengarahkan ke WhatsApp', description: 'Silakan lanjutkan percakapan dan kirim bukti transfer Anda.' });
        setTimeout(() => { onSubmitted(); }, 500);
      } else {
        setSelectionDialogOpen(true);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan";
      toast({ title: "Gagal Mengirim Permintaan", description: errorMessage, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
          <Button type="submit" disabled={loading || admins.length === 0} className="w-full">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Konfirmasi via WhatsApp
          </Button>
          {admins.length === 0 && <p className="text-xs text-center text-destructive">Nomor WhatsApp Admin tidak dikonfigurasi.</p>}
      </form>
      <Dialog open={isSelectionDialogOpen} onOpenChange={setSelectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pilih Admin untuk Dihubungi</DialogTitle>
            <DialogDescription>
              Silakan pilih salah satu admin di bawah ini untuk melanjutkan konfirmasi pembayaran Anda via WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {admins.map((admin) => (
              <Button
                key={admin.whatsapp}
                variant="outline"
                className="w-full justify-between"
                onClick={() => handleAdminSelect(admin.whatsapp)}
              >
                {admin.name}
                <Send className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function RequestStatus({ request, onCancel }: { request: UpgradeRequest, onCancel: () => void }) {
  if (request.status === 'pending') {
    return (
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertTitle className="font-semibold">Permintaan Anda Sedang Ditinjau</AlertTitle>
        <AlertDescription>
          <p>Kami telah menerima konfirmasi pembayaran Anda pada {new Date(request.requestDate).toLocaleString('id-ID')}. Admin akan segera memverifikasi pembayaran Anda.</p>
          <p className="mt-2">Proses ini biasanya memakan waktu 1x24 jam. Anda akan otomatis menjadi anggota Pro setelah disetujui.</p>
           <div className="mt-4">
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="link" className="p-0 h-auto text-destructive hover:text-destructive/80">
                        Batalkan Permintaan
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Anda yakin ingin membatalkan?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Permintaan upgrade Anda akan dihapus. Anda dapat mengajukan permintaan baru kapan saja.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Tidak</AlertDialogCancel>
                    <AlertDialogAction onClick={onCancel} className="bg-destructive hover:bg-destructive/90">Ya, Batalkan</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </div>
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
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);
  const [admins, setAdmins] = useState<{ name: string; whatsapp: string; }[]>([]);
  const { toast } = useToast();
  
  const refreshRequestStatus = () => {
    if (user) {
      const userRequest = getUpgradeRequestByUserId(user.id);
      setRequest(userRequest);
    }
  }

  useEffect(() => {
    if (!userLoading) {
      if (user) {
        refreshRequestStatus();
      }
      
      const adminUsers = getAllUsers()
        .filter(u => u.role === 'admin' && u.whatsapp && u.whatsapp.trim() !== '')
        .map(u => {
          let formattedNumber = u.whatsapp!.trim().replace(/[^0-9]/g, '');
          if (formattedNumber.startsWith('0')) {
            formattedNumber = '62' + formattedNumber.substring(1);
          }
          return { name: u.name, whatsapp: formattedNumber };
        });

      setAdmins(adminUsers);
      setPaymentAccounts(getPaymentSettings());
    }
  }, [user, userLoading]);

  const handleCancel = () => {
    if (!user) return;
    try {
        cancelUpgradeRequest(user.id);
        toast({ title: "Permintaan Dibatalkan", description: "Permintaan upgrade Anda telah berhasil dibatalkan." });
        refreshRequestStatus();
    } catch(e) {
        const errorMessage = e instanceof Error ? e.message : 'Terjadi kesalahan tidak diketahui.';
        toast({ title: 'Gagal Membatalkan', description: errorMessage, variant: 'destructive'});
    }
  }

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
                        Rp{UPGRADE_AMOUNT.toLocaleString('id-ID')}
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
                <RequestStatus request={request} onCancel={handleCancel} />
            ) : (
              <>
                <div className="space-y-4">
                    <Alert>
                        <Banknote className="h-4 w-4" />
                        <AlertTitle className="font-semibold">Langkah 1: Lakukan Pembayaran</AlertTitle>
                        <AlertDescription>
                            <p>Silakan transfer sejumlah <strong>Rp{UPGRADE_AMOUNT.toLocaleString('id-ID')}</strong> ke salah satu rekening berikut:</p>
                            <div className="mt-2 space-y-3">
                                {paymentAccounts.length > 0 ? (
                                    paymentAccounts.map((account) => (
                                        <div key={account.id} className="p-3 border rounded-md bg-muted/30">
                                            <p className="font-semibold">{account.bankName}</p>
                                            <p>No. Rekening: <span className="font-mono">{account.accountNumber}</span></p>
                                            <p>Atas Nama: <span className="font-mono">{account.accountHolder}</span></p>
                                        </div>
                                    ))
                                ) : (
                                    <p>Informasi pembayaran belum diatur oleh admin.</p>
                                )}
                            </div>
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
                <UpgradeForm onSubmitted={refreshRequestStatus} admins={admins} />
              </>
            )}

        </CardContent>
      </Card>
    </div>
  )
}
