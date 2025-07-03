'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getPaymentSettings, addPaymentAccount, updatePaymentAccount, deletePaymentAccount, getSeoSettings, updateSeoSettings } from '@/lib/data';
import type { PaymentAccount, SeoSettings } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Pencil, Trash2, Globe, Wand2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { generateTitleSuffixAction } from '@/actions/ai';


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
  const [seoSettings, setSeoSettings] = useState<SeoSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setFormOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<PaymentAccount | undefined>(undefined);
  const [isSavingSeo, setIsSavingSeo] = useState(false);
  const [isGeneratingSuffix, setIsGeneratingSuffix] = useState(false);
  const [platformName, setPlatformName] = useState('Aplikasi Kursus');
  const { toast } = useToast();

  const refreshPaymentAccounts = () => {
    const settings = getPaymentSettings();
    setPaymentAccounts(settings);
  };

  useEffect(() => {
    refreshPaymentAccounts();
    setSeoSettings(getSeoSettings());
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

  const handleSaveSeo = () => {
    if (!seoSettings) return;
    setIsSavingSeo(true);
    try {
      updateSeoSettings(seoSettings);
      toast({ title: 'Sukses', description: 'Pengaturan SEO berhasil disimpan.' });
    } catch (error) {
       const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
      toast({ title: 'Gagal Menyimpan SEO', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsSavingSeo(false);
    }
  };
  
  const handleGenerateTitleSuffix = async () => {
    if (!platformName || !seoSettings?.metaDescription) {
        toast({ title: 'Input Diperlukan', description: 'Nama platform dan deskripsi meta global harus diisi.', variant: 'destructive' });
        return;
    }
    setIsGeneratingSuffix(true);
    const result = await generateTitleSuffixAction({
        platformName: platformName,
        platformDescription: seoSettings.metaDescription
    });
    setIsGeneratingSuffix(false);

    if('error' in result) {
        toast({ title: 'Gagal Membuat Akhiran Judul', description: result.error, variant: 'destructive'});
    } else {
        setSeoSettings(prev => ({...prev!, titleSuffix: result.titleSuffix}));
        toast({ title: 'Sukses', description: 'Saran akhiran judul berhasil dibuat oleh AI.'});
    }
  };

  if (loading) {
    return (
        <div className="space-y-6">
            <div>
                <Skeleton className="h-9 w-64 mb-2" />
                <Skeleton className="h-5 w-80" />
            </div>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <Skeleton className="h-6 w-56 mb-2" />
                        <Skeleton className="h-4 w-72" />
                    </div>
                    <Skeleton className="h-10 w-36" />
                </CardHeader>
                <CardContent>
                    <div className="w-full space-y-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Pengaturan Global</h1>
          <p className="text-muted-foreground">Kelola pengaturan global untuk platform kursus Anda.</p>
        </div>
        
        <Card>
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle>Pengaturan Pembayaran</CardTitle>
              <CardDescription>
                Konfigurasi rekening bank untuk menerima pembayaran upgrade ke Pro.
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenForm()} className="w-full md:w-auto">
              <PlusCircle className="mr-2" />
              Tambah Akun
            </Button>
          </CardHeader>
          <CardContent>
            {/* Desktop View: Table */}
            <div className="hidden md:block">
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
            </div>

            {/* Mobile View: Cards */}
            <div className="md:hidden space-y-4">
                {paymentAccounts.length > 0 ? (
                paymentAccounts.map((account) => (
                    <Card key={account.id}>
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start gap-4">
                                <div className="space-y-1">
                                    <p className="font-semibold">{account.bankName}</p>
                                    <p className="text-sm text-muted-foreground font-mono">{account.accountNumber}</p>
                                    <p className="text-sm text-muted-foreground">{account.accountHolder}</p>
                                </div>
                                <div className="flex shrink-0 space-x-2">
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
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))
                ) : (
                <div className="h-24 text-center flex items-center justify-center text-muted-foreground">
                    Belum ada akun pembayaran.
                </div>
                )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Pengaturan SEO
            </CardTitle>
            <CardDescription>
              Kelola metadata global untuk optimisasi mesin pencari (SEO).
            </CardDescription>
          </CardHeader>
          {seoSettings && (
            <>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="titleSuffix">Akhiran Judul (Title Suffix)</Label>
                    <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0 text-sm"
                        onClick={handleGenerateTitleSuffix}
                        disabled={isGeneratingSuffix || !platformName || !seoSettings.metaDescription}
                    >
                        {isGeneratingSuffix ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        Buat dengan AI
                    </Button>
                  </div>
                  <Input
                    id="titleSuffix"
                    name="titleSuffix"
                    value={seoSettings.titleSuffix}
                    onChange={(e) => setSeoSettings(prev => ({...prev!, titleSuffix: e.target.value}))}
                    placeholder="| Nama Platform Anda"
                    disabled={isGeneratingSuffix}
                  />
                  <p className="text-xs text-muted-foreground">Teks ini akan ditambahkan di akhir setiap judul halaman.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Deskripsi Meta Global</Label>
                  <Textarea
                    id="metaDescription"
                    name="metaDescription"
                    value={seoSettings.metaDescription}
                    onChange={(e) => setSeoSettings(prev => ({...prev!, metaDescription: e.target.value}))}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">Deskripsi default untuk halaman yang tidak memiliki deskripsi khusus (150-160 karakter).</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaKeywords">Kata Kunci Meta Global</Label>
                  <Input
                    id="metaKeywords"
                    name="metaKeywords"
                    value={seoSettings.metaKeywords}
                    onChange={(e) => setSeoSettings(prev => ({...prev!, metaKeywords: e.target.value}))}
                    placeholder="kursus online, belajar, skill"
                  />
                  <p className="text-xs text-muted-foreground">Pisahkan kata kunci dengan koma.</p>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button onClick={handleSaveSeo} disabled={isSavingSeo || isGeneratingSuffix}>
                  {isSavingSeo && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan Pengaturan SEO
                </Button>
              </CardFooter>
            </>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pengaturan Umum</CardTitle>
            <CardDescription>Konfigurasi dasar untuk platform Anda.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="platform-name">Nama Platform</Label>
              <Input id="platform-name" value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
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
          </CardContent>
        </Card>
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
