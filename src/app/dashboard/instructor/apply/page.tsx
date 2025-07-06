
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { applyForInstructor } from '@/actions/instructor';
import { Loader2, Sparkles, GraduationCap, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function BecomeInstructorPage() {
    const { user, loading: userLoading, updateUser } = useAuth();
    const { toast } = useToast();
    const [isApplying, setIsApplying] = useState(false);
    
    useEffect(() => {
      // Potentially refresh user data if this page is visited
    }, [user]);

    const handleApply = async () => {
        if (!user) return;
        setIsApplying(true);
        try {
            await applyForInstructor(user.id);
            await updateUser({}); // Refresh user context
            toast({ title: 'Sukses!', description: 'Permintaan Anda telah dikirim. Admin akan segera meninjaunya.' });
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

    if (!user || (user.role !== 'pro' && user.role !== 'member')) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Akses Ditolak</CardTitle>
                    <CardDescription>Hanya member Pro yang dapat mengajukan diri menjadi pengajar.</CardDescription>
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
        switch (user.instructorStatus) {
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
                            Permintaan Anda telah disetujui. Anda sekarang adalah seorang pengajar. Mulai buat konten Anda!
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
                        {isApplying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GraduationCap className="mr-2 h-4 w-4" />}
                        Ajukan Diri Menjadi Pengajar
                    </Button>
                );
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Menjadi Pengajar</CardTitle>
                <CardDescription>Bagikan keahlian Anda dan dapatkan komisi dengan membuat materi pelatihan di platform kami.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/30">
                    <h4 className="font-semibold">Keuntungan Menjadi Pengajar:</h4>
                    <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground space-y-1">
                        <li>Buat dan kelola konten kursus Anda sendiri.</li>
                        <li>Jangkau audiens yang luas dan bersemangat.</li>
                        <li>Dapatkan komisi untuk setiap 10 materi pelajaran yang Anda buat.</li>
                        <li>Bangun portofolio dan reputasi Anda sebagai seorang ahli.</li>
                    </ul>
                </div>
                <div className="pt-4 border-t">
                    {renderStatus()}
                </div>
            </CardContent>
        </Card>
    );
}
