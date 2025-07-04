'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { getLandingPageSettings, updateLandingPageSettings } from '@/lib/data';
import type { AiApp } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AppSettingsPage() {
    const [apps, setApps] = useState<AiApp[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

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
        <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Pengaturan Aplikasi AI</h1>
              <p className="text-muted-foreground">Aktifkan atau nonaktifkan fitur aplikasi AI yang tersedia untuk member Pro.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Manajemen Aplikasi</CardTitle>
                    <CardDescription>Gunakan tombol di bawah untuk mengontrol visibilitas setiap aplikasi.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {apps.map(app => (
                        <div key={app.id} className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <p className="font-semibold">{app.title}</p>
                                <p className="text-sm text-muted-foreground">{app.description}</p>
                            </div>
                            <Switch
                                checked={app.enabled}
                                onCheckedChange={(checked) => handleToggle(app.id, checked)}
                                aria-label={`Toggle ${app.title}`}
                            />
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
    );
}
