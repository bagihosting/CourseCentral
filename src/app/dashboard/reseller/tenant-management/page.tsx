
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
import { getTenantForReseller, createOrUpdateTenantForReseller } from '@/actions/reseller';
import { Loader2, Save, Building, AlertTriangle, Link as LinkIcon, CheckCircle } from 'lucide-react';
import type { Tenant } from '@/types';
import Image from 'next/image';

export default function TenantManagementPage() {
    const { user, loading: userLoading } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [subdomain, setSubdomain] = useState('');
    const [brandName, setBrandName] = useState('');
    const [brandLogoUrl, setBrandLogoUrl] = useState('');
    const [brandPrimaryColor, setBrandPrimaryColor] = useState('#6a2cf5'); // Default to platform primary

    useEffect(() => {
        async function fetchData() {
            if (user) {
                const existingTenant = await getTenantForReseller(user.id);
                if (existingTenant) {
                    setTenant(existingTenant);
                    setSubdomain(existingTenant.subdomain || '');
                    setBrandName(existingTenant.brandName || '');
                    setBrandLogoUrl(existingTenant.brandLogoUrl || '');
                    setBrandPrimaryColor(existingTenant.brandPrimaryColor || '#6a2cf5');
                }
            }
            setLoading(false);
        }
        if (!userLoading) {
            fetchData();
        }
    }, [user, userLoading]);

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
            await createOrUpdateTenantForReseller({
                resellerId: user.id,
                subdomain,
                brandName,
                brandLogoUrl: brandLogoUrl || undefined,
                brandPrimaryColor: brandPrimaryColor || undefined
            });
            toast({ title: 'Sukses', description: 'Pengaturan tenant Anda telah disimpan.' });
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
            const hostname = window.location.hostname;
            // Handle localhost and production domains
            if (hostname === 'localhost') {
                setMainPlatformDomain('localhost:3000');
            } else {
                // Extracts the main domain (e.g., 'example.com' from 'www.example.com')
                const parts = hostname.split('.');
                setMainPlatformDomain(parts.slice(-2).join('.'));
            }
        }
    }, []);


    if (loading || userLoading) {
        return <Skeleton className="w-full h-96" />;
    }

    if (user?.role !== 'reseller') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Akses Ditolak</CardTitle>
                    <CardDescription>Hanya Reseller yang dapat mengakses halaman ini.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Building /> Manajemen Tenant</CardTitle>
                    <CardDescription>
                        Atur identitas unik untuk platform kursus Anda. Setelah disimpan, situs Anda akan aktif di subdomain yang Anda pilih.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {tenant && (
                         <Alert variant="default" className="border-green-500/50 text-green-700 dark:text-green-400 [&>svg]:text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <AlertTitle>Situs Anda Aktif!</AlertTitle>
                            <AlertDescription>
                                Anda dapat mengunjungi situs Anda di: 
                                <a href={`http://${tenant.subdomain}.${mainPlatformDomain}`} target="_blank" rel="noopener noreferrer" className="font-bold underline ml-1">
                                    {`http://${tenant.subdomain}.${mainPlatformDomain}`}
                                </a>
                            </AlertDescription>
                        </Alert>
                    )}

                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Penting: Konfigurasi DNS</AlertTitle>
                        <AlertDescription>
                            Agar subdomain Anda berfungsi, Anda **HARUS** membuat `CNAME record` di pengaturan DNS domain Anda untuk mengarahkan subdomain Anda ke domain platform ini: <strong className="font-mono">{mainPlatformDomain}</strong>.
                            <br />
                            Contoh: `CNAME {subdomain || 'subdomainanda'}.domainanda.com -> {mainPlatformDomain}`.
                            <br/>
                             Perubahan DNS mungkin memerlukan waktu hingga 24 jam untuk aktif.
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
                        {tenant ? 'Simpan Perubahan' : 'Buat Tenant Saya'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
