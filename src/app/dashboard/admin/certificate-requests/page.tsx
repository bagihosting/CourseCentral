'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { User, CheckCircle, Clock, Loader2, Sparkles, FileClock } from 'lucide-react';
import { getCertificateRequests, PopulatedCertificateRequest } from '@/lib/data';
import { generateAndApproveCertificateAction } from '@/actions/ai';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

export default function CertificateRequestsPage() {
  const [requests, setRequests] = useState<PopulatedCertificateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const { toast } = useToast();

  const refreshRequests = () => {
    setRequests(getCertificateRequests());
  };

  useEffect(() => {
    refreshRequests();
    setLoading(false);
  }, []);

  const handleApprove = async (requestId: string) => {
    setApprovingId(requestId);
    const result = await generateAndApproveCertificateAction(requestId);
    setApprovingId(null);

    if (result && 'error' in result) {
        toast({
            title: 'Gagal Menyetujui',
            description: result.error,
            variant: 'destructive',
        });
    } else {
        toast({
            title: 'Sukses',
            description: 'Sertifikat telah dibuat dan disetujui. Member dapat mengunduhnya sekarang.',
        });
        refreshRequests();
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
          <CardTitle className="flex items-center gap-2"><FileClock /> Permintaan Sertifikat</CardTitle>
          <CardDescription>Tinjau dan setujui permintaan sertifikat dari member yang telah menyelesaikan kursus.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pengguna</TableHead>
                <TableHead>Kursus</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Tidak ada permintaan sertifikat saat ini.
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
                    <TableCell>{req.courseTitle}</TableCell>
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
                        <Button size="sm" onClick={() => handleApprove(req.id)} disabled={approvingId === req.id}>
                          {approvingId === req.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="mr-2 h-4 w-4" />
                          )}
                          Buat & Setujui
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
