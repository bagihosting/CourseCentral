
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { User, CheckCircle, Clock, MessageSquare, Loader2 } from 'lucide-react';
import { getUpgradeRequests, approveUpgrade, type PopulatedUpgradeRequest } from '@/actions/requests';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProRequestsPage() {
  const [requests, setRequests] = useState<PopulatedUpgradeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  const refreshRequests = async () => {
    const reqs = await getUpgradeRequests();
    setRequests(reqs);
  };

  useEffect(() => {
    async function fetchData() {
        await refreshRequests();
        setLoading(false);
    }
    fetchData();
  }, []);

  const handleApprove = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      await approveUpgrade(requestId);
      toast({
        title: 'Sukses',
        description: 'Status pengguna telah berhasil ditingkatkan ke Pro.',
      });
      await refreshRequests();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
      toast({
        title: 'Gagal Menyetujui',
        description: errorMessage,
        variant: 'destructive',
      });
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

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Permintaan Upgrade Pro</CardTitle>
          <CardDescription>Tinjau dan setujui permintaan upgrade keanggotaan Pro secara manual.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pengguna</TableHead>
                <TableHead>Detail Pembayaran</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Tidak ada permintaan upgrade saat ini.
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
                          <p className="text-xs text-muted-foreground">{req.userId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                        <p className="font-semibold">{req.accountHolder}</p>
                        <p className="text-xs text-muted-foreground">{req.bankName}</p>
                    </TableCell>
                     <TableCell>
                        {formatDistanceToNow(new Date(req.requestDate), { addSuffix: true, locale: id })}
                    </TableCell>
                    <TableCell>
                      {req.status === 'pending' ? (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          <Clock className="mr-1 h-3 w-3" />
                          Menunggu
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Disetujui
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      {req.userWhatsapp && (
                        <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                          <a href={`https://wa.me/${req.userWhatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" title={`Chat ${req.userName} di WhatsApp`}>
                            <MessageSquare className="h-4 w-4 text-green-600" />
                          </a>
                        </Button>
                      )}
                      {req.status === 'pending' && (
                        <Button size="sm" onClick={() => handleApprove(req.id)} disabled={processingId === req.id}>
                          {processingId === req.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                              'Approve'
                          )}
                        </Button>
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
