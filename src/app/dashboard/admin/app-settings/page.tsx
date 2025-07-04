'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { getLandingPageSettings, updateLandingPageSettings } from '@/lib/data';
import type { AiApp } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Pencil } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function AppSettingsPage() {
    const [apps, setApps] = useState<AiApp[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    // State for edit dialog
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState<AiApp | null>(null);
    const [editedTitle, setEditedTitle] = useState('');
    const [editedDescription, setEditedDescription] = useState('');


    useEffect(() => {
        const settings = getLandingPageSettings();
        setApps(settings.aiApps || []);
        setLoading(false);
    }, []);

    const handleToggle = (appId: string, enabled: boolean) => {
        setApps(prevApps => 
            prevApps.map(app => 
                app.id === appId ? { ...app, enabled } : app
            )
        );
    };

    const handleSave = () => {
        setIsSaving(true);
        try {
            const currentSettings = getLandingPageSettings();
            updateLandingPageSettings({ ...currentSettings, aiApps: apps });
            toast({
                title: 'Sukses',
                description: 'Pengaturan aplikasi berhasil disimpan.',
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
            toast({
                title: 'Gagal Menyimpan',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleOpenEditDialog = (app: AiApp) => {
        setSelectedApp(app);
        setEditedTitle(app.title);
        setEditedDescription(app.description);
        setIsEditDialogOpen(true);
    };

    const handleSaveEdit = () => {
        if (!selectedApp || !editedTitle) {
            toast({ title: "Gagal", description: "Judul tidak boleh kosong.", variant: "destructive" });
            return;
        }
        setApps(prevApps => 
            prevApps.map(app => 
                app.id === selectedApp.id ? { ...app, title: editedTitle, description: editedDescription } : app
            )
        );
        setIsEditDialogOpen(false);
        setSelectedApp(null);
        toast({ title: "Siap Disimpan", description: "Perubahan akan disimpan saat Anda menekan tombol 'Simpan Perubahan'." });
    };


    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <Skeleton className="h-9 w-64 mb-2" />
                    <Skeleton className="h-5 w-80" />
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-56 mb-2" />
                        <Skeleton className="h-4 w-72" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full" />
                        ))}
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-10 w-36" />
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold">Pengaturan Aplikasi AI</h1>
                  <p className="text-muted-foreground">Aktifkan, nonaktifkan, atau ubah nama dan deskripsi aplikasi AI yang tersedia untuk member Pro.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Manajemen Aplikasi</CardTitle>
                        <CardDescription>Gunakan tombol di bawah untuk mengontrol visibilitas dan detail setiap aplikasi.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {apps.map(app => (
                            <div key={app.id} className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <p className="font-semibold">{app.title}</p>
                                    <p className="text-sm text-muted-foreground">{app.description}</p>
                                </div>
                                <div className="flex items-center gap-2 md:gap-4">
                                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleOpenEditDialog(app)}>
                                        <Pencil className="h-4 w-4" />
                                        <span className="sr-only">Ubah Aplikasi</span>
                                    </Button>
                                    <Switch
                                        checked={app.enabled}
                                        onCheckedChange={(checked) => handleToggle(app.id, checked)}
                                        aria-label={`Toggle ${app.title}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Simpan Perubahan
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ubah Aplikasi: {selectedApp?.title}</DialogTitle>
                        <DialogDescription>
                            Ubah nama dan deskripsi untuk aplikasi AI ini. Perubahan akan diterapkan setelah Anda menyimpan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="editedTitle">Nama Aplikasi</Label>
                            <Input id="editedTitle" value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editedDescription">Deskripsi Aplikasi</Label>
                            <Textarea id="editedDescription" value={editedDescription} onChange={(e) => setEditedDescription(e.target.value)} rows={4} />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="ghost">Batal</Button></DialogClose>
                        <Button onClick={handleSaveEdit}>Terapkan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
