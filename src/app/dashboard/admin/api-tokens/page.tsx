'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, PlusCircle, Loader2, Copy, AlertTriangle, Trash2 } from 'lucide-react';
import { createApiKey, getApiKeys, revokeApiKey } from '@/actions/api-keys';
import { Skeleton } from '@/components/ui/skeleton';
import { RelativeTime } from '@/components/relative-time';

type ApiKeyInfo = {
    id: string;
    name: string;
    prefix: string;
    createdAt: string;
    lastUsedAt: string | null;
    createdByName: string;
};

function GenerateTokenDialog({ onGenerated }: { onGenerated: () => void }) {
    const [name, setName] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);
    const { toast } = useToast();

    const handleGenerate = async () => {
        if (!name) {
            toast({ title: 'Nama diperlukan', description: 'Harap berikan nama deskriptif untuk kunci ini.', variant: 'destructive' });
            return;
        }
        setIsGenerating(true);
        try {
            const { apiKey } = await createApiKey(name);
            setGeneratedKey(apiKey);
        } catch (e: any) {
            toast({ title: 'Gagal Membuat Kunci', description: e.message, variant: 'destructive' });
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleCopy = () => {
        if (!generatedKey) return;
        navigator.clipboard.writeText(generatedKey);
        toast({ title: 'Tersalin!', description: 'API Key telah disalin ke clipboard.' });
    };

    const handleClose = () => {
        // Reset state and notify parent
        setName('');
        setGeneratedKey(null);
        onGenerated();
    }

    if (generatedKey) {
        return (
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>API Key Berhasil Dibuat!</DialogTitle>
                    <DialogDescription>Simpan kunci ini di tempat yang aman. Anda tidak akan bisa melihatnya lagi setelah menutup jendela ini.</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                     <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Peringatan Keamanan</AlertTitle>
                        <AlertDescription>
                           Ini adalah satu-satunya waktu Anda dapat melihat API key ini. Pastikan untuk menyalin dan menyimpannya di manajer kata sandi atau tempat aman lainnya sekarang.
                        </AlertDescription>
                    </Alert>
                    <div className="p-3 font-mono text-sm border bg-muted rounded-md flex items-center justify-between">
                        <code>{generatedKey}</code>
                        <Button variant="ghost" size="icon" onClick={handleCopy}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleClose}>Saya sudah menyimpannya</Button>
                </DialogFooter>
            </DialogContent>
        )
    }

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Buat API Key Baru</DialogTitle>
                <DialogDescription>
                    API key dapat digunakan untuk memberikan akses terprogram ke aplikasi Anda dari layanan eksternal.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2">
                <Label htmlFor="key-name">Nama Kunci (Deskriptif)</Label>
                <Input id="key-name" value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: Kunci untuk Aplikasi Mobile" />
            </div>
            <DialogFooter>
                <DialogClose asChild><Button type="button" variant="ghost">Batal</Button></DialogClose>
                <Button onClick={handleGenerate} disabled={isGenerating}>
                    {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Buat Kunci
                </Button>
            </DialogFooter>
        </DialogContent>
    )
}

export default function ApiTokensPage() {
    const [keys, setKeys] = useState<ApiKeyInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

    const fetchKeys = async () => {
        try {
            setKeys(await getApiKeys());
        } catch (e: any) {
            toast({ title: 'Gagal Memuat Kunci', description: e.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKeys();
    }, []);

    const handleRevoke = async (keyId: string) => {
        try {
            await revokeApiKey(keyId);
            toast({ title: 'Sukses', description: 'API Key telah dicabut.' });
            fetchKeys(); // Refresh list
        } catch (e: any) {
            toast({ title: 'Gagal Mencabut Kunci', description: e.message, variant: 'destructive' });
        }
    }

    if (loading) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <Skeleton className="h-7 w-56 mb-2" />
                        <Skeleton className="h-5 w-80" />
                    </div>
                    <Skeleton className="h-10 w-36" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-48 w-full" />
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2"><KeyRound/>Manajemen API Token</CardTitle>
                        <CardDescription>
                            Buat dan kelola kunci API untuk memberikan akses ke layanan eksternal.
                        </CardDescription>
                    </div>
                    <Button onClick={() => setIsDialogOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Buat Token Baru
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama</TableHead>
                                <TableHead>Prefix</TableHead>
                                <TableHead>Dibuat</TableHead>
                                <TableHead>Terakhir Digunakan</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {keys.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        Belum ada API key yang dibuat.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                keys.map(key => (
                                    <TableRow key={key.id}>
                                        <TableCell className="font-medium">{key.name}</TableCell>
                                        <TableCell><code className="font-mono bg-muted p-1 rounded-sm">{key.prefix}....</code></TableCell>
                                        <TableCell>
                                            <div>
                                                <RelativeTime date={key.createdAt} />
                                                <p className="text-xs text-muted-foreground">oleh {key.createdByName}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {key.lastUsedAt ? <RelativeTime date={key.lastUsedAt} /> : 'Belum pernah'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-3 w-3" /> Cabut</Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Anda yakin ingin mencabut kunci ini?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Tindakan ini tidak dapat dibatalkan. Semua aplikasi atau layanan yang menggunakan kunci "{key.name}" ini akan kehilangan akses.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleRevoke(key.id)}>Ya, Cabut Kunci</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <GenerateTokenDialog onGenerated={() => {
                    setIsDialogOpen(false);
                    fetchKeys();
                }} />
            </Dialog>
        </>
    );
}
