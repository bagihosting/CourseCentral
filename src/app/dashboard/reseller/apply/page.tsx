
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { applyForReseller } from '@/actions/reseller';
import { Loader2, Sparkles, Store, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function BecomeResellerPage() {
    const { user, loading: userLoading, updateUser } = useAuth();
    const { toast } = useToast();
    const [isApplying, setIsApplying] = useState(false);
    
    const handleApply = async () => {
        if (!user) return;
        setIsApplying(true);
        try {
            await applyForReseller(user.id);
            await updateUser({}); // Refresh user context
            toast({ title: 'Sukses!', description: 'Permintaan Anda untuk menjadi Reseller telah dikirim. Admin akan segera meninjaunya.' });
        } catch (e: any) {
            toast({ title: 'Gagal', description: e.message, variant: 'destructive' });
        } finally {
            setIsApplying(false);
        }
    };

    if (userLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-48 w-full" />
            </div>
        );
    }

    if (!user || (user.role !== 'pro' && user.role !== 'admin')) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Akses Ditolak</CardTitle>
                    <CardDescription>Hanya member Pro yang dapat mengajukan diri menjadi Reseller.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/dashboard/upgrade">
                            <Sparkles className="mr-2" /> Upgrade ke Pro
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }
    
    const renderStatus = () => {
        switch (user.resellerStatus) {
            case 'pending':
                return (
                    <Alert>
                        <Clock className="h-4 w-4" />
                        <AlertTitle>Permintaan Anda Sedang Ditinjau</AlertTitle>
                        <AlertDescription>
                            Terima kasih telah mengajukan diri. Admin akan segera meninjau aplikasi Anda.
                        </AlertDescription>
                    </Alert>
                );
            case 'approved':
                 return (
                    <Alert className="border-green-500/50 text-green-700 dark:text-green-400 [&>svg]:text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>Selamat!</AlertTitle>
                        <AlertDescription>
                            Permintaan Anda telah disetujui. Anda sekarang adalah seorang Reseller. Anda dapat mulai membuat tenant di halaman Manajemen Tenant.
                        </AlertDescription>
                    </Alert>
                );
             case 'rejected':
                 return (
                    <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Permintaan Ditolak</AlertTitle>
                        <AlertDescription>
                            Mohon maaf, permintaan Anda belum dapat disetujui saat ini. Silakan hubungi admin untuk informasi lebih lanjut.
                        </AlertDescription>
                    </Alert>
                );
            case 'none':
            default:
                return (
                    <Button onClick={handleApply} disabled={isApplying}>
                        {isApplying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Store className="mr-2 h-4 w-4" />}
                        Ajukan Diri Menjadi Reseller
                    </Button>
                );
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Menjadi Reseller (SaaS)</CardTitle>
                <CardDescription>Bangun dan kelola platform kursus Anda sendiri dengan merek dan subdomain pribadi di atas teknologi kami.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/30">
                    <h4 className="font-semibold">Keuntungan Menjadi Reseller:</h4>
                    <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground space-y-1">
                        <li>Dapatkan situs kursus pribadi dengan dasbor admin Anda sendiri.</li>
                        <li>Gunakan subdomain pilihan Anda (contoh: `kursusanda.domainutama.com`).</li>
                        <li>Kelola pengguna dan kursus di dalam lingkungan terisolasi Anda.</li>
                        <li>Manfaatkan semua fitur platform, termasuk aplikasi AI.</li>
                        <li>Branding penuh dengan logo dan warna primer Anda sendiri.</li>
                    </ul>
                </div>
                <div className="pt-4 border-t">
                    {renderStatus()}
                </div>
            </CardContent>
        </Card>
    );
}
