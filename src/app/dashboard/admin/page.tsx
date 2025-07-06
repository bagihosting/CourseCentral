'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAllUsers, updateUser, registerUser, deleteUser, reactivateUser } from '@/actions/users';
import type { UpdateUserInput, RegisterUserInput, User as UserType } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { User, Pencil, Loader2, Camera, PlusCircle, Trash2, BadgeCheck, BadgeX } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

export default function AdminPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const refreshUsers = async () => {
    setLoading(true);
    const usersData = await getAllUsers();
    setUsers(usersData);
    setLoading(false);
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const handleOpenDialog = (user: UserType | null) => {
    setSelectedUser(user);
    if (user) { // Edit mode
        setName(user.name);
        setUsername(user.username);
        setWhatsapp(user.whatsapp || '');
        setAvatarPreview(user.avatarUrl);
        setPassword('');
    } else { // Add mode
        setName('');
        setUsername('');
        setWhatsapp('');
        setAvatarPreview(undefined);
        setPassword('');
    }
    setIsDialogOpen(true);
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
        const options = {
            maxSizeMB: 0.1,
            maxWidthOrHeight: 256,
            useWebWorker: true,
            fileType: 'image/webp',
        };
        const compressedFile = await imageCompression(file, options);
        
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(compressedFile);

    } catch (error) {
        toast({
            title: 'Gagal Mengompres Gambar',
            description: 'Terjadi kesalahan saat mengompres gambar.',
            variant: 'destructive',
        });
        console.error(error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (selectedUser) {
        const updateData: UpdateUserInput = { name, whatsapp, avatarUrl: avatarPreview };
        if (password.trim() !== '') {
          updateData.password = password;
        }
        await updateUser(selectedUser.id, updateData);
        toast({ title: 'Sukses', description: `Data pengguna ${name} berhasil diperbarui.` });
      } else {
        if (!username || password.trim() === '') {
          throw new Error('Nama pengguna dan kata sandi wajib diisi untuk anggota baru.');
        }
        const createData: RegisterUserInput & { avatarUrl?: string } = { name, username, password, whatsapp, avatarUrl: avatarPreview };
        await registerUser(createData);
        toast({ title: 'Sukses', description: `Anggota baru ${name} berhasil ditambahkan.` });
      }
      await refreshUsers();
      setIsDialogOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
      toast({ title: 'Gagal Menyimpan', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      toast({ title: 'Sukses', description: 'Member berhasil dihapus.' });
      await refreshUsers();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
      toast({ title: 'Gagal Menghapus', description: errorMessage, variant: 'destructive' });
    }
  };
  
  const handleReactivateUser = async (userId: string) => {
     try {
      await reactivateUser(userId);
      toast({ title: 'Sukses', description: 'Member berhasil diaktifkan kembali.' });
      await refreshUsers();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
      toast({ title: 'Gagal Aktivasi', description: errorMessage, variant: 'destructive' });
    }
  }
  
  if (loading) {
    return (
      <div className="grid gap-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <Skeleton className="h-7 w-56 mb-2" />
                    <Skeleton className="h-5 w-80" />
                </div>
                <Skeleton className="h-10 w-36" />
            </CardHeader>
            <CardContent>
                <div className="w-full space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Manajemen Pengguna</CardTitle>
                <CardDescription>Lihat, kelola, dan tambah pengguna terdaftar.</CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog(null)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Member
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Pengguna</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Login Terakhir</TableHead>
                  <TableHead className="hidden lg:table-cell">Terdaftar</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className={user.status === 'inactive' ? 'bg-muted/30' : ''}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatarUrl} alt={user.name} />
                          <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                        </Avatar>
                        <div>
                            <p>{user.name}</p>
                            <Badge variant="secondary" className="font-normal capitalize">{user.role}</Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                        {user.status === 'active' ? (
                            <Badge variant="outline" className="border-green-600 text-green-700"><BadgeCheck className="mr-1 h-3 w-3" />Aktif</Badge>
                        ) : (
                             <Badge variant="destructive"><BadgeX className="mr-1 h-3 w-3" />Tidak Aktif</Badge>
                        )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true, locale: id })}</TableCell>
                    <TableCell className="hidden lg:table-cell">{format(new Date(user.createdAt), 'dd MMM yyyy', { locale: id })}</TableCell>
                    <TableCell className="text-right space-x-1">
                        {user.role !== 'admin' && user.status === 'inactive' && (
                             <Button variant="secondary" size="sm" onClick={() => handleReactivateUser(user.id)}>
                                Re-aktivasi
                            </Button>
                        )}
                       <Button variant="outline" size="sm" onClick={() => handleOpenDialog(user)}>
                          <Pencil className="h-3 w-3 mr-2" />
                          Ubah
                        </Button>
                       {user.role !== 'admin' && (
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon" className="h-8 w-8">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Hapus Member Ini?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Tindakan ini akan menghapus member secara permanen, termasuk semua data terkait seperti pendaftaran kursus dan testimoni.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>Ya, Hapus</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                       )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
                <DialogTitle>{selectedUser ? `Ubah Pengguna: ${selectedUser.name}` : 'Tambah Member Baru'}</DialogTitle>
                {selectedUser && (
                     <DialogDescription>
                        Terdaftar: {format(new Date(selectedUser.createdAt), "dd MMMM yyyy", { locale: id })} | Total Login: {selectedUser.loginCount}
                    </DialogDescription>
                )}
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2 flex flex-col items-center">
                    <div className="relative">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={avatarPreview} alt={name} />
                            <AvatarFallback><User className="h-12 w-12" /></AvatarFallback>
                        </Avatar>
                        <Button type="button" size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8" onClick={() => fileInputRef.current?.click()}>
                            <Camera className="h-4 w-4" />
                        </Button>
                    </div>
                    <Input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="username">Nama Pengguna</Label>
                    <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={!!selectedUser} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="whatsapp">Nomor WhatsApp</Label>
                    <Input id="whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="Contoh: 081234567890" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Kata Sandi</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={selectedUser ? "Biarkan kosong jika tidak ingin mengubah" : "Wajib diisi"} required={!selectedUser} />
                </div>

                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="ghost">Batal</Button></DialogClose>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Simpan
                    </Button>
                </DialogFooter>
            </form>
          </DialogContent>
      </Dialog>
    </>
  );
}
    