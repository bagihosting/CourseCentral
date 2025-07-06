
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { getInstructorBranding, saveInstructorBranding } from '@/actions/instructor';
import { Loader2, Save, Palette, AlertTriangle, Link as LinkIcon } from 'lucide-react';
import type { InstructorBranding } from '@/types';
import Image from 'next/image';

export default function BrandingSettingsPage() {
    const { user, loading: userLoading } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [customDomain, setCustomDomain] = useState('');
    const [brandName, setBrandName] = useState('');
    const [brandLogoUrl, setBrandLogoUrl] = useState('');
    const [brandPrimaryColor, setBrandPrimaryColor] = useState('#6a2cf5'); // Default to platform primary

    useEffect(() => {
        async function fetchData() {
            if (user) {
                const settings = await getInstructorBranding(user.id);
                if (settings) {
                    setCustomDomain(settings.customDomain || '');
                    setBrandName(settings.brandName || '');
                    setBrandLogoUrl(settings.brandLogoUrl || '');
                    setBrandPrimaryColor(settings.brandPrimaryColor || '#6a2cf5');
                }
            }
            setLoading(false);
        }
        if (!userLoading) {
            fetchData();
        }
    }, [user, userLoading]);

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            const data: Partial<InstructorBranding> = {
                customDomain: customDomain || null,
                brandName: brandName || null,
                brandLogoUrl: brandLogoUrl || null,
                brandPrimaryColor: brandPrimaryColor || null,
            };
            await saveInstructorBranding(user.id, data);
            toast({ title: 'Sukses', description: 'Pengaturan merek Anda telah disimpan.' });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
            toast({ title: 'Gagal Menyimpan', description: errorMessage, variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };
    
    const [mainPlatformDomain, setMainPlatformDomain] = useState('');
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setMainPlatformDomain(window.location.hostname);
        }
    }, []);


    if (loading || userLoading) {
        return <Skeleton className="w-full h-96" />;
    }

    if (user?.role !== 'instructor' && user?.role !== 'admin') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Akses Ditolak</CardTitle>
                    <CardDescription>Hanya Pengajar yang dapat mengakses halaman ini.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Palette /> Pengaturan Merek (White-Label)</CardTitle>
                    <CardDescription>
                        Sesuaikan tampilan platform agar terlihat seperti milik Anda. Dengan domain kustom, link afiliasi Anda akan otomatis menggunakan domain tersebut.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Penting: Konfigurasi DNS</AlertTitle>
                        <AlertDescription>
                            Agar Domain Kustom berfungsi, Anda **HARUS** membuat `CNAME record` di pengaturan DNS domain Anda untuk mengarahkan subdomain Anda ke domain platform ini: <strong className="font-mono">{mainPlatformDomain}</strong>.
                            <br />
                            Contoh: `CNAME kursus.brandanda.com -> {mainPlatformDomain}`.
                            <br/>
                             Perubahan DNS mungkin memerlukan waktu hingga 24 jam untuk aktif.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                        <Label htmlFor="customDomain">Domain Kustom (Opsional)</Label>
                        <div className="flex items-center">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted h-10"><LinkIcon className="h-4 w-4 text-muted-foreground"/></span>
                             <Input 
                                id="customDomain" 
                                value={customDomain} 
                                onChange={(e) => setCustomDomain(e.target.value)} 
                                placeholder="kursus.brandanda.com"
                                className="rounded-l-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="brandName">Nama Merek / Aplikasi</Label>
                        <Input 
                            id="brandName" 
                            value={brandName} 
                            onChange={(e) => setBrandName(e.target.value)} 
                            placeholder="Contoh: Akademi Koding Budi"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="brandLogoUrl">URL Logo Merek</Label>
                        <Input 
                            id="brandLogoUrl" 
                            value={brandLogoUrl} 
                            onChange={(e) => setBrandLogoUrl(e.target.value)} 
                            placeholder="https://.../logo.png"
                        />
                        {brandLogoUrl && (
                            <div className="p-4 bg-muted rounded-md mt-2 flex items-center justify-center">
                                <Image src={brandLogoUrl} alt="Pratinjau Logo" width={150} height={50} className="object-contain" />
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="brandPrimaryColor">Warna Primer Merek</Label>
                         <div className="flex items-center gap-2">
                            <Input 
                                id="brandPrimaryColor" 
                                value={brandPrimaryColor} 
                                onChange={(e) => setBrandPrimaryColor(e.target.value)}
                                className="w-40"
                            />
                            <Input type="color" value={brandPrimaryColor} onChange={(e) => setBrandPrimaryColor(e.target.value)} className="h-10 w-10 p-1"/>
                         </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Simpan Pengaturan
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
