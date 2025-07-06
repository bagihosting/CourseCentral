
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { User, CheckCircle, Clock, Loader2, Banknote, XCircle } from 'lucide-react';
import { getWithdrawalRequests, approveWithdrawalRequest, rejectWithdrawalRequest, PopulatedWithdrawalRequest } from '@/actions/withdrawals';
import { format, formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function RejectDialog({ requestId, onFinished }: { requestId: string; onFinished: () => void }) {
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const handleReject = async () => {
        if (!notes) {
            toast({ title: 'Catatan Diperlukan', description: 'Harap berikan alasan penolakan.', variant: 'destructive' });
            return;
        }
        setIsSaving(true);
        try {
            await rejectWithdrawalRequest(requestId, notes);
            toast({ title: 'Sukses', description: 'Permintaan penarikan telah ditolak.' });
            onFinished();
        } catch(e) {
            const err = e as Error;
            toast({ title: 'Gagal', description: err.message, variant: 'destructive'});
        } finally {
            setIsSaving(false);
        }
    }
    
    return (
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Tolak Permintaan Ini?</AlertDialogTitle>
                <AlertDialogDescription>
                    Permintaan akan ditandai sebagai 'ditolak'. Dana tidak akan dikurangi dari saldo pengguna.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
                <Label htmlFor="rejection-notes">Alasan Penolakan</Label>
                <Input id="rejection-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Contoh: Nomor rekening tidak valid."/>
            </div>
            <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleReject} disabled={isSaving || !notes} className="bg-destructive hover:bg-destructive/90">
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Ya, Tolak Permintaan
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    );
}

export default function WithdrawalRequestsPage() {
  const [requests, setRequests] = useState<PopulatedWithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  const refreshRequests = async () => {
    setLoading(true);
    const data = await getWithdrawalRequests();
    setRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    refreshRequests();
  }, []);

  const handleApprove = async (requestId: string) => {
    setProcessingId(requestId);
    try {
        await approveWithdrawalRequest(requestId);
        toast({ title: 'Sukses!', description: 'Permintaan penarikan telah disetujui dan saldo pengguna telah diperbarui.' });
        await refreshRequests();
    } catch (e) {
        const err = e as Error;
        toast({ title: 'Gagal', description: err.message, variant: 'destructive' });
    } finally {
        setProcessingId(null);
    }
  };
  
  const getStatusBadge = (status: PopulatedWithdrawalRequest['status']) => {
    switch (status) {
        case 'pending': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="mr-1 h-3 w-3" /> Menunggu</Badge>;
        case 'approved': return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" /> Disetujui</Badge>;
        case 'rejected': return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" /> Ditolak</Badge>;
    }
  }

  if (loading) {
    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-64 mb-2" />
                    <Skeleton className="h-5 w-96" />
                </CardHeader>
                <CardContent><Skeleton className="h-48 w-full" /></CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Banknote /> Permintaan Penarikan Dana</CardTitle>
          <CardDescription>Tinjau dan proses permintaan penarikan komisi dari member dan pengajar.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pengguna</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Rekening Tujuan</TableHead>
                <TableHead>Diajukan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Tidak ada permintaan penarikan dana saat ini.
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                            <AvatarImage src={req.userAvatar} alt={req.userName} />
                            <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                            </Avatar>
                            <div>
                            <p className="font-semibold">{req.userName}</p>
                            <p className="text-xs text-muted-foreground">Sisa Saldo: Rp{req.userBalance.toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell className="font-semibold">Rp{req.amount.toLocaleString('id-ID')}</TableCell>
                    <TableCell>
                        <p className="font-medium">{req.accountHolder}</p>
                        <p className="text-xs text-muted-foreground">{req.bankName} - {req.accountNumber}</p>
                    </TableCell>
                     <TableCell>
                        {formatDistanceToNow(new Date(req.requestDate), { addSuffix: true, locale: id })}
                    </TableCell>
                    <TableCell>{getStatusBadge(req.status)}</TableCell>
                    <TableCell className="text-right space-x-2">
                        {req.status === 'pending' && (
                            <>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm" disabled={!!processingId}>
                                            <XCircle className="mr-2 h-4 w-4" /> Tolak
                                        </Button>
                                    </AlertDialogTrigger>
                                    <RejectDialog requestId={req.id} onFinished={refreshRequests} />
                                </AlertDialog>
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="secondary" size="sm" className="bg-green-600 hover:bg-green-700 text-white" disabled={!!processingId}>
                                            {processingId === req.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CheckCircle className="mr-2 h-4 w-4" />}
                                            Setujui
                                        </Button>
                                    </AlertDialogTrigger>
                                     <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Konfirmasi Persetujuan?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Pastikan Anda telah melakukan transfer manual sebesar <strong>Rp{req.amount.toLocaleString('id-ID')}</strong> ke rekening tujuan. Menyetujui akan mengurangi saldo pengguna secara permanen.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleApprove(req.id)}>Ya, Sudah Ditransfer & Setujui</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </>
                        )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
