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
import { getPaymentSettings, addPaymentAccount, updatePaymentAccount, deletePaymentAccount, getSeoSettings, updateSeoSettings, getConfirmationContacts, addConfirmationContact, updateConfirmationContact, deleteConfirmationContact } from '@/actions/settings';
import type { PaymentAccount, SeoSettings, ConfirmationContact } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Pencil, Trash2, Globe, Wand2, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { generateTitleSuffixAction, generateMetaDescriptionAction, generateMetaKeywordsAction } from '@/actions/ai';


function PaymentAccountForm({ account, onFinished }: { account?: PaymentAccount, onFinished: () => void }) {
    const [bankName, setBankName] = useState(account?.bankName || '');
    const [accountNumber, setAccountNumber] = useState(account?.accountNumber || '');
    const [accountHolder, setAccountHolder] = useState(account?.accountHolder || '');
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bankName || !accountNumber || !accountHolder) {
            toast({ title: "Gagal", description: "Semua kolom wajib diisi.", variant: "destructive" });
            return;
        }
        setSaving(true);
        try {
            if (account) {
                await updatePaymentAccount(account.id, { bankName, accountNumber, accountHolder });
                toast({ title: 'Sukses', description: 'Akun pembayaran berhasil diperbarui.' });
            } else {
                await addPaymentAccount({ bankName, accountNumber, accountHolder });
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

function ConfirmationContactForm({ contact, onFinished }: { contact?: ConfirmationContact, onFinished: () => void }) {
    const [name, setName] = useState(contact?.name || '');
    const [whatsapp, setWhatsapp] = useState(contact?.whatsapp || '');
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !whatsapp) {
            toast({ title: "Gagal", description: "Semua kolom wajib diisi.", variant: "destructive" });
            return;
        }
        setSaving(true);
        try {
            if (contact) {
                await updateConfirmationContact(contact.id, { name, whatsapp });
                toast({ title: 'Sukses', description: 'Kontak berhasil diperbarui.' });
            } else {
                await addConfirmationContact({ name, whatsapp });
                toast({ title: 'Sukses', description: 'Kontak berhasil ditambahkan.' });
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
                <Label htmlFor="contactName">Nama Kontak</Label>
                <Input id="contactName" value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Admin CS 1" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="contactWhatsapp">Nomor WhatsApp</Label>
                <Input id="contactWhatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="Contoh: 6281234567890" />
                 <p className="text-xs text-muted-foreground">Gunakan format internasional (misal: 628...).</p>
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
  const [confirmationContacts, setConfirmationContacts] = useState<ConfirmationContact[]>([]);
  const [seoSettings, setSeoSettings] = useState<SeoSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const [isPaymentFormOpen, setPaymentFormOpen] = useState(false);
  const [selectedPaymentAccount, setSelectedPaymentAccount] = useState<PaymentAccount | undefined>(undefined);
  
  const [isContactFormOpen, setContactFormOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ConfirmationContact | undefined>(undefined);

  const [isSavingSeo, setIsSavingSeo] = useState(false);
  const [isGeneratingSuffix, setIsGeneratingSuffix] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);
  
  const [platformName, setPlatformName] = useState('');
  const [enableAiSuggestions, setEnableAiSuggestions] = useState(true);
  const { toast } = useToast();

  const refreshPaymentAccounts = async () => {
    setPaymentAccounts(await getPaymentSettings());
  };
  
  const refreshConfirmationContacts = async () => {
    setConfirmationContacts(await getConfirmationContacts());
  };

  useEffect(() => {
    async function fetchData() {
        await refreshPaymentAccounts();
        await refreshConfirmationContacts();
        const settings = await getSeoSettings();
        setSeoSettings(settings);
        setPlatformName(settings.platformName);
        setEnableAiSuggestions(settings.enableAiSuggestions ?? true);
        setLoading(false);
    }
    fetchData();
  }, []);

  const handleOpenPaymentForm = (account?: PaymentAccount) => {
    setSelectedPaymentAccount(account);
    setPaymentFormOpen(true);
  };
  
  const handleOpenContactForm = (contact?: ConfirmationContact) => {
    setSelectedContact(contact);
    setContactFormOpen(true);
  };

  const handlePaymentFormFinished = () => {
    setPaymentFormOpen(false);
    refreshPaymentAccounts();
  };
  
  const handleContactFormFinished = () => {
    setContactFormOpen(false);
    refreshConfirmationContacts();
  };

  const handleDeletePaymentAccount = async (accountId: string) => {
    try {
      await deletePaymentAccount(accountId);
      toast({ title: 'Sukses', description: 'Akun pembayaran berhasil dihapus.' });
      refreshPaymentAccounts();
    } catch (error) {
       const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
      toast({ title: 'Gagal Menghapus', description: errorMessage, variant: 'destructive' });
    }
  };
  
  const handleDeleteContact = async (contactId: string) => {
    try {
      await deleteConfirmationContact(contactId);
      toast({ title: 'Sukses', description: 'Kontak konfirmasi berhasil dihapus.' });
      refreshConfirmationContacts();
    } catch (error) {
       const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
      toast({ title: 'Gagal Menghapus', description: errorMessage, variant: 'destructive' });
    }
  };

  const handleSaveSeo = async () => {
    if (!seoSettings) return;
    setIsSavingSeo(true);
    try {
      await updateSeoSettings(seoSettings);
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

  const handleGenerateMetaDescription = async () => {
    if (!platformName || !seoSettings?.titleSuffix) {
        toast({ title: 'Input Diperlukan', description: 'Nama platform dan akhiran judul SEO harus diisi.', variant: 'destructive' });
        return;
    }
    setIsGeneratingDesc(true);
    const result = await generateMetaDescriptionAction({
        platformName: platformName,
        titleSuffix: seoSettings.titleSuffix
    });
    setIsGeneratingDesc(false);

    if('error' in result) {
        toast({ title: 'Gagal Membuat Deskripsi', description: result.error, variant: 'destructive'});
    } else {
        setSeoSettings(prev => ({...prev!, metaDescription: result.metaDescription}));
        toast({ title: 'Sukses', description: 'Deskripsi meta global berhasil dibuat oleh AI.'});
    }
  };

  const handleGenerateMetaKeywords = async () => {
    if (!platformName || !seoSettings?.metaDescription) {
        toast({ title: 'Input Diperlukan', description: 'Nama platform dan deskripsi meta harus diisi.', variant: 'destructive' });
        return;
    }
    setIsGeneratingKeywords(true);
    const result = await generateMetaKeywordsAction({
        platformName: platformName,
        platformDescription: seoSettings.metaDescription
    });
    setIsGeneratingKeywords(false);

    if('error' in result) {
        toast({ title: 'Gagal Membuat Kata Kunci', description: result.error, variant: 'destructive'});
    } else {
        setSeoSettings(prev => ({...prev!, metaKeywords: result.metaKeywords}));
        toast({ title: 'Sukses', description: 'Saran kata kunci berhasil dibuat oleh AI.'});
    }
  };

  const handleSaveGeneral = async () => {
    if (!platformName.trim()) {
      toast({ title: 'Input Diperlukan', description: 'Nama platform tidak boleh kosong.', variant: 'destructive' });
      return;
    }
    setIsSavingGeneral(true);
    try {
      await updateSeoSettings({ ...seoSettings, platformName, enableAiSuggestions });
      toast({ title: 'Sukses', description: 'Pengaturan umum berhasil disimpan.' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
      toast({ title: 'Gagal Menyimpan', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsSavingGeneral(false);
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
            <Button onClick={() => handleOpenPaymentForm()} className="w-full md:w-auto">
              <PlusCircle className="mr-2" />
              Tambah Akun
            </Button>
          </CardHeader>
          <CardContent>
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
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleOpenPaymentForm(account)}>
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
                                <AlertDialogAction onClick={() => handleDeletePaymentAccount(account.id)}>Hapus</AlertDialogAction>
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
            <div className="md:hidden space-y-4">
                {paymentAccounts.length > 0 ? (
                paymentAccounts.map((account) => (
                    <Card key={account.id}><CardContent className="p-4"><div className="flex justify-between items-start gap-4"><div className="space-y-1"><p className="font-semibold">{account.bankName}</p><p className="text-sm text-muted-foreground font-mono">{account.accountNumber}</p><p className="text-sm text-muted-foreground">{account.accountHolder}</p></div><div className="flex shrink-0 space-x-2"><Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleOpenPaymentForm(account)}><Pencil className="h-4 w-4" /></Button><AlertDialog><AlertDialogTrigger asChild><Button variant="destructive" size="icon" className="h-8 w-8"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Anda yakin ingin menghapus?</AlertDialogTitle><AlertDialogDescription>Tindakan ini tidak dapat dibatalkan. Akun pembayaran ini akan dihapus secara permanen.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={() => handleDeletePaymentAccount(account.id)}>Hapus</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div></div></CardContent></Card>
                ))
                ) : (
                <div className="h-24 text-center flex items-center justify-center text-muted-foreground">Belum ada akun pembayaran.</div>
                )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle>Kontak Konfirmasi WhatsApp</CardTitle>
              <CardDescription>
                Kelola nomor WhatsApp yang akan menerima konfirmasi pembayaran dari member.
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenContactForm()} className="w-full md:w-auto">
              <PlusCircle className="mr-2" />
              Tambah Kontak
            </Button>
          </CardHeader>
          <CardContent>
            {confirmationContacts.length > 0 ? (
                <div className="space-y-3">
                {confirmationContacts.map((contact) => (
                    <Card key={contact.id}>
                        <CardContent className="p-3">
                            <div className="flex justify-between items-center gap-4">
                                <div className="flex items-center gap-3">
                                   <MessageSquare className="h-5 w-5 text-green-600" />
                                    <div>
                                        <p className="font-semibold">{contact.name}</p>
                                        <p className="text-sm text-muted-foreground font-mono">{contact.whatsapp}</p>
                                    </div>
                                </div>
                                <div className="flex shrink-0 space-x-2">
                                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleOpenContactForm(contact)}>
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
                                        <AlertDialogTitle>Hapus Kontak Ini?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Tindakan ini tidak dapat dibatalkan. Kontak ini akan dihapus secara permanen.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteContact(contact.id)}>Hapus</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                </div>
            ) : (
                <div className="h-24 text-center flex items-center justify-center text-muted-foreground">
                    Belum ada kontak konfirmasi.
                </div>
            )}
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
                  <div className="flex justify-between items-center">
                    <Label htmlFor="metaDescription">Deskripsi Meta Global</Label>
                    <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0 text-sm"
                        onClick={handleGenerateMetaDescription}
                        disabled={isGeneratingDesc || !platformName || !seoSettings.titleSuffix}
                    >
                        {isGeneratingDesc ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        Buat dengan AI
                    </Button>
                  </div>
                  <Textarea
                    id="metaDescription"
                    name="metaDescription"
                    value={seoSettings.metaDescription}
                    onChange={(e) => setSeoSettings(prev => ({...prev!, metaDescription: e.target.value}))}
                    rows={3}
                    disabled={isGeneratingDesc}
                  />
                  <p className="text-xs text-muted-foreground">Deskripsi default untuk halaman yang tidak memiliki deskripsi khusus (150-160 karakter).</p>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="metaKeywords">Kata Kunci Meta Global</Label>
                         <Button
                            type="button"
                            variant="link"
                            className="h-auto p-0 text-sm"
                            onClick={handleGenerateMetaKeywords}
                            disabled={isGeneratingKeywords || !platformName || !seoSettings.metaDescription}
                        >
                            {isGeneratingKeywords ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                            Buat dengan AI
                        </Button>
                    </div>
                  <Input
                    id="metaKeywords"
                    name="metaKeywords"
                    value={seoSettings.metaKeywords}
                    onChange={(e) => setSeoSettings(prev => ({...prev!, metaKeywords: e.target.value}))}
                    placeholder="kursus online, belajar, skill"
                    disabled={isGeneratingKeywords}
                  />
                  <p className="text-xs text-muted-foreground">Pisahkan kata kunci dengan koma.</p>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button onClick={handleSaveSeo} disabled={isSavingSeo || isGeneratingSuffix || isGeneratingDesc || isGeneratingKeywords}>
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
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="ai-suggestions" className="font-semibold">Rekomendasi Kursus AI</Label>
                <p className="text-sm text-muted-foreground">
                  Tampilkan fitur rekomendasi kursus berbasis AI di halaman katalog.
                </p>
              </div>
              <Switch
                id="ai-suggestions"
                checked={enableAiSuggestions}
                onCheckedChange={setEnableAiSuggestions}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Bahasa Default</Label>
              <Select defaultValue="id" disabled>
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
          <CardFooter className="border-t px-6 py-4">
            <Button onClick={handleSaveGeneral} disabled={isSavingGeneral}>
              {isSavingGeneral && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Pengaturan Umum
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Dialog open={isPaymentFormOpen} onOpenChange={setPaymentFormOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{selectedPaymentAccount ? 'Ubah Akun Pembayaran' : 'Tambah Akun Pembayaran Baru'}</DialogTitle>
            </DialogHeader>
            <PaymentAccountForm account={selectedPaymentAccount} onFinished={handlePaymentFormFinished} />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isContactFormOpen} onOpenChange={setContactFormOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{selectedContact ? 'Ubah Kontak Konfirmasi' : 'Tambah Kontak Konfirmasi Baru'}</DialogTitle>
            </DialogHeader>
            <ConfirmationContactForm contact={selectedContact} onFinished={handleContactFormFinished} />
        </DialogContent>
      </Dialog>
    </>
  );
}
