

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { getLandingPageSettings, updateLandingPageSettings, getAllTestimonials, deleteTestimonial } from '@/actions/settings';
import type { LandingPageSettings, Testimonial, FAQItem } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, Star, Image as ImageIcon, Wand2, PlusCircle, Download } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Image from 'next/image';
import { generateHeroImageAction } from '@/actions/ai';
import imageCompression from 'browser-image-compression';


export default function LandingPageSettingsPage() {
    const [settings, setSettings] = useState<LandingPageSettings | null>(null);
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [featuredIds, setFeaturedIds] = useState<string[]>([]);
    const [faqs, setFaqs] = useState<FAQItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isGeneratingHero, setIsGeneratingHero] = useState(false);
    const [generatedHeroPreview, setGeneratedHeroPreview] = useState<string | null>(null);
    const { toast } = useToast();

    const refreshData = useCallback(async () => {
        const settingsData = await getLandingPageSettings();
        setSettings(settingsData);
        setFeaturedIds(settingsData.featuredTestimonialIds || []);
        setTestimonials(await getAllTestimonials());
        setFaqs(settingsData.faqs || []);
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

    const handleDeleteTestimonial = async (testimonialId: string) => {
        try {
            await deleteTestimonial(testimonialId);
            toast({ title: 'Sukses', description: 'Testimoni telah dihapus.' });
            await refreshData();
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
        setGeneratedHeroPreview(null);
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
                setGeneratedHeroPreview(compressedDataUrl);
                setIsGeneratingHero(false);
                toast({ title: 'Sukses!', description: 'Gambar hero berhasil dibuat. Silakan unduh gambar dan unggah ke hosting Anda.' });
            };
            reader.readAsDataURL(compressedFile);

        } catch (compressionError) {
            console.error("Compression Error:", compressionError);
            setGeneratedHeroPreview(result.imageUrl);
            setIsGeneratingHero(false);
            toast({ title: 'Sukses', description: 'Gambar berhasil dibuat, namun gagal dikompres. Unduh dan unggah ke hosting.', variant: 'default' });
        }
    };
    
    const handleFaqChange = (id: string, field: 'question' | 'answer', value: string) => {
        setFaqs(faqs.map(faq => faq.id === id ? { ...faq, [field]: value } : faq));
    };

    const handleAddFaq = () => {
        setFaqs([...faqs, { id: `faq_${Date.now()}`, question: '', answer: '' }]);
    };

    const handleDeleteFaq = (id: string) => {
        setFaqs(faqs.filter(faq => faq.id !== id));
    };


    const handleSave = async () => {
        if (!settings) return;
        setIsSaving(true);
        try {
            await updateLandingPageSettings({ ...settings, featuredTestimonialIds: featuredIds, faqs });
            toast({ title: 'Sukses', description: 'Pengaturan halaman depan berhasil disimpan.' });
            await refreshData();
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
                    <CardTitle>Pengaturan Umum & Kontak</CardTitle>
                    <CardDescription>Atur logo, footer, dan informasi yang ditampilkan di halaman Kontak.</CardDescription>
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
                    <div className="pt-4 border-t">
                        <div className="space-y-2">
                            <Label htmlFor="contactEmail">Email Kontak</Label>
                            <Input 
                                id="contactEmail" 
                                value={settings.contactEmail || ''}
                                onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                                placeholder="support@example.com"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contactPhone">Telepon Kontak</Label>
                        <Input 
                            id="contactPhone" 
                            value={settings.contactPhone || ''}
                            onChange={(e) => setSettings({...settings, contactPhone: e.target.value})}
                            placeholder="(021) 123-4567"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contactAddress">Alamat Kontak</Label>
                        <Textarea 
                            id="contactAddress" 
                            value={settings.contactAddress || ''}
                            onChange={(e) => setSettings({...settings, contactAddress: e.target.value})}
                            rows={3}
                            placeholder="Jl. Sudirman No. 1, Jakarta"
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
                    <CardDescription>Atur gambar utama di halaman depan. Cara terbaik adalah mengunggah gambar ke hosting dan menempelkan URL di bawah.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="heroImageUrl">URL Gambar Hero</Label>
                        <Input 
                            id="heroImageUrl" 
                            value={settings.heroImageUrl || ''}
                            onChange={(e) => setSettings({...settings, heroImageUrl: e.target.value})}
                            placeholder="https://example.com/hero.png"
                        />
                         <p className="text-xs text-muted-foreground">URL ini akan disimpan dan digunakan untuk menampilkan gambar hero.</p>
                    </div>
                     <div className="space-y-2">
                        <Label>Pratinjau Gambar Saat Ini</Label>
                        <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted w-full max-w-sm">
                            {settings.heroImageUrl ? (
                                <Image src={settings.heroImageUrl} alt="Pratinjau Hero" fill className="object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    <ImageIcon className="h-10 w-10"/>
                                </div>
                            )}
                        </div>
                    </div>
                     <div className="relative">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Atau</span></div>
                    </div>
                    <Card className="bg-muted/30">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Buat Gambar dengan AI</CardTitle>
                            <CardDescription>Gunakan AI untuk membuat gambar baru. Setelah dibuat, unduh gambar, unggah ke hosting, lalu tempel URL-nya di kolom di atas.</CardDescription>
                        </CardHeader>
                         <CardContent>
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

                    {generatedHeroPreview && (
                        <div className="space-y-4 pt-4 border-t">
                            <h4 className="font-semibold text-center">Hasil Gambar AI (Sementara)</h4>
                            <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted w-full max-w-sm mx-auto">
                                <Image src={generatedHeroPreview} alt="Pratinjau Hero AI" fill className="object-contain" />
                            </div>
                            <Button 
                                className="w-full"
                                onClick={() => {
                                    const a = document.createElement('a');
                                    a.href = generatedHeroPreview;
                                    a.download = 'hero-image-scriptify.jpg';
                                    a.click();
                                }}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Unduh Gambar Ini
                            </Button>
                        </div>
                    )}
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

            <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle>Manajemen FAQ</CardTitle>
                        <CardDescription>Atur pertanyaan yang sering muncul di halaman depan.</CardDescription>
                    </div>
                    <Button onClick={handleAddFaq} size="sm">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tambah FAQ
                    </Button>
                </CardHeader>
                <CardContent>
                    {faqs.length > 0 ? (
                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <Card key={faq.id} className="p-4 bg-muted/30">
                                    <div className="space-y-2">
                                        <Label htmlFor={`faq-q-${index}`}>Pertanyaan</Label>
                                        <Input
                                            id={`faq-q-${index}`}
                                            value={faq.question}
                                            onChange={(e) => handleFaqChange(faq.id, 'question', e.target.value)}
                                            placeholder="Tulis pertanyaan..."
                                        />
                                    </div>
                                    <div className="space-y-2 mt-4">
                                        <Label htmlFor={`faq-a-${index}`}>Jawaban</Label>
                                        <Textarea
                                            id={`faq-a-${index}`}
                                            value={faq.answer}
                                            onChange={(e) => handleFaqChange(faq.id, 'answer', e.target.value)}
                                            placeholder="Tulis jawaban..."
                                            rows={3}
                                        />
                                    </div>
                                    <div className="flex justify-end mt-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => handleDeleteFaq(faq.id)}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Hapus
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-4">Belum ada FAQ yang ditambahkan.</p>
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
