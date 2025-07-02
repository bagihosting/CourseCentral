'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAllUsers, updateUser, registerUser } from '@/lib/data';
import type { UpdateUserInput, RegisterUserInput } from '@/lib/data';
import { uploadAvatarAction } from '@/actions/files';
import { useToast } from '@/hooks/use-toast';
import { User, Pencil, Loader2, Camera, PlusCircle } from 'lucide-react';
import type { User as UserType } from '@/types';
import imageCompression from 'browser-image-compression';


export default function AdminPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const refreshUsers = () => {
    setUsers(getAllUsers());
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const handleOpenDialog = (user: UserType | null) => {
    setSelectedUser(user);
    if (user) { // Edit mode
        setName(user.name);
        setUsername(user.username);
        setAvatarPreview(user.avatarUrl);
        setPassword('');
    } else { // Add mode
        setName('');
        setUsername('');
        setAvatarPreview(undefined);
        setPassword('');
    }
    setAvatarFile(null);
    setIsDialogOpen(true);
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 800,
            useWebWorker: true,
            fileType: 'image/webp',
        };
        const compressedFile = await imageCompression(file, options);
        setAvatarFile(compressedFile);
        setAvatarPreview(URL.createObjectURL(compressedFile));
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
      let newAvatarUrl: string | undefined = selectedUser?.avatarUrl;

      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        const result = await uploadAvatarAction(formData);
        if (result.error || !result.avatarUrl) {
          throw new Error(result.error || 'Gagal mengunggah avatar.');
        }
        newAvatarUrl = result.avatarUrl;
      }

      if (selectedUser) {
        // --- UPDATE LOGIC ---
        const updateData: UpdateUserInput = {
          name: name,
          avatarUrl: newAvatarUrl,
        };
        if (password.trim() !== '') {
          updateData.password = password;
        }
        updateUser(selectedUser.id, updateData);
        toast({
          title: 'Sukses',
          description: `Data pengguna ${name} berhasil diperbarui.`,
        });
      } else {
        // --- CREATE LOGIC ---
        if (!username || password.trim() === '') {
          throw new Error('Nama pengguna dan kata sandi wajib diisi untuk anggota baru.');
        }
        const createData: RegisterUserInput & { avatarUrl?: string } = {
          name,
          username,
          password,
          avatarUrl: newAvatarUrl,
        };
        registerUser(createData);
        toast({
          title: 'Sukses',
          description: `Anggota baru ${name} berhasil ditambahkan.`,
        });
      }

      refreshUsers();
      setIsDialogOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
      toast({
        title: 'Gagal Menyimpan',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  <TableHead>Peran</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                      </Avatar>
                      {user.name}
                    </TableCell>
                    <TableCell>{user.role === 'admin' ? 'Admin' : 'Member'}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="outline" size="sm" onClick={() => handleOpenDialog(user)} disabled={user.role === 'admin'}>
                          <Pencil className="h-3 w-3 mr-2" />
                          Ubah
                        </Button>
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
                    <Label htmlFor="password">Kata Sandi</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={selectedUser ? "Biarkan kosong jika tidak ingin mengubah" : "Wajib diisi"} required={!selectedUser} />
                </div>

                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="ghost">Batal</Button></DialogClose>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Simpan Perubahan
                    </Button>
                </DialogFooter>
            </form>
          </DialogContent>
      </Dialog>
    </>
  );
}
