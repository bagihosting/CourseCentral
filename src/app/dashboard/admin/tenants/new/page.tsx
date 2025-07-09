
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Building, User } from 'lucide-react';
import { createTenant } from '@/actions/tenants';
import { validatePassword } from '@/lib/validation';
import Link from 'next/link';

export default function NewTenantPage() {
    const [tenantName, setTenantName] = useState('');
    const [subdomain, setSubdomain] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [ownerUsername, setOwnerUsername] = useState('');
    const [ownerPassword, setOwnerPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleSubdomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        setSubdomain(value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validatePassword(ownerPassword)) {
            toast({
                title: 'Kata Sandi Lemah',
                description: 'Kata sandi admin tidak memenuhi persyaratan keamanan.',
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await createTenant({
                tenantName,
                subdomain,
                ownerName,
                ownerUsername,
                ownerPassword,
            });
            toast({
                title: 'Sukses!',
                description: `Tenant "${tenantName}" berhasil dibuat.`,
            });
            router.push('/dashboard/admin/tenants');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
            toast({
                title: 'Gagal Membuat Tenant',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex justify-start mb-4">
                <Button variant="outline" asChild>
                    <Link href="/dashboard/admin/tenants">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke Daftar Tenant
                    </Link>
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Buat Tenant Baru</CardTitle>
                    <CardDescription>Buat sebuah instansi kursus baru yang terisolasi dengan adminnya sendiri.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Tenant Details */}
                    <div className="space-y-4 p-4 border rounded-lg">
                        <h3 className="font-semibold text-lg flex items-center gap-2"><Building className="h-5 w-5"/>Detail Tenant</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="tenantName">Nama Tenant</Label>
                                <Input id="tenantName" value={tenantName} onChange={(e) => setTenantName(e.target.value)} required placeholder="Contoh: Akademi Koding" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subdomain">Subdomain</Label>
                                <div className="flex items-center">
                                    <Input id="subdomain" value={subdomain} onChange={handleSubdomainChange} required placeholder="akademikoding" className="rounded-r-none" />
                                    <span className="inline-flex items-center px-3 text-sm text-muted-foreground rounded-r-md border border-l-0 bg-muted h-10">.domainutama.com</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Admin Details */}
                     <div className="space-y-4 p-4 border rounded-lg">
                        <h3 className="font-semibold text-lg flex items-center gap-2"><User className="h-5 w-5"/>Admin Utama Tenant</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="ownerName">Nama Lengkap Admin</Label>
                                <Input id="ownerName" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} required placeholder="Contoh: Budi Sanjaya" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ownerUsername">Username Admin</Label>
                                <Input id="ownerUsername" value={ownerUsername} onChange={(e) => setOwnerUsername(e.target.value)} required placeholder="Contoh: budi_admin" />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="ownerPassword">Kata Sandi Admin</Label>
                            <Input id="ownerPassword" type="password" value={ownerPassword} onChange={(e) => setOwnerPassword(e.target.value)} required />
                             <p className="text-xs text-muted-foreground">
                                Minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan karakter khusus.
                            </p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Buat Tenant
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
