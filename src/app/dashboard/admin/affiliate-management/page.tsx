
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign } from 'lucide-react';
import { getAffiliateStats } from '@/actions/affiliate';
import type { AffiliateStat } from '@/types';

export default function AffiliateManagementPage() {
    const [stats, setStats] = useState<AffiliateStat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setStats(await getAffiliateStats());
            setLoading(false);
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-64 mb-2" />
                    <Skeleton className="h-5 w-96" />
                </CardHeader>
                <CardContent>
                    <div className="w-full space-y-2">
                        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><DollarSign />Manajemen Afiliasi</CardTitle>
                <CardDescription>
                    Monitor statistik performa afiliasi dari semua member Pro dan Pengajar.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama Pengguna</TableHead>
                            <TableHead>Jumlah Rujukan</TableHead>
                            <TableHead>Saldo Belum Dibayar</TableHead>
                            <TableHead>Total Telah Dibayar</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {stats.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    Belum ada data afiliasi untuk ditampilkan.
                                </TableCell>
                            </TableRow>
                        ) : (
                            stats.map(stat => (
                                <TableRow key={stat.userId}>
                                    <TableCell className="font-medium">{stat.userName}</TableCell>
                                    <TableCell>{stat.referralCount}</TableCell>
                                    <TableCell>
                                        <Badge variant={stat.unpaidBalance > 0 ? "default" : "secondary"}>
                                            Rp{stat.unpaidBalance.toLocaleString('id-ID')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>Rp{stat.totalPaid.toLocaleString('id-ID')}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
