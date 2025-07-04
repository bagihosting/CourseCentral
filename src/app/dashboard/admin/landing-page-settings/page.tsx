
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
import { Loader2, Trash2, Star, Image as ImageIcon, Wand2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Image from 'next/image';
import { generateHeroImageAction } from '@/actions/ai';
import imageCompression from 'browser-image-compression';


export default function LandingPageSettingsPage() {
    const [settings, setSettings] = useState<LandingPageSettings | null>(null);
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [featuredIds, setFeaturedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isGeneratingHero, setIsGeneratingHero] = useState(false);
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

    const handleGenerateHeroImage = async () => {
        if (!settings?.heroHeadline) {
            toast({ title: 'Gagal', description: 'Judul utama (headline) harus diisi untuk membuat gambar.', variant: 'destructive'});
            return;
        }
        setIsGeneratingHero(true);
        const result = await generateHeroImageAction({ headline: settings.heroHeadline });
        
        if ('error' in result) {
            toast({ title: 'Gagal Membuat Gambar', description: result.error, variant: 'destructive' });
            setIsGeneratingHero(false);
            return;
        }

        try {
            const dataURItoFile = (dataURI: string, filename: string): File => {
                const arr = dataURI.split(',');
                if (arr.length < 2) throw new Error('Invalid data URI');
                const mimeMatch = arr[0].match(/:(.*?);/);
                if (!mimeMatch || mimeMatch.length < 2) throw new Error('Invalid MIME type');
                const mime = mimeMatch[1];
                const bstr = atob(arr[1]);
                let n = bstr.length;
                const u8arr = new Uint8Array(n);
                while (n--) {
                    u8arr[n] = bstr.charCodeAt(n);
                }
                return new File([u8arr], filename, { type: mime });
            };

            const imageFile = dataURItoFile(result.imageUrl, 'hero.png');
            
            const options = {
                maxSizeMB: 0.3,
                maxWidthOrHeight: 1280,
                useWebWorker: true,
                fileType: 'image/jpeg',
            };
            const compressedFile = await imageCompression(imageFile, options);

            const reader = new FileReader();
            reader.onloadend = () => {
                const compressedDataUrl = reader.result as string;
                setSettings(prev => prev ? {...prev, heroImageUrl: compressedDataUrl} : null);
                setIsGeneratingHero(false);
                toast({ title: 'Sukses', description: 'Gambar hero berhasil dibuat dan dikompres.' });
            };
            reader.readAsDataURL(compressedFile);

        } catch (compressionError) {
            console.error("Compression Error:", compressionError);
            setSettings(prev => prev ? {...prev, heroImageUrl: result.imageUrl} : null);
            setIsGeneratingHero(false);
            toast({ title: 'Sukses', description: 'Gambar hero berhasil dibuat, namun gagal dikompres.', variant: 'default' });
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
                    <CardTitle>Gambar Hero</CardTitle>
                    <CardDescription>Atur gambar utama yang tampil di bagian hero halaman depan.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Pratinjau Gambar</Label>
                        <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted w-full max-w-sm">
                            <Image src={settings.heroImageUrl} alt="Pratinjau Hero" fill className="object-cover" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="heroImageUrl">URL Gambar Hero</Label>
                        <Input 
                            id="heroImageUrl" 
                            value={settings.heroImageUrl || ''}
                            onChange={(e) => setSettings({...settings, heroImageUrl: e.target.value})}
                            placeholder="https://example.com/hero.png"
                            disabled={isGeneratingHero}
                        />
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">Atau</span>
                        </div>
                    </div>
                    <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={handleGenerateHeroImage}
                        disabled={isGeneratingHero || !settings.heroHeadline}
                    >
                        {isGeneratingHero ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Wand2 className="mr-2 h-4 w-4" />
                        )}
                        Buat Gambar Hero dengan AI
                    </Button>
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
                <Button onClick={handleSave} disabled={isSaving || isGeneratingHero}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simpan Semua Perubahan
                </Button>
            </div>
        </div>
    )
}
