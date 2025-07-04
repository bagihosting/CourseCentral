
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getPaymentSettings, getConfirmationContacts, createCustomAppRequest, getCustomAppRequestsForUser } from '@/lib/data';
import type { PaymentAccount, ConfirmationContact, GenerateAppTopologyOutput, CustomAppRequest } from '@/types';
import { generateAppTopologyAction } from '@/actions/ai';
import { Sparkles, Loader2, Rocket, Banknote, ChevronRight, Send, CheckCircle, Clock, Link as LinkIcon, Server } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

const CUSTOM_APP_FEE = 100000;

function RequestHistory({ requests }: { requests: CustomAppRequest[] }) {
    if (requests.length === 0) return null;

    const getStatusBadge = (status: CustomAppRequest['status']) => {
      switch(status) {
          case 'pending_approval': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="mr-1 h-3 w-3" />Menunggu Persetujuan</Badge>;
          case 'in_progress': return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Loader2 className="mr-1 h-3 w-3 animate-spin" />Sedang Dikerjakan</Badge>;
          case 'completed': return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" />Selesai</Badge>;
          case 'rejected': return <Badge variant="destructive">Ditolak</Badge>;
      }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Riwayat Permintaan Anda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {requests.map(req => (
                    <div key={req.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-semibold">{req.appName}</h4>
                                <p className="text-sm text-muted-foreground">
                                    Diajukan {formatDistanceToNow(new Date(req.requestDate), { addSuffix: true, locale: id })}
                                </p>
                            </div>
                            {getStatusBadge(req.status)}
                        </div>
                        {req.status === 'completed' && req.resultLink && (
                            <div className="mt-3 pt-3 border-t">
                                <h5 className="font-semibold text-sm">Aplikasi Anda Selesai!</h5>
                                {req.adminNotes && <p className="text-xs text-muted-foreground mb-2 italic">Catatan Admin: "{req.adminNotes}"</p>}
                                <Button asChild size="sm">
                                    <a href={req.resultLink} target="_blank" rel="noopener noreferrer">
                                        <LinkIcon className="mr-2 h-4 w-4" /> Lihat Hasil Aplikasi
                                    </a>
                                </Button>
                            </div>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}


export default function CustomAppRequestPage() {
    const { user, loading: userLoading } = useAuth();
    const { toast } = useToast();

    // Form state
    const [appName, setAppName] = useState('');
    const [appKeywords, setAppKeywords] = useState('');
    const [topology, setTopology] = useState<GenerateAppTopologyOutput | null>(null);
    const [bankName, setBankName] = useState('');
    const [accountHolder, setAccountHolder] = useState('');

    // UI state
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pageState, setPageState] = useState<'form' | 'payment' | 'submitted'>('form');
    
    // Data state
    const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);
    const [confirmationContacts, setConfirmationContacts] = useState<ConfirmationContact[]>([]);
    const [userRequests, setUserRequests] = useState<CustomAppRequest[]>([]);
    
    useEffect(() => {
        if(user) {
            setPaymentAccounts(getPaymentSettings());
            setConfirmationContacts(getConfirmationContacts());
            setUserRequests(getCustomAppRequestsForUser(user.id));
        }
    }, [user]);

    const handleGenerateTopology = async () => {
        if (!appName || !appKeywords) {
            toast({ title: 'Input Diperlukan', description: 'Nama aplikasi dan kata kunci harus diisi.', variant: 'destructive' });
            return;
        }
        setIsLoading(true);
        setTopology(null);
        try {
            const result = await generateAppTopologyAction({ appKeywords });
            if ('error' in result) throw new Error(result.error);
            setTopology(result);
            setPageState('payment');
            toast({ title: 'Topologi Berhasil Dibuat!', description: 'Silakan lanjutkan ke langkah pembayaran.' });
        } catch (e: any) {
            toast({ title: 'Gagal Membuat Topologi', description: e.message, variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePaymentConfirmation = async () => {
        if (!user || !topology || !bankName || !accountHolder) {
            toast({ title: 'Form Tidak Lengkap', description: 'Detail bank dan pemegang rekening harus diisi.', variant: 'destructive' });
            return;
        }

        const contact = confirmationContacts[0];
        if (!contact) {
             toast({ title: 'Gagal', description: 'Kontak admin belum diatur.', variant: 'destructive' });
             return;
        }
        
        setIsSubmitting(true);
        try {
            createCustomAppRequest(user.id, appName, appKeywords, topology, { bankName, accountHolder });
            
            const message = `
*Konfirmasi Pembayaran Aplikasi Kustom*

Halo Admin, saya telah melakukan pembayaran untuk permintaan aplikasi kustom: *${appName}*.

Detail Pembayaran:
- *Jumlah:* Rp${CUSTOM_APP_FEE.toLocaleString('id-ID')}
- *Bank Pengirim:* ${bankName}
- *Atas Nama:* ${accountHolder}

Mohon segera diproses. Bukti transfer akan saya kirimkan setelah ini. Terima kasih!
            `.trim();
            
            const whatsappUrl = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
            toast({ title: 'Mengarahkan ke WhatsApp', description: 'Silakan lanjutkan untuk mengirim bukti transfer.' });
            
            setPageState('submitted');
            setUserRequests(getCustomAppRequestsForUser(user.id)); // Refresh history
            
        } catch (e: any) {
            toast({ title: 'Gagal Mengirim Permintaan', description: e.message, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (userLoading) return <Skeleton className="w-full h-96" />;
    
    const isProAccess = user?.role === 'admin' || user?.role === 'pro';

    if (!isProAccess) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Fitur Khusus Member Pro</CardTitle>
                    <CardDescription>Hanya member Pro yang dapat mengajukan permintaan pembuatan aplikasi kustom.</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    if (pageState === 'submitted' || (userRequests.length > 0 && pageState !== 'payment')) {
        return (
            <div className="space-y-6">
                <Alert variant="default" className="border-green-500/50 text-green-700 dark:text-green-400 [&>svg]:text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Permintaan Anda Telah Terkirim!</AlertTitle>
                    <AlertDescription>
                        Terima kasih! Permintaan Anda sedang menunggu persetujuan dari Admin. Anda dapat melihat statusnya di riwayat di bawah ini.
                    </AlertDescription>
                </Alert>
                <RequestHistory requests={userRequests} />
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Rocket className="text-primary"/> Permintaan Aplikasi Kustom</CardTitle>
                    <CardDescription>
                    Isi formulir untuk mendapatkan topologi aplikasi dari AI, kemudian ajukan ke Admin untuk pengembangan. Biaya per permintaan: Rp${CUSTOM_APP_FEE.toLocaleString('id-ID')}.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="app-name">Nama Aplikasi yang Diinginkan</Label>
                        <Input id="app-name" value={appName} onChange={e => setAppName(e.target.value)} placeholder="Contoh: Manajer Tanaman Pintar" disabled={isLoading || pageState === 'payment'} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="app-keywords">Jelaskan Ide/Kata Kunci Aplikasi</Label>
                        <Textarea id="app-keywords" value={appKeywords} onChange={e => setAppKeywords(e.target.value)} placeholder="Contoh: aplikasi merawat tanaman, pengingat siram, deteksi penyakit, panduan pupuk" rows={4} disabled={isLoading || pageState === 'payment'} />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleGenerateTopology} disabled={isLoading || pageState === 'payment'}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4"/>}
                        Hasilkan Topologi dengan AI
                    </Button>
                </CardFooter>
            </Card>

            {pageState === 'payment' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Langkah 2: Pembayaran & Konfirmasi</CardTitle>
                        <CardDescription>Topologi berhasil dibuat. Lakukan pembayaran untuk mengajukan permintaan ini ke Admin.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Alert>
                            <Banknote className="h-4 w-4" />
                            <AlertTitle className="font-semibold">Lakukan Pembayaran</AlertTitle>
                            <AlertDescription>
                                <p>Silakan transfer sejumlah <strong>Rp${CUSTOM_APP_FEE.toLocaleString('id-ID')}</strong> ke salah satu rekening berikut:</p>
                                <div className="mt-2 space-y-3">
                                    {paymentAccounts.map((account) => (
                                        <div key={account.id} className="p-3 border rounded-md bg-muted/30">
                                            <p className="font-semibold">{account.bankName}</p>
                                            <p>No. Rekening: <span className="font-mono">{account.accountNumber}</span></p>
                                            <p>Atas Nama: <span className="font-mono">{account.accountHolder}</span></p>
                                        </div>
                                    ))}
                                </div>
                            </AlertDescription>
                        </Alert>

                        <Alert>
                            <ChevronRight className="h-4 w-4" />
                            <AlertTitle className="font-semibold">Konfirmasi Pembayaran</AlertTitle>
                            <AlertDescription>
                            Isi formulir di bawah ini setelah transfer, lalu klik tombol untuk konfirmasi via WhatsApp.
                            </AlertDescription>
                        </Alert>
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
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handlePaymentConfirmation} disabled={isSubmitting || !bankName || !accountHolder}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            Ajukan Permintaan & Konfirmasi
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {userRequests.length > 0 && pageState === 'form' && (
                <RequestHistory requests={userRequests} />
            )}
        </div>
    );
}
