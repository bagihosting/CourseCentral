
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { getLandingPageSettings, updateLandingPageSettings, getAllTestimonials, deleteTestimonial } from '@/lib/data';
import type { LandingPageSettings, Testimonial } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function LandingPageSettingsPage() {
    const [settings, setSettings] = useState<LandingPageSettings | null>(null);
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [featuredIds, setFeaturedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const refreshData = useCallback(() => {
        const settingsData = getLandingPageSettings();
        setSettings(settingsData);
        setFeaturedIds(settingsData.featuredTestimonialIds || []);
        setTestimonials(getAllTestimonials());
        setLoading(false);
    }, []);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const handleFeatureChange = (index: number, field: 'title' | 'description', value: string) => {
        if (!settings) return;
        const newFeatures = [...settings.features];
        newFeatures[index] = { ...newFeatures[index], [field]: value };
        setSettings({ ...settings, features: newFeatures });
    };

    const handleFeatureToggle = (testimonialId: string, checked: boolean) => {
        setFeaturedIds(prev =>
            checked ? [...prev, testimonialId] : prev.filter(id => id !== testimonialId)
        );
    };

    const handleDeleteTestimonial = (testimonialId: string) => {
        try {
            deleteTestimonial(testimonialId);
            toast({ title: 'Sukses', description: 'Testimoni telah dihapus.' });
            refreshData(); // Refresh all data
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
            toast({ title: 'Gagal Menghapus', description: errorMessage, variant: 'destructive' });
        }
    };

    const handleSave = () => {
        if (!settings) return;
        setIsSaving(true);
        try {
            updateLandingPageSettings({ ...settings, featuredTestimonialIds: featuredIds });
            toast({ title: 'Sukses', description: 'Pengaturan halaman depan berhasil disimpan.' });
            refreshData();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
            toast({ title: 'Gagal Menyimpan', description: errorMessage, variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };
    
    if (loading || !settings) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-9 w-64 mb-2" />
                <Skeleton className="h-5 w-80" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-56 mb-2" />
                        <Skeleton className="h-4 w-72" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                           <Skeleton className="h-4 w-24" />
                           <Skeleton className="h-20 w-full" />
                        </div>
                         <div className="space-y-2">
                           <Skeleton className="h-4 w-24" />
                           <Skeleton className="h-20 w-full" />
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-56 mb-2" />
                        <Skeleton className="h-4 w-72" />
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="space-y-3 p-4 border rounded-lg">
                                <Skeleton className="h-5 w-20" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-20 w-full" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Pengaturan Halaman Depan</h1>
              <p className="text-muted-foreground">Kelola konten yang ditampilkan di landing page Anda.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Pengaturan Umum</CardTitle>
                    <CardDescription>Atur logo dan teks footer.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="logoUrl">URL Logo</Label>
                        <Input 
                            id="logoUrl" 
                            value={settings.logoUrl || ''}
                            onChange={(e) => setSettings({...settings, logoUrl: e.target.value})}
                            placeholder="https://example.com/logo.png"
                        />
                        <p className="text-xs text-muted-foreground">Biarkan kosong untuk menampilkan nama platform sebagai teks.</p>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="footerText">Teks Footer</Label>
                        <Input 
                            id="footerText" 
                            value={settings.footerText}
                            onChange={(e) => setSettings({...settings, footerText: e.target.value})}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Bagian Hero</CardTitle>
                    <CardDescription>Teks utama yang dilihat pengunjung pertama kali.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="heroHeadline">Judul Utama (Headline)</Label>
                        <Textarea 
                            id="heroHeadline" 
                            value={settings.heroHeadline}
                            onChange={(e) => setSettings({...settings, heroHeadline: e.target.value})}
                            rows={3}
                        />
                        <p className="text-xs text-muted-foreground">Anda dapat menggunakan tag `&lt;span class="text-primary"&gt;` untuk menyorot teks.</p>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="heroSubheadline">Sub-Judul (Subheadline)</Label>
                        <Textarea 
                            id="heroSubheadline"
                            value={settings.heroSubheadline}
                            onChange={(e) => setSettings({...settings, heroSubheadline: e.target.value})}
                            rows={4}
                        />
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Bagian Fitur</CardTitle>
                    <CardDescription>Sorot tiga fitur atau keunggulan utama dari platform Anda.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-6">
                    {settings.features.map((feature, index) => (
                        <div key={index} className="space-y-3 p-4 border rounded-lg bg-muted/30">
                             <h4 className="font-semibold">Fitur {index + 1}</h4>
                             <div className="space-y-2">
                                <Label htmlFor={`feature-title-${index}`}>Judul Fitur</Label>
                                <Input 
                                    id={`feature-title-${index}`}
                                    value={feature.title}
                                    onChange={(e) => handleFeatureChange(index, 'title', e.target.value)}
                                />
                             </div>
                             <div className="space-y-2">
                                <Label htmlFor={`feature-desc-${index}`}>Deskripsi Fitur</Label>
                                <Textarea 
                                    id={`feature-desc-${index}`}
                                    value={feature.description}
                                    onChange={(e) => handleFeatureChange(index, 'description', e.target.value)}
                                    rows={4}
                                />
                             </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Manajemen Testimoni</CardTitle>
                    <CardDescription>Pilih testimoni dari member yang ingin Anda tampilkan di halaman depan.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {testimonials.length > 0 ? testimonials.map(testimonial => (
                        <div key={testimonial.id} className="flex items-start gap-4 p-4 border rounded-md">
                            <Checkbox 
                                id={`feature-${testimonial.id}`}
                                checked={featuredIds.includes(testimonial.id)}
                                onCheckedChange={(checked) => handleFeatureToggle(testimonial.id, !!checked)}
                                className="mt-1"
                            />
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <label htmlFor={`feature-${testimonial.id}`} className="font-semibold">{testimonial.userName}</label>
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>Anda yakin?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Tindakan ini akan menghapus testimoni secara permanen.
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteTestimonial(testimonial.id)}>Hapus</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                                <p className="text-sm text-muted-foreground italic">"{testimonial.quote}"</p>
                            </div>
                        </div>
                    )) : (
                        <p className="text-center text-muted-foreground py-4">Belum ada testimoni yang dikirim oleh member.</p>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simpan Semua Perubahan
                </Button>
            </div>
        </div>
    )
}
