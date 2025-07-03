
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getLandingPageSettings, updateLandingPageSettings } from '@/lib/data';
import type { LandingPageSettings } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function LandingPageSettingsPage() {
    const [settings, setSettings] = useState<LandingPageSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const data = getLandingPageSettings();
        setSettings(data);
        setLoading(false);
    }, []);

    const handleFeatureChange = (index: number, field: 'title' | 'description', value: string) => {
        if (!settings) return;
        const newFeatures = [...settings.features];
        newFeatures[index] = { ...newFeatures[index], [field]: value };
        setSettings({ ...settings, features: newFeatures });
    };

    const handleSave = () => {
        if (!settings) return;
        setIsSaving(true);
        try {
            updateLandingPageSettings(settings);
            toast({ title: 'Sukses', description: 'Pengaturan halaman depan berhasil disimpan.' });
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

            <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simpan Perubahan
                </Button>
            </div>
        </div>
    )
}
