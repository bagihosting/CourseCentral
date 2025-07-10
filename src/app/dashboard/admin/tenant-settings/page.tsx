
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
import { getTenantById } from '@/lib/tenants';
import { updateTenantBranding } from '@/actions/reseller';
import { Loader2, Save, Palette, AlertTriangle } from 'lucide-react';
import type { Tenant } from '@/types';
import Image from 'next/image';

export default function TenantBrandingPage() {
    const { user, loading: userLoading } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [subdomain, setSubdomain] = useState('');
    const [brandName, setBrandName] = useState('');
    const [brandLogoUrl, setBrandLogoUrl] = useState('');
    const [brandPrimaryColor, setBrandPrimaryColor] = useState('#6a2cf5');
    
    const [mainPlatformDomain, setMainPlatformDomain] = useState('');
    
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const hostname = window.location.hostname;
            if (hostname === 'localhost') {
                setMainPlatformDomain('localhost:3000');
            } else {
                const parts = hostname.split('.');
                setMainPlatformDomain(parts.slice(-2).join('.'));
            }
        }
    }, []);

    useEffect(() => {
        async function fetchData() {
            if (user && user.role === 'admin' && user.tenant_id !== 'platform_main') {
                try {
                    const existingTenant = await getTenantById(user.tenant_id);
                    if (existingTenant) {
                        setTenant(existingTenant);
                        setSubdomain(existingTenant.subdomain || '');
                        setBrandName(existingTenant.brandName || existingTenant.name || '');
                        setBrandLogoUrl(existingTenant.brandLogoUrl || '');
                        setBrandPrimaryColor(existingTenant.brandPrimaryColor || '#6a2cf5');
                    }
                } catch (error) {
                    toast({ title: 'Gagal Memuat Data Tenant', variant: 'destructive'});
                }
            }
            setLoading(false);
        }
        if (!userLoading) {
            fetchData();
        }
    }, [user, userLoading, toast]);
    
    const handleSubdomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        setSubdomain(value);
    };

    const handleSave = async () => {
        if (!user) return;
        if (!subdomain || !brandName) {
            toast({ title: 'Gagal', description: 'Subdomain dan Nama Merek wajib diisi.', variant: 'destructive'});
            return;
        }
        setIsSaving(true);
        try {
            await updateTenantBranding({
                subdomain,
                brandName,
                brandLogoUrl: brandLogoUrl || undefined,
                brandPrimaryColor: brandPrimaryColor || undefined
            });
            toast({ title: 'Sukses', description: 'Pengaturan branding Anda telah disimpan.' });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
            toast({ title: 'Gagal Menyimpan', description: errorMessage, variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || userLoading) {
        return <Skeleton className="w-full h-96" />;
    }
    
    if (user?.tenant_id === 'platform_main') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Fitur Khusus Admin Tenant</CardTitle>
                    <CardDescription>Halaman ini hanya untuk admin tenant (Reseller) untuk mengatur branding situs mereka sendiri.</CardDescription>
                </CardHeader>
            </Card>
        )
    }
    
    if (!tenant) {
         return (
            <Card>
                <CardHeader>
                    <CardTitle>Data Tenant Tidak Ditemukan</CardTitle>
                    <CardDescription>Tidak dapat memuat pengaturan untuk tenant Anda. Silakan hubungi dukungan teknis.</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Palette /> Branding & Domain</CardTitle>
                    <CardDescription>
                        Atur identitas unik untuk platform kursus Anda.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Perhatian: Perubahan DNS</AlertTitle>
                        <AlertDescription>
                            Jika Anda mengubah subdomain, pastikan Anda telah mengarahkan CNAME subdomain baru Anda ke domain platform utama: <strong className="font-mono">{mainPlatformDomain}</strong>. Perubahan DNS mungkin memerlukan waktu untuk aktif.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                        <Label htmlFor="subdomain">Subdomain Pilihan Anda</Label>
                        <div className="flex items-center">
                             <Input 
                                id="subdomain" 
                                value={subdomain} 
                                onChange={handleSubdomainChange} 
                                placeholder="akademikoding"
                                className="rounded-r-none"
                            />
                            <span className="inline-flex items-center px-3 text-sm text-muted-foreground rounded-r-md border border-l-0 bg-muted h-10">.{mainPlatformDomain}</span>
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
                        <Label htmlFor="brandLogoUrl">URL Logo Merek (Opsional)</Label>
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
                        <Label htmlFor="brandPrimaryColor">Warna Primer Merek (Opsional)</Label>
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
                        Simpan Perubahan
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
