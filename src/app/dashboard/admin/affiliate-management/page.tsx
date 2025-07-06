
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { User, DollarSign, Loader2, ArrowRight } from 'lucide-react';
import { getAffiliateStats, processPayout, PopulatedAffiliateStat } from '@/actions/affiliate';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function AffiliateManagementPage() {
  const [affiliateStats, setAffiliateStats] = useState<PopulatedAffiliateStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayoutId, setProcessingPayoutId] = useState<string | null>(null);
  const { toast } = useToast();

  const refreshStats = async () => {
    const stats = await getAffiliateStats();
    setAffiliateStats(stats);
  };

  useEffect(() => {
    async function fetchData() {
        await refreshStats();
        setLoading(false);
    }
    fetchData();
  }, []);

  const handlePayout = async (userId: string, amount: number) => {
    if (amount <= 0) {
      toast({ title: 'Tidak Ada Tindakan', description: 'Tidak ada saldo terutang untuk dibayarkan.', variant: 'default' });
      return;
    }
    setProcessingPayoutId(userId);
    try {
      await processPayout(userId);
      toast({
        title: 'Sukses',
        description: `Pembayaran komisi sebesar Rp${amount.toLocaleString('id-ID')} untuk pengguna telah berhasil diproses.`,
      });
      await refreshStats();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
      toast({
        title: 'Gagal Memproses',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
        setProcessingPayoutId(null);
    }
  };
  
  if (loading) {
    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-64 mb-2" />
                    <Skeleton className="h-5 w-96" />
                </CardHeader>
                <CardContent>
                    <div className="w-full space-y-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
  }

  const totalUnpaid = affiliateStats.reduce((acc, stat) => acc + stat.unpaidBalance, 0);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><DollarSign/> Manajemen Afiliasi</CardTitle>
          <CardDescription>Tinjau statistik afiliasi, komisi, dan kelola pembayaran untuk semua member.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pengguna</TableHead>
                <TableHead>Referral Sukses</TableHead>
                <TableHead>Saldo Terutang</TableHead>
                <TableHead>Total Dibayar</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {affiliateStats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Belum ada data afiliasi yang tercatat.
                  </TableCell>
                </TableRow>
              ) : (
                affiliateStats.map((stat) => (
                  <TableRow key={stat.userId}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={stat.userAvatar} alt={stat.userName} />
                          <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{stat.userName}</p>
                          <Badge variant="secondary" className="font-normal capitalize">{stat.userRole}</Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{stat.successfulReferrals}</TableCell>
                    <TableCell className="font-semibold">Rp{stat.unpaidBalance.toLocaleString('id-ID')}</TableCell>
                    <TableCell>Rp{stat.paidBalance.toLocaleString('id-ID')}</TableCell>
                    <TableCell className="text-right">
                      {stat.unpaidBalance > 0 && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button size="sm" variant="secondary" disabled={processingPayoutId === stat.userId}>
                                    {processingPayoutId === stat.userId ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <ArrowRight className="mr-2 h-4 w-4" />
                                    )}
                                    Proses Payout
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Konfirmasi Pembayaran?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Anda akan memproses pembayaran komisi sebesar <strong>Rp{stat.unpaidBalance.toLocaleString('id-ID')}</strong> untuk <strong>{stat.userName}</strong>. Pastikan Anda telah melakukan transfer manual sebelum melanjutkan. Tindakan ini akan memindahkan saldo terutang ke total dibayar.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handlePayout(stat.userId, stat.unpaidBalance)}>Ya, Sudah Ditransfer</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="justify-end font-semibold">
            Total Komisi Terutang: Rp{totalUnpaid.toLocaleString('id-ID')}
        </CardFooter>
      </Card>
    </div>
  );
}
