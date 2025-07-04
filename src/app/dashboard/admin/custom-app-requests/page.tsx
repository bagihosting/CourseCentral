
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { User, CheckCircle, Clock, Loader2, Rocket, Eye, Link as LinkIcon } from 'lucide-react';
import { getCustomAppRequests, approveCustomAppRequest, completeCustomAppRequest, PopulatedCustomAppRequest } from '@/lib/data';
import { format, formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';


function RequestDetailsDialog({ request }: { request: PopulatedCustomAppRequest }) {
    const topology = request.topology;
    return (
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>Detail: {request.appName}</DialogTitle>
                <DialogDescription>
                    Diajukan oleh {request.userName} - {formatDistanceToNow(new Date(request.requestDate), { addSuffix: true, locale: id })}
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                <p className="font-semibold">Kata Kunci Ide: <span className="font-normal italic">"{request.appKeywords}"</span></p>
                <Card>
                    <CardHeader><CardTitle className="text-lg">Topologi Aplikasi</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        <div><strong className="block">Nama Aplikasi:</strong> {topology.appNameSuggestion}</div>
                        <div><strong className="block">Slogan:</strong> {topology.taglineSuggestion}</div>
                        <div><strong className="block">Tech Stack:</strong> <div className="flex flex-wrap gap-1 mt-1">{topology.techStack.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}</div></div>
                        <div><strong className="block">User Flow:</strong> {topology.userFlow}</div>
                        <div>
                            <strong className="block">Fitur Inti:</strong>
                            <ul className="list-disc pl-5 mt-1 space-y-1">
                                {topology.coreFeatures.map(f => <li key={f.feature}><strong>{f.feature}:</strong> {f.description}</li>)}
                            </ul>
                        </div>
                         <div>
                            <strong className="block">Model Data:</strong>
                            <ul className="list-disc pl-5 mt-1 space-y-1">
                                {topology.dataModel.map(m => <li key={m.modelName}><strong>{m.modelName}:</strong> {m.fields.join(', ')}</li>)}
                            </ul>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                     <CardHeader><CardTitle className="text-lg">Detail Pembayaran</CardTitle></CardHeader>
                     <CardContent>
                        <p>Bank Pengirim: <strong>{request.paymentDetails.bankName}</strong></p>
                        <p>Atas Nama: <strong>{request.paymentDetails.accountHolder}</strong></p>
                     </CardContent>
                </Card>
            </div>
        </DialogContent>
    )
}

function CompleteRequestDialog({ request, onComplete }: { request: PopulatedCustomAppRequest, onComplete: () => void }) {
    const [resultLink, setResultLink] = useState('');
    const [adminNotes, setAdminNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const handleSubmit = () => {
        if (!resultLink) {
            toast({ title: 'Error', description: 'Link hasil aplikasi wajib diisi.', variant: 'destructive' });
            return;
        }
        setIsSaving(true);
        try {
            completeCustomAppRequest(request.id, resultLink, adminNotes);
            toast({ title: 'Sukses!', description: 'Permintaan telah ditandai sebagai selesai.' });
            onComplete();
        } catch (e: any) {
            toast({ title: 'Gagal', description: e.message, variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Selesaikan Permintaan: {request.appName}</DialogTitle>
                <DialogDescription>Masukkan link hasil aplikasi dan catatan untuk member.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="resultLink">Link Hasil Aplikasi (GitHub/URL Demo)</Label>
                    <Input id="resultLink" value={resultLink} onChange={e => setResultLink(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="adminNotes">Catatan untuk Member (Opsional)</Label>
                    <Textarea id="adminNotes" value={adminNotes} onChange={e => setAdminNotes(e.target.value)} />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="ghost">Batal</Button></DialogClose>
                <Button onClick={handleSubmit} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Tandai Selesai'}
                </Button>
            </DialogFooter>
        </DialogContent>
    )
}


export default function CustomAppRequestsPage() {
  const [requests, setRequests] = useState<PopulatedCustomAppRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [selectedRequestForCompletion, setSelectedRequestForCompletion] = useState<PopulatedCustomAppRequest | null>(null);

  const { toast } = useToast();

  const refreshRequests = () => {
    setRequests(getCustomAppRequests());
  };

  useEffect(() => {
    refreshRequests();
    setLoading(false);
  }, []);

  const handleApprove = async (requestId: string) => {
    setApprovingId(requestId);
    try {
        approveCustomAppRequest(requestId);
        toast({
            title: 'Sukses',
            description: 'Pembayaran permintaan aplikasi telah disetujui.',
        });
        refreshRequests();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
        toast({
            title: 'Gagal Menyetujui',
            description: errorMessage,
            variant: 'destructive',
        });
    } finally {
        setApprovingId(null);
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
                    </div>
                </CardContent>
            </Card>
        </div>
    );
  }

  const getStatusBadge = (status: PopulatedCustomAppRequest['status']) => {
      switch(status) {
          case 'pending_approval': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="mr-1 h-3 w-3" />Menunggu Persetujuan</Badge>;
          case 'in_progress': return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Loader2 className="mr-1 h-3 w-3 animate-spin" />Sedang Dikerjakan</Badge>;
          case 'completed': return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" />Selesai</Badge>;
          case 'rejected': return <Badge variant="destructive">Ditolak</Badge>;
      }
  }

  return (
    <>
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Rocket /> Permintaan Aplikasi Kustom</CardTitle>
          <CardDescription>Tinjau dan setujui permintaan pembuatan aplikasi kustom dari member Pro.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pengguna</TableHead>
                <TableHead>Nama Aplikasi</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Tidak ada permintaan aplikasi saat ini.
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
                    <TableCell>{req.appName}</TableCell>
                     <TableCell>
                        {formatDistanceToNow(new Date(req.requestDate), { addSuffix: true, locale: id })}
                    </TableCell>
                    <TableCell>
                        {getStatusBadge(req.status)}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="outline"><Eye className="mr-2 h-4 w-4" /> Detail</Button>
                            </DialogTrigger>
                            <RequestDetailsDialog request={req} />
                        </Dialog>

                      {req.status === 'pending_approval' && (
                        <Button size="sm" onClick={() => handleApprove(req.id)} disabled={approvingId === req.id}>
                          {approvingId === req.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="mr-2 h-4 w-4" />
                          )}
                          Approve
                        </Button>
                      )}
                      {req.status === 'in_progress' && (
                        <Button size="sm" variant="secondary" onClick={() => setSelectedRequestForCompletion(req)}>
                           <CheckCircle className="mr-2 h-4 w-4" /> Selesaikan
                        </Button>
                      )}
                       {req.status === 'completed' && req.resultLink && (
                        <Button size="sm" variant="ghost" asChild>
                           <a href={req.resultLink} target="_blank" rel="noopener noreferrer"><LinkIcon className="mr-2 h-4 w-4" />Lihat Hasil</a>
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
    
    <Dialog open={!!selectedRequestForCompletion} onOpenChange={(isOpen) => !isOpen && setSelectedRequestForCompletion(null)}>
      {selectedRequestForCompletion && <CompleteRequestDialog request={selectedRequestForCompletion} onComplete={() => { setSelectedRequestForCompletion(null); refreshRequests(); }} />}
    </Dialog>

    </>
  );
}
