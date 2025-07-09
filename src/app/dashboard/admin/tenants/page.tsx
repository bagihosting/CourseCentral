
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getAllTenants } from '@/actions/tenants';
import type { Tenant } from '@/types';
import { Building, PlusCircle } from 'lucide-react';
import { RelativeTime } from '@/components/relative-time';
import Link from 'next/link';

export default function TenantsPage() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const tenantsData = await getAllTenants();
                // Filter out the main platform tenant from the list view
                setTenants(tenantsData.filter(t => t.id !== 'platform_main'));
            } catch (error) {
                console.error("Failed to fetch tenants:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <Skeleton className="h-7 w-64 mb-2" />
                        <Skeleton className="h-5 w-96" />
                    </div>
                     <Skeleton className="h-10 w-36" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-48 w-full" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2"><Building />Manajemen Tenant</CardTitle>
                    <CardDescription>Buat dan kelola instansi kursus terpisah untuk setiap klien atau pengajar utama.</CardDescription>
                </div>
                 <Button asChild>
                    <Link href="/dashboard/admin/tenants/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Buat Tenant Baru
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama Tenant</TableHead>
                            <TableHead>Subdomain</TableHead>
                            <TableHead>Admin Utama</TableHead>
                            <TableHead>Tanggal Dibuat</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tenants.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    Belum ada tenant yang dibuat.
                                </TableCell>
                            </TableRow>
                        ) : (
                            tenants.map((tenant) => (
                                <TableRow key={tenant.id}>
                                    <TableCell className="font-medium">{tenant.name}</TableCell>
                                    <TableCell>
                                        <a href={`http://${tenant.subdomain}.localhost:3000`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-mono">
                                            {tenant.subdomain}
                                        </a>
                                    </TableCell>
                                    <TableCell>{tenant.ownerId}</TableCell>
                                    <TableCell><RelativeTime date={tenant.createdAt} /></TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
