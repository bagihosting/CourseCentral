
'use client';

import { useState, useEffect, useMemo, FormEvent } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getReferredUsers, PopulatedReferredUser } from '@/actions/affiliate';
import { createWithdrawalRequest, getWithdrawalRequestsForUser } from '@/actions/withdrawals';
import type { WithdrawalRequest } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, Copy, CheckCircle, Users, Link as LinkIcon, Gift, Wand2, Banknote, XCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { Progress } from '@/components/ui/progress';
import { AffiliatePromoKit } from '@/components/affiliate-promo-kit';
import { ReferredByBadge } from '@/components/referred-by-badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

function WithdrawalDialog({ userBalance, onFinished }: { userBalance: number, onFinished: () => void }) {
    const [amount, setAmount] = useState(0);
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountHolder, setAccountHolder] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (amount <= 0 || !bankName || !accountNumber || !accountHolder) {
            toast({ title: 'Gagal', description: 'Harap isi semua kolom dengan benar.', variant: 'destructive' });
            return;
        }
        if (amount > userBalance) {
            toast({ title: 'Gagal', description: 'Jumlah penarikan melebihi saldo Anda.', variant: 'destructive' });
            return;
        }

        setIsSubmitting(true);
        try {
            await createWithdrawalRequest({ amount, bankName, accountNumber, accountHolder });
            toast({ title: 'Sukses!', description: 'Permintaan penarikan Anda telah dikirim dan sedang menunggu persetujuan admin.' });
            onFinished();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan";
            toast({ title: 'Gagal Mengirim', description: errorMessage, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="amount">Jumlah Penarikan (Rp)</Label>
                <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    max={userBalance}
                    min="1"
                    required
                />
                <p className="text-xs text-muted-foreground">Saldo tersedia: Rp{userBalance.toLocaleString('id-ID')}</p>
            </div>
            <div className="space-y-2">
                <Label htmlFor="bankName">Nama Bank</Label>
                <Input id="bankName" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Contoh: Bank BCA" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="accountNumber">Nomor Rekening</Label>
                <Input id="accountNumber" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Contoh: 1234567890" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="accountHolder">Nama Pemilik Rekening</Label>
                <Input id="accountHolder" value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} placeholder="Contoh: Budi Sanjaya" required />
            </div>
            <DialogFooter>
                <DialogClose asChild><Button type="button" variant="ghost">Batal</Button></DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Ajukan Penarikan
                </Button>
            </DialogFooter>
        </form>
    );
}

