'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getPaymentSettings, addPaymentAccount, updatePaymentAccount, deletePaymentAccount } from '@/lib/data';
import type { PaymentAccount } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Pencil, Trash2 } from 'lucide-react';

function PaymentAccountForm({ account, onFinished }: { account?: PaymentAccount, onFinished: () => void }) {
    const [bankName, setBankName] = useState(account?.bankName || '');
    const [accountNumber, setAccountNumber] = useState(account?.accountNumber || '');
    const [accountHolder, setAccountHolder] = useState(account?.accountHolder || '');
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!bankName || !accountNumber || !accountHolder) {
            toast({ title: "Gagal", description: "Semua kolom wajib diisi.", variant: "destructive" });
            return;
        }
        setSaving(true);
        try {
            if (account) {
                updatePaymentAccount(account.id, { bankName, accountNumber, accountHolder });
                toast({ title: 'Sukses', description: 'Akun pembayaran berhasil diperbarui.' });
            } else {
                addPaymentAccount({ bankName, accountNumber, accountHolder });
                toast({ title: 'Sukses', description: 'Akun pembayaran berhasil ditambahkan.' });
            }
            onFinished();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
            toast({ title: 'Gagal Menyimpan', description: errorMessage, variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="bankName">Nama Bank</Label>
                <Input id="bankName" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Contoh: Bank BCA" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="accountNumber">Nomor Rekening</Label>
                <Input id="accountNumber" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Contoh: 1234567890" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="accountHolder">Nama Pemilik Rekening</Label>
                <Input id="accountHolder" value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} placeholder="Contoh: PT Aplikasi Kursus" />
            </div>
            <DialogFooter>
                <DialogClose asChild><Button type="button" variant="ghost">Batal</Button></DialogClose>
                <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simpan
                </Button>
            </DialogFooter>
        </form>
    );
}

export default function CourseSettingsPage() {
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setFormOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<PaymentAccount | undefined>(undefined);
  const { toast } = useToast();

  const refreshPaymentAccounts = () => {
    const settings = getPaymentSettings();
    setPaymentAccounts(settings);
  };

  useEffect(() => {
    refreshPaymentAccounts();
    setLoading(false);
  }, []);

  const handleOpenForm = (account?: PaymentAccount) => {
    setSelectedAccount(account);
    setFormOpen(true);
  };

  const handleFormFinished = () => {
    setFormOpen(false);
    refreshPaymentAccounts();
  };

  const handleDelete = (accountId: string) => {
    try {
      deletePaymentAccount(accountId);
      toast({ title: 'Sukses', description: 'Akun pembayaran berhasil dihapus.' });
      refreshPaymentAccounts();
    } catch (error) {
       const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
      toast({ title: 'Gagal Menghapus', description: errorMessage, variant: 'destructive' });
    }
  };

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Pengaturan Global</h1>
          <p className="text-muted-foreground">Kelola pengaturan global untuk platform kursus Anda.</p>
        </div>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pengaturan Pembayaran</CardTitle>
              <CardDescription>
                Konfigurasi rekening bank untuk menerima pembayaran upgrade ke Pro.
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenForm()}>
              <PlusCircle className="mr-2" />
              Tambah Akun
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Bank</TableHead>
                  <TableHead>Nomor Rekening</TableHead>
                  <TableHead>Atas Nama</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentAccounts.length > 0 ? (
                  paymentAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.bankName}</TableCell>
                      <TableCell>{account.accountNumber}</TableCell>
                      <TableCell>{account.accountHolder}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleOpenForm(account)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon" className="h-8 w-8">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Anda yakin ingin menghapus?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tindakan ini tidak dapat dibatalkan. Akun pembayaran ini akan dihapus secara permanen.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(account.id)}>Hapus</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Belum ada akun pembayaran.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pengaturan Umum</CardTitle>
            <CardDescription>Konfigurasi dasar untuk platform Anda.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="platform-name">Nama Platform</Label>
              <Input id="platform-name" defaultValue="Aplikasi Kursus" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Bahasa Default</Label>
              <Select defaultValue="id">
                <SelectTrigger id="language">
                  <SelectValue placeholder="Pilih bahasa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id">Bahasa Indonesia</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Mata Uang Default</Label>
              <Select defaultValue="idr">
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Pilih mata uang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="idr">IDR - Rupiah Indonesia</SelectItem>
                  <SelectItem value="usd">USD - United States Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Pengaturan AI</CardTitle>
            <CardDescription>Kelola fitur berbasis kecerdasan buatan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="ai-recommendations" className="font-semibold">Aktifkan Rekomendasi AI</Label>
                <p className="text-sm text-muted-foreground">
                  Tampilkan saran kursus yang dipersonalisasi di halaman katalog.
                </p>
              </div>
              <Switch id="ai-recommendations" defaultChecked />
            </div>
             <div className="space-y-2">
              <Label htmlFor="ai-model">Model AI</Label>
              <Select defaultValue="gemini-flash">
                <SelectTrigger id="ai-model">
                  <SelectValue placeholder="Pilih model AI" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini-flash">Gemini 2.0 Flash (Direkomendasikan)</SelectItem>
                  <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button>
            Simpan Perubahan
          </Button>
        </div>
      </div>
      
      <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{selectedAccount ? 'Ubah Akun Pembayaran' : 'Tambah Akun Pembayaran Baru'}</DialogTitle>
            </DialogHeader>
            <PaymentAccountForm account={selectedAccount} onFinished={handleFormFinished} />
        </DialogContent>
      </Dialog>
    </>
  );
}
