
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { User, Check, X, Loader2, Banknote, Clock, CheckCircle, XCircle } from 'lucide-react';
import { getWithdrawalRequests, processWithdrawal } from '@/actions/affiliate';
import type { WithdrawalRequest } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { RelativeTime } from '@/components/relative-time';

export default function WithdrawalRequestsPage() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  const refreshRequests = async () => {
    setRequests(await getWithdrawalRequests());
  };

  useEffect(() => {
    async function fetchData() {
        await refreshRequests();
        setLoading(false);
    }
    fetchData();
  }, []);

  const handleProcess = async (requestId: string, action: 'approve' | 'reject') => {
    setProcessingId(requestId);
    try {
      await processWithdrawal(requestId, action);
      toast({ title: 'Sukses', description: `Permintaan telah berhasil di${action === 'approve' ? 'setujui' : 'tolak'}.` });
      await refreshRequests();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
      toast({ title: `Gagal Memproses`, description: errorMessage, variant: 'destructive' });
    } finally {
        setProcessingId(null);
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
                <CardContent><Skeleton className="h-48 w-full" /></CardContent>
            </Card>
        </div>
    );
  }

  const getStatusBadge = (status: WithdrawalRequest['status']) => {
    switch(status) {
        case 'pending': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="mr-1 h-3 w-3" />Menunggu</Badge>;
        case 'approved': return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" />Disetujui</Badge>;
        case 'rejected': return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Ditolak</Badge>;
    }
  }


  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Banknote /> Permintaan Penarikan Dana</CardTitle>
          <CardDescription>Kelola permintaan penarikan komisi dari para afiliasi.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pengguna</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Detail Bank</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Tidak ada permintaan penarikan saat ini.
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
                        <span>{req.userName}</span>
                      </div>
                    </TableCell>
                    <TableCell>Rp{req.amount.toLocaleString('id-ID')}</TableCell>
                    <TableCell>
                        <p className="font-semibold">{req.bankDetails.bankName}</p>
                        <p className="text-xs text-muted-foreground">{req.bankDetails.accountNumber} (a.n {req.bankDetails.accountHolder})</p>
                    </TableCell>
                    <TableCell>
                        <RelativeTime date={req.requestDate} />
                    </TableCell>
                    <TableCell>
                        {getStatusBadge(req.status)}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                        {req.status === 'pending' && (
                           processingId === req.id ? (
                                <Button size="sm" disabled>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...
                                </Button>
                           ) : (
                                <>
                                    <Button size="sm" variant="destructive" onClick={() => handleProcess(req.id, 'reject')}><X className="mr-2 h-4 w-4" /> Tolak</Button>
                                    <Button size="sm" onClick={() => handleProcess(req.id, 'approve')}><Check className="mr-2 h-4 w-4" /> Setujui</Button>
                                </>
                           )
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