export default function AffiliatePage() {
  const { user, loading: userLoading } = useAuth();
  const [referredUsers, setReferredUsers] = useState<PopulatedReferredUser[]>([]);
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalRequest[]>([]);
  const [referralLink, setReferralLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [isWithdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    if (user) {
        const [users, withdrawals] = await Promise.all([
            getReferredUsers(user.id),
            getWithdrawalRequestsForUser(user.id)
        ]);
        setReferredUsers(users);
        setWithdrawalHistory(withdrawals);
        setReferralLink(`${window.location.origin}/login?ref=${user.referralCode}`);
    }
    setLoading(false);
  };
  
  useEffect(() => {
    fetchData();
  }, [user]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      toast({ title: 'Tersalin!', description: 'Link referral Anda telah disalin ke clipboard.' });
    }).catch(err => {
      toast({ title: 'Gagal', description: 'Gagal menyalin link.', variant: 'destructive' });
    });
  };
  
  const stats = useMemo(() => {
    const successfulReferrals = referredUsers.filter(u => u.role === 'pro').length;
    return {
      totalReferrals: referredUsers.length,
      successfulReferrals,
      balance: user?.affiliateBalance || 0,
      totalPaid: user?.affiliatePaid || 0,
    };
  }, [referredUsers, user]);

  const isEligibleForFreePro = user?.role === 'member' && stats.successfulReferrals < 5;
  
  const memberSinceDays = user ? (new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 3600 * 24) : 0;
  const isEligibleForWithdrawal = user?.role === 'pro' || (user?.role === 'instructor' && memberSinceDays >= 40);
  const hasPendingWithdrawal = withdrawalHistory.some(req => req.status === 'pending');

  const getStatusBadge = (status: WithdrawalRequest['status']) => {
    switch (status) {
        case 'pending': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="mr-1 h-3 w-3" /> Menunggu</Badge>;
        case 'approved': return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" /> Disetujui</Badge>;
        case 'rejected': return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" /> Ditolak</Badge>;
    }
  }

  if (loading || userLoading || !user) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-5 w-80" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <>
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dasbor Afiliasi</h1>
        <p className="text-muted-foreground">Lacak referral Anda, lihat penghasilan, dan bagikan link unik Anda.</p>
        {user.referredBy && user.role !== 'instructor' && (
            <div className="mt-4">
                 <ReferredByBadge referralCode={user.referredBy} />
            </div>
        )}
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><LinkIcon/> Link Referral Unik Anda</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex gap-2">
                <Input value={referralLink} readOnly />
                <Button onClick={handleCopyLink}><Copy className="mr-2 h-4 w-4" />Salin</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Bagikan link ini. Setiap pengguna yang mendaftar dan upgrade ke Pro akan dihitung sebagai referral Anda.</p>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referral</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReferrals}</div>
            <p className="text-xs text-muted-foreground">Total pengguna yang mendaftar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referral Sukses (Pro)</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successfulReferrals}</div>
            <p className="text-xs text-muted-foreground">Total pengguna yang upgrade ke Pro</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Komisi (Siap Ditarik)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp{stats.balance.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground">Total dibayar: Rp{stats.totalPaid.toLocaleString('id-ID')}</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" size="sm" onClick={() => setWithdrawalDialogOpen(true)} disabled={!isEligibleForWithdrawal || stats.balance <= 0 || hasPendingWithdrawal}>
                <Banknote className="mr-2 h-4 w-4" /> Tarik Saldo
            </Button>
          </CardFooter>
        </Card>
      </div>

      {!isEligibleForWithdrawal && (
         <Alert>
            <AlertTitle>Syarat Penarikan Belum Terpenuhi</AlertTitle>
            <AlertDescription>
                Anda harus menjadi anggota Pro atau menjadi Pengajar selama minimal 40 hari untuk dapat melakukan penarikan dana.
            </AlertDescription>
        </Alert>
      )}

      {hasPendingWithdrawal && (
         <Alert variant="default" className="border-yellow-500/50">
            <Clock className="h-4 w-4" />
            <AlertTitle>Ada Permintaan Penarikan Aktif</AlertTitle>
            <AlertDescription>
                Anda memiliki permintaan penarikan yang sedang menunggu persetujuan. Anda tidak dapat mengajukan permintaan baru hingga yang lama diproses.
            </AlertDescription>
        </Alert>
      )}

      {isEligibleForFreePro && (
        <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Gift/> Dapatkan Akses Pro Gratis!</CardTitle>
                <CardDescription>Referensikan 5 teman untuk upgrade ke Pro dan dapatkan akun Pro Anda secara gratis, seumur hidup!</CardDescription>
            </CardHeader>
            <CardContent>
                <Progress value={(stats.successfulReferrals / 5) * 100} className="w-full" />
                <p className="text-sm text-center mt-2 font-medium">{stats.successfulReferrals} dari 5 referral sukses</p>
            </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Wand2/> Alat Promosi Afiliasi AI</CardTitle>
            <CardDescription>Gunakan AI untuk membuat gambar dan teks promosi yang menarik, lengkap dengan link referral Anda.</CardDescription>
        </CardHeader>
        <CardContent>
            <AffiliatePromoKit referralLink={referralLink} />
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
            <CardTitle>Riwayat Penarikan Dana</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Jumlah</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Catatan Admin</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                {withdrawalHistory.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            Anda belum pernah melakukan penarikan dana.
                        </TableCell>
                    </TableRow>
                ) : (
                    withdrawalHistory.map((req) => (
                        <TableRow key={req.id}>
                            <TableCell className="font-medium">Rp{req.amount.toLocaleString('id-ID')}</TableCell>
                            <TableCell>{format(new Date(req.requestDate), 'dd MMM yyyy', { locale: id })}</TableCell>
                            <TableCell>{getStatusBadge(req.status)}</TableCell>
                            <TableCell>{req.adminNotes || '-'}</TableCell>
                        </TableRow>
                    ))
                )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

    </div>

    <Dialog open={isWithdrawalDialogOpen} onOpenChange={setWithdrawalDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Ajukan Penarikan Saldo</DialogTitle>
                <DialogDescription>
                    Masukkan jumlah yang ingin Anda tarik beserta detail rekening bank. Permintaan akan ditinjau oleh admin.
                </DialogDescription>
            </DialogHeader>
            <WithdrawalDialog userBalance={stats.balance} onFinished={() => { setWithdrawalDialogOpen(false); fetchData(); }} />
        </DialogContent>
    </Dialog>
    </>
  );
}
