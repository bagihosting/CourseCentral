
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { User, CheckCircle, Clock, Loader2, Trash2, UserCheck } from 'lucide-react';
import { getAllUsers, deleteUser, reactivateUser } from '@/actions/users';
import type { User as UserType } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { RelativeTime } from '@/components/relative-time';
import { useAuth } from '@/contexts/auth-context';

export default function AdminUsersPage() {
    const { user: adminUser } = useAuth();
    const [users, setUsers] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const { toast } = useToast();

    const refreshUsers = async () => {
        setLoading(true);
        const data = await getAllUsers();
        setUsers(data);
        setLoading(false);
    };

    useEffect(() => {
        refreshUsers();
    }, []);

    const handleDeleteUser = async (userId: string) => {
        setProcessingId(userId);
        try {
            await deleteUser(userId);
            toast({ title: 'Sukses', description: 'Pengguna telah berhasil dihapus.' });
            await refreshUsers();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Gagal menghapus pengguna.';
            toast({ title: 'Gagal', description: errorMessage, variant: 'destructive' });
        } finally {
            setProcessingId(null);
        }
    };

    const handleReactivateUser = async (userId: string) => {
        setProcessingId(userId);
        try {
            await reactivateUser(userId);
            toast({ title: 'Sukses', description: 'Pengguna telah diaktifkan kembali.' });
            await refreshUsers();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Gagal mengaktifkan pengguna.';
            toast({ title: 'Gagal', description: errorMessage, variant: 'destructive' });
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusBadge = (status: UserType['status']) => {
        switch (status) {
            case 'active':
                return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" /> Aktif</Badge>;
            case 'inactive':
                return <Badge variant="destructive"><Clock className="mr-1 h-3 w-3" /> Tidak Aktif</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

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
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><User /> Manajemen Pengguna</CardTitle>
                <CardDescription>Lihat, kelola, dan lakukan aksi pada semua pengguna yang terdaftar di platform Anda.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Pengguna</TableHead>
                            <TableHead>Peran & Status</TableHead>
                            <TableHead>Terdaftar</TableHead>
                            <TableHead>Login Terakhir</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">Tidak ada pengguna yang ditemukan.</TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={user.avatarUrl} alt={user.name} />
                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold">{user.name}</p>
                                                <p className="text-xs text-muted-foreground">{user.username}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <Badge variant="outline" className="capitalize w-fit">{user.role}</Badge>
                                            {getStatusBadge(user.status)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <RelativeTime date={user.createdAt} fallback="-" />
                                    </TableCell>
                                    <TableCell>
                                        <RelativeTime date={user.lastLoginAt} fallback="Belum pernah" />
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        {user.status === 'inactive' && (
                                            <Button size="sm" variant="outline" onClick={() => handleReactivateUser(user.id)} disabled={!!processingId}>
                                                {processingId === user.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <UserCheck className="mr-2 h-4 w-4"/>}
                                                Aktifkan
                                            </Button>
                                        )}
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="sm" variant="destructive" disabled={!!processingId || adminUser?.id === user.id} title={adminUser?.id === user.id ? "Anda tidak dapat menghapus akun Anda sendiri" : ""}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> Hapus
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Hapus Pengguna: {user.name}?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Tindakan ini tidak dapat dibatalkan. Semua data terkait pengguna ini (pendaftaran, kemajuan, dll.) akan dihapus secara permanen.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="bg-destructive hover:bg-destructive/90">
                                                        {processingId === user.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : 'Ya, Hapus'}
                                                    </AlertDialogAction>
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
    );
}
