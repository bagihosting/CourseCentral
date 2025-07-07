
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Banknote, CheckCircle, ChevronRight, Loader2, Sparkles, Send, Clock, BadgeCheck } from 'lucide-react';
import { createUpgradeRequest, getUpgradeRequestByUserId, cancelUpgradeRequest } from '@/actions/requests';
import { getPaymentSettings, getConfirmationContacts } from '@/actions/settings';
import type { UpgradeRequest, PaymentAccount, ConfirmationContact } from '@/types';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


const UPGRADE_AMOUNT = 50000;

function UpgradeForm({ onSubmitted, contacts }: { onSubmitted: () => void; contacts: ConfirmationContact[] }) {
  const { user } = useAuth();
  const [bankName, setBankName] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSelectionDialogOpen, setSelectionDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleConfirmation = async (whatsappNumber?: string) => {
    if (!bankName || !accountHolder || !user) {
      toast({ title: 'Form Tidak Lengkap', description: 'Harap isi semua kolom konfirmasi.', variant: 'destructive' });
      return;
    }
    
    if (contacts.length > 2 && !whatsappNumber) {
        setSelectionDialogOpen(true);
        return;
    }

    const targetWhatsapp = whatsappNumber || (contacts.length > 0 ? contacts[0].whatsapp : undefined);
    if (!targetWhatsapp) {
        toast({ title: 'Gagal', description: 'Nomor WhatsApp Admin tidak dikonfigurasi.', variant: 'destructive' });
        return;
    }
    
    setLoading(true);

    try {
      await createUpgradeRequest(user.id, bankName, accountHolder);

      const message = `
*Konfirmasi Pembayaran Upgrade Pro*

Halo Admin, saya telah melakukan pembayaran untuk upgrade ke akun Pro atas nama pengguna: *${user.username}*.

Berikut adalah detailnya:
- *Jumlah Transfer:* Rp${UPGRADE_AMOUNT.toLocaleString('id-ID')}
- *Bank Pengirim:* ${bankName}
- *Atas Nama Pengirim:* ${accountHolder}

Mohon segera diproses. Saya akan mengirimkan bukti transfer setelah pesan ini. Terima kasih!
      `.trim();
      
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${targetWhatsapp}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
      toast({ title: 'Mengarahkan ke WhatsApp', description: 'Silakan lanjutkan percakapan dan kirim bukti transfer Anda.' });
      
      if(isSelectionDialogOpen) setSelectionDialogOpen(false);
      
      setTimeout(() => {
          onSubmitted();
      }, 500);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan";
      toast({ title: "Gagal Mengirim Permintaan", description: errorMessage, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <div className="space-y-4 pt-4 border-t">
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
          
          <div className="space-y-2">
            <Label>Pilih Admin untuk Konfirmasi</Label>
            <div className="space-y-2">
                {contacts.length === 0 && (
                    <p className="text-sm text-center text-destructive p-4 border border-destructive/20 bg-destructive/10 rounded-md">
                        Saat ini tidak ada Admin yang tersedia untuk dihubungi. Silakan coba lagi nanti.
                    </p>
                )}
                
                {contacts.length > 0 && contacts.length <= 2 && contacts.map(contact => (
                     <Button key={contact.id} onClick={() => handleConfirmation(contact.whatsapp)} disabled={loading || !bankName || !accountHolder} className="w-full justify-between">
                        <span>Konfirmasi ke {contact.name}</span>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                ))}

                {contacts.length > 2 && (
                    <Button onClick={() => handleConfirmation()} disabled={loading || !bankName || !accountHolder} className="w-full">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Pilih Admin & Konfirmasi
                    </Button>
                )}
            </div>
          </div>
      </div>
      
      <Dialog open={isSelectionDialogOpen} onOpenChange={setSelectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pilih Admin untuk Dihubungi</DialogTitle>
            <DialogDescription>
              Silakan pilih salah satu admin di bawah ini untuk melanjutkan konfirmasi pembayaran Anda via WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {contacts.map((contact) => (
              <Button
                key={contact.id}
                variant="outline"
                className="w-full justify-between"
                onClick={() => handleConfirmation(contact.whatsapp)}
                disabled={loading}
              >
                {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                 ) : (
                    <>
                        <span>{contact.name}</span>
                        <Send className="h-4 w-4" />
                    </>
                 )}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
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
  const [request, setRequest] = useState<UpgradeRequest | null | undefined>(undefined);
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);
  const [confirmationContacts, setConfirmationContacts] = useState<ConfirmationContact[]>([]);
  const { toast } = useToast();
  
  const refreshRequestStatus = async () => {
    if (user) {
      const userRequest = await getUpgradeRequestByUserId(user.id);
      setRequest(userRequest);
    }
  }

  useEffect(() => {
    async function fetchInitialData() {
        if (!userLoading) {
            if (user) {
                await refreshRequestStatus();
            }
            const contactsData = await getConfirmationContacts();
            const accountsData = await getPaymentSettings();

            setConfirmationContacts(contactsData.map(c => ({
                ...c,
                whatsapp: c.whatsapp.replace(/[^0-9]/g, '')
            })));
            setPaymentAccounts(accountsData);
        }
    }
    fetchInitialData();
  }, [user, userLoading]);

  const handleCancel = async () => {
    if (!user) return;
    try {
        await cancelUpgradeRequest(user.id);
        toast({ title: "Permintaan Dibatalkan", description: "Permintaan upgrade Anda telah berhasil dibatalkan." });
        await refreshRequestStatus();
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

  if(userLoading || request === undefined) {
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
                          Isi formulir di bawah ini setelah Anda berhasil melakukan transfer. Pilih salah satu Admin untuk mengirim pesan konfirmasi dan bukti transfer via WhatsApp.
                        </AlertDescription>
                    </Alert>
                </div>
                <UpgradeForm onSubmitted={refreshRequestStatus} contacts={confirmationContacts} />
              </>
            )}

        </CardContent>
      </Card>
    </div>
  )
}
