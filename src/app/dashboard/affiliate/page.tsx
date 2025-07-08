
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getAffiliateStatsForUser, getCommissionHistory, getWithdrawalHistory, requestWithdrawal } from '@/actions/affiliate';
import { getPaymentSettings } from '@/actions/settings';
import type { Commission, WithdrawalRequest, PaymentAccount } from '@/types';
import { Copy, DollarSign, Users, Banknote, Sparkles, Send, Loader2, CheckCircle, Clock, XCircle } from 'lucide-react';
import { AffiliatePromoKit } from '@/components/affiliate-promo-kit';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RelativeTime } from '@/components/relative-time';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const MINIMUM_WITHDRAWAL = 50000;

function WithdrawalDialog({ balance, onFinished }: { balance: number, onFinished: () => void }) {
    const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);
    const [selectedBank, setSelectedBank] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountHolder, setAccountHolder] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    
    useEffect(() => {
        getPaymentSettings().then(setPaymentAccounts);
    }, []);

    const handleSubmit = async () => {
        if (!selectedBank || !accountHolder || !accountNumber) {
            toast({ title: 'Gagal', description: 'Harap isi semua detail bank.', variant: 'destructive'});
            return;
        }
        setIsSubmitting(true);
        try {
            await requestWithdrawal({ bankName: selectedBank, accountNumber, accountHolder });
            toast({ title: 'Sukses!', description: 'Permintaan penarikan Anda telah dikirim.' });
            onFinished();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Gagal mengirim permintaan.";
            toast({ title: 'Gagal', description: errorMessage, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Permintaan Penarikan Saldo</DialogTitle>
                <CardDescription>
                    Anda akan menarik seluruh saldo Anda sebesar <strong>Rp{balance.toLocaleString('id-ID')}</strong>.
                    Dana akan ditransfer ke rekening bank yang Anda masukkan di bawah ini.
                </CardDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Tujuan</Label>
                    <Input id="bankName" value={selectedBank} onChange={e => setSelectedBank(e.target.value)} placeholder="Contoh: BCA" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="accountNumber">Nomor Rekening</Label>
                    <Input id="accountNumber" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="0123456789" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="accountHolder">Nama Pemilik Rekening</Label>
                    <Input id="accountHolder" value={accountHolder} onChange={e => setAccountHolder(e.target.value)} placeholder="Budi Sanjaya" />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="ghost">Batal</Button></DialogClose>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4" />}
                    Kirim Permintaan
                </Button>
            </DialogFooter>
        </DialogContent>
    )
}

export default function AffiliatePage() {
    const { user, loading: userLoading } = useAuth();
    const { toast } = useToast();
    const [stats, setStats] = useState({ referralCount: 0, unpaidBalance: 0, totalPaid: 0 });
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(false);

    const referralLink = user ? `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/login?ref=${user.referralCode}` : '';

    const fetchData = async () => {
        if (user) {
            setLoading(true);
            try {
                const [statsData, commissionsData, withdrawalsData] = await Promise.all([
                    getAffiliateStatsForUser(user.id),
                    getCommissionHistory(user.id),
                    getWithdrawalHistory(user.id),
                ]);
                setStats(statsData);
                setCommissions(commissionsData);
                setWithdrawals(withdrawalsData);
            } catch (error) {
                toast({ title: "Gagal memuat data", variant: 'destructive'});
            }
            setLoading(false);
        }
    }
    
    useEffect(() => {
        if (!userLoading) {
            fetchData();
        }
    }, [user, userLoading]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(referralLink);
        toast({ title: 'Tersalin!', description: 'Link referral Anda telah disalin.' });
    };

    const handleWithdrawalFinished = () => {
        setIsWithdrawalDialogOpen(false);
        fetchData();
    };

    if (loading || userLoading) {
        return (
            <div className="space-y-6">
                 <Skeleton className="h-8 w-64 mb-2" />
                 <Skeleton className="h-5 w-80" />
                 <div className="grid md:grid-cols-3 gap-6">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                 </div>
                 <Skeleton className="h-40 w-full" />
            </div>
        )
    }

    if (user?.role === 'member') {
        return (
            <Card className="text-center">
                <CardHeader>
                    <CardTitle>Fitur Afiliasi untuk Member Pro</CardTitle>
                    <CardDescription>Upgrade akun Anda ke Pro untuk mulai mendapatkan penghasilan melalui program afiliasi kami.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild><a href="/dashboard/upgrade"><Sparkles className="mr-2"/>Upgrade Sekarang</a></Button>
                </CardContent>
            </Card>
        )
    }
    
    const canWithdraw = stats.unpaidBalance >= MINIMUM_WITHDRAWAL;
    
    const getWithdrawalStatusBadge = (status: WithdrawalRequest['status']) => {
        switch(status) {
            case 'pending': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="mr-1 h-3 w-3" />Menunggu</Badge>;
            case 'approved': return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" />Disetujui</Badge>;
            case 'rejected': return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Ditolak</Badge>;
        }
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Dasbor Afiliasi</h1>
                <p className="text-muted-foreground">Monitor performa, lacak komisi, dan tarik penghasilan Anda di sini.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card><CardHeader><CardTitle className="text-sm font-medium flex items-center justify-between">Saldo Tersedia<DollarSign className="h-5 w-5 text-muted-foreground"/></CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">Rp{stats.unpaidBalance.toLocaleString('id-ID')}</p></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-sm font-medium flex items-center justify-between">Total Ditarik<Banknote className="h-5 w-5 text-muted-foreground"/></CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">Rp{stats.totalPaid.toLocaleString('id-ID')}</p></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-sm font-medium flex items-center justify-between">Jumlah Rujukan<Users className="h-5 w-5 text-muted-foreground"/></CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{stats.referralCount}</p></CardContent></Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Link Referral Unik Anda</CardTitle>
                    <CardDescription>Bagikan link ini. Anda akan mendapatkan komisi untuk setiap pengguna yang mendaftar dan upgrade ke Pro melaluinya.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Input value={referralLink} readOnly />
                        <Button onClick={handleCopyLink}><Copy className="mr-2"/> Salin Link</Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Penarikan Dana</CardTitle>
                    <CardDescription>Anda dapat menarik seluruh saldo jika sudah mencapai minimum Rp{MINIMUM_WITHDRAWAL.toLocaleString('id-ID')}.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Dialog open={isWithdrawalDialogOpen} onOpenChange={setIsWithdrawalDialogOpen}>
                        <DialogTrigger asChild>
                            <Button disabled={!canWithdraw}>
                                <Banknote className="mr-2"/> Tarik Seluruh Saldo
                            </Button>
                        </DialogTrigger>
                        <WithdrawalDialog balance={stats.unpaidBalance} onFinished={handleWithdrawalFinished} />
                    </Dialog>
                    {!canWithdraw && <p className="text-xs text-muted-foreground mt-2">Saldo Anda belum mencapai batas minimum penarikan.</p>}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <Card>
                    <CardHeader><CardTitle>Riwayat Komisi</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Jumlah</TableHead><TableHead>Keterangan</TableHead><TableHead>Tanggal</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {commissions.length > 0 ? commissions.map(c => (
                                    <TableRow key={c.id}>
                                        <TableCell className="font-medium text-green-600">+Rp{c.amount.toLocaleString('id-ID')}</TableCell>
                                        <TableCell className="text-sm capitalize">{c.type === 'referral' ? `Rujukan dari ${c.sourceUserName || 'Pengguna'}` : 'Bonus Konten'}</TableCell>
                                        <TableCell><RelativeTime date={c.createdAt} /></TableCell>
                                    </TableRow>
                                )) : <TableRow><TableCell colSpan={3} className="text-center h-24">Belum ada komisi.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Riwayat Penarikan</CardTitle></CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader><TableRow><TableHead>Jumlah</TableHead><TableHead>Status</TableHead><TableHead>Tanggal</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {withdrawals.length > 0 ? withdrawals.map(w => (
                                    <TableRow key={w.id}>
                                        <TableCell className="font-medium">Rp{w.amount.toLocaleString('id-ID')}</TableCell>
                                        <TableCell>{getWithdrawalStatusBadge(w.status)}</TableCell>
                                        <TableCell><RelativeTime date={w.requestDate} /></TableCell>
                                    </TableRow>
                                )) : <TableRow><TableCell colSpan={3} className="text-center h-24">Belum ada riwayat penarikan.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>AI Promo Kit</CardTitle>
                    <CardDescription>Gunakan AI untuk membuat gambar dan teks promosi secara instan untuk dibagikan.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AffiliatePromoKit referralLink={referralLink}/>
                </CardContent>
            </Card>
        </div>
    );
}
