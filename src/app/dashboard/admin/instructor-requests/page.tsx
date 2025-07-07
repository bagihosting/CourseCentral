
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { User, Check, X, Loader2, GraduationCap } from 'lucide-react';
import { getInstructorApplications, approveInstructorApplication, rejectInstructorApplication } from '@/actions/instructor';
import type { InstructorApplication } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { RelativeTime } from '@/components/relative-time';

export default function InstructorRequestsPage() {
  const [requests, setRequests] = useState<InstructorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  const refreshRequests = async () => {
    setLoading(true);
    const reqs = await getInstructorApplications();
    setRequests(reqs);
    setLoading(false);
  };

  useEffect(() => {
    refreshRequests();
  }, []);

  const handleApprove = async (applicationId: string) => {
    setProcessingId(applicationId);
    try {
      await approveInstructorApplication(applicationId);
      toast({ title: 'Sukses', description: 'Pengguna telah disetujui sebagai Pengajar.' });
      await refreshRequests();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
      toast({ title: 'Gagal Menyetujui', description: errorMessage, variant: 'destructive' });
    } finally {
        setProcessingId(null);
    }
  };

  const handleReject = async (applicationId: string) => {
    setProcessingId(applicationId);
    try {
      await rejectInstructorApplication(applicationId);
      toast({ title: 'Sukses', description: 'Permintaan telah ditolak.' });
      await refreshRequests();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
      toast({ title: 'Gagal Menolak', description: errorMessage, variant: 'destructive' });
    } finally {
        setProcessingId(null);
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
          <CardTitle className="flex items-center gap-2"><GraduationCap/> Permintaan Menjadi Pengajar</CardTitle>
          <CardDescription>Tinjau dan kelola permintaan dari member Pro yang ingin menjadi pengajar.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pengguna</TableHead>
                <TableHead>Tanggal Permintaan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    Tidak ada permintaan menjadi pengajar saat ini.
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
                        <RelativeTime date={req.requestDate} />
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                        {processingId === req.id ? (
                            <Button size="sm" disabled>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...
                            </Button>
                        ) : (
                            <>
                                <Button size="sm" variant="destructive" onClick={() => handleReject(req.id)}>
                                    <X className="mr-2 h-4 w-4" /> Tolak
                                </Button>
                                <Button size="sm" onClick={() => handleApprove(req.id)}>
                                    <Check className="mr-2 h-4 w-4" /> Setujui
                                </Button>
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
