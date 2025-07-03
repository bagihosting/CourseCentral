'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { User, CheckCircle, Clock } from 'lucide-react';
import { getUpgradeRequests, approveUpgrade } from '@/lib/data';
import type { PopulatedUpgradeRequest } from '@/lib/data';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProRequestsPage() {
  const [requests, setRequests] = useState<PopulatedUpgradeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const refreshRequests = () => {
    setRequests(getUpgradeRequests());
  };

  useEffect(() => {
    refreshRequests();
    setLoading(false);
  }, []);

  const handleApprove = (requestId: string) => {
    try {
      approveUpgrade(requestId);
      toast({
        title: 'Sukses',
        description: 'Status pengguna telah berhasil ditingkatkan ke Pro.',
      });
      refreshRequests(); // Refresh the list to show the new status
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
      toast({
        title: 'Gagal Menyetujui',
        description: errorMessage,
        variant: 'destructive',
      });
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
                    <TableCell className="text-right">
                      {req.status === 'pending' && (
                        <Button size="sm" onClick={() => handleApprove(req.id)}>
                          Approve
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
