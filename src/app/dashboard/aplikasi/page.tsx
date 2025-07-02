'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Lock, FileText, Bot, ArrowLeft, Plug, Megaphone, Mail, Briefcase, BarChart, Image as ImageIcon } from 'lucide-react';
import { AiBloggerTemplateGenerator } from '@/components/ai-blogger-template-generator';
import { AiSkripsiGenerator } from '@/components/ai-skripsi-generator';
import { AiWordpressPluginGenerator } from '@/components/ai-wordpress-plugin-generator';
import { AiGoogleAdsGenerator } from '@/components/ai-google-ads-generator';
import { AiDigitalInvitationGenerator } from '@/components/ai-digital-invitation-generator';
import { AiUmkmProfileGenerator } from '@/components/ai-umkm-profile-generator';
import { AiSpssAssistant } from '@/components/ai-spss-assistant';
import { AiImageGenerator } from '@/components/ai-image-generator';


function ProFeatures() {
  const [activeApp, setActiveApp] = useState<'blogger' | 'skripsi' | 'wordpress' | 'google-ads' | 'digital-invitation' | 'umkm' | 'spss' | 'image' | null>(null);

  const handleAppSelect = (app: 'blogger' | 'skripsi' | 'wordpress' | 'google-ads' | 'digital-invitation' | 'umkm' | 'spss' | 'image') => {
    setActiveApp(app);
  };

  const apps = [
    {
      id: 'blogger',
      title: 'AI Template Blogger',
      description: 'Buat template Blogger yang responsif dan dapat disesuaikan secara instan.',
      icon: <Bot className="h-10 w-10 text-primary" />,
    },
    {
      id: 'skripsi',
      title: 'AI Asisten Skripsi',
      description: 'Hasilkan draf untuk bab skripsi Anda dengan bantuan AI.',
      icon: <FileText className="h-10 w-10 text-primary" />,
    },
    {
      id: 'wordpress',
      title: 'Plugin Wordpress',
      description: 'Buat file boilerplate (readme.txt & php) untuk plugin WordPress.',
      icon: <Plug className="h-10 w-10 text-primary" />,
    },
    {
      id: 'google-ads',
      title: 'AI Google Ads Copy',
      description: 'Buat teks iklan (headlines & descriptions) untuk kampanye Google Ads.',
      icon: <Megaphone className="h-10 w-10 text-primary" />,
    },
    {
      id: 'digital-invitation',
      title: 'AI Undangan Digital',
      description: 'Buat teks dan konsep desain untuk undangan digital Anda.',
      icon: <Mail className="h-10 w-10 text-primary" />,
    },
    {
      id: 'umkm',
      title: 'AI Asisten UMKM',
      description: 'Buat nama, slogan, dan deskripsi singkat untuk bisnis Anda.',
      icon: <Briefcase className="h-10 w-10 text-primary" />,
    },
    {
      id: 'spss',
      title: 'AI Asisten SPSS',
      description: 'Buat sintaks SPSS dan dapatkan penjelasan untuk analisis statistik Anda.',
      icon: <BarChart className="h-10 w-10 text-primary" />,
    },
    {
      id: 'image',
      title: 'AI Image Generator',
      description: 'Buat gambar dari teks menggunakan Gemini Flash.',
      icon: <ImageIcon className="h-10 w-10 text-primary" />,
    }
  ];

  const selectedApp = apps.find(a => a.id === activeApp);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pusat Aplikasi AI</h1>
        <p className="text-muted-foreground">
          {activeApp && selectedApp ? `Menjalankan: ${selectedApp.title}` : 'Pilih salah satu aplikasi AI untuk memulai.'}
        </p>
      </div>

      {activeApp === null ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {apps.map((app) => (
            <Card
              key={app.id}
              onClick={() => handleAppSelect(app.id as 'blogger' | 'skripsi' | 'wordpress' | 'google-ads' | 'digital-invitation' | 'umkm' | 'spss' | 'image')}
              className="cursor-pointer hover:border-primary hover:shadow-xl transition-all group"
            >
              <CardContent className="flex flex-col items-center text-center gap-4 p-6">
                <div className="rounded-full bg-primary/10 p-4 group-hover:bg-primary/20 transition-colors">
                    {app.icon}
                </div>
                <div className="space-y-1">
                  <CardTitle>{app.title}</CardTitle>
                  <CardDescription>{app.description}</CardDescription>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div>
          <Button variant="outline" onClick={() => setActiveApp(null)} className="mb-6">
            <ArrowLeft className="mr-2" />
            Kembali ke Pilihan Aplikasi
          </Button>

          {activeApp === 'blogger' && <AiBloggerTemplateGenerator />}
          {activeApp === 'skripsi' && <AiSkripsiGenerator />}
          {activeApp === 'wordpress' && <AiWordpressPluginGenerator />}
          {activeApp === 'google-ads' && <AiGoogleAdsGenerator />}
          {activeApp === 'digital-invitation' && <AiDigitalInvitationGenerator />}
          {activeApp === 'umkm' && <AiUmkmProfileGenerator />}
          {activeApp === 'spss' && <AiSpssAssistant />}
          {activeApp === 'image' && <AiImageGenerator />}
        </div>
      )}
    </div>
  );
}

function UpgradePrompt() {
  return (
    <Card className="text-center">
      <CardHeader>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <CardTitle>Buka Fitur Aplikasi Pro</CardTitle>
        <CardDescription>
          Upgrade ke akun Pro untuk mendapatkan akses eksklusif ke alat bantu canggih,
          <br />
          termasuk AI Template Blogger dan AI Asisten Skripsi.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button size="lg">
            <Sparkles className="mr-2" />
            Upgrade ke Pro Sekarang
        </Button>
         <p className="mt-2 text-xs text-muted-foreground">(Tombol ini adalah placeholder)</p>
      </CardContent>
    </Card>
  );
}

export default function AplikasiPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Card className="text-center">
          <CardHeader>
            <Skeleton className="mx-auto h-16 w-16 rounded-full" />
            <Skeleton className="h-7 w-56 mx-auto mt-4" />
            <Skeleton className="h-5 w-full max-w-md mx-auto mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-48 mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const isProAccess = user?.role === 'admin' || user?.role === 'pro';

  return (
    <div>
      {isProAccess ? <ProFeatures /> : <UpgradePrompt />}
    </div>
  );
}
