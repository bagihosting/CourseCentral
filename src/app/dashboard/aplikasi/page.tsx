
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Lock, FileText, Bot, ArrowLeft, Plug, Megaphone, Mail, Briefcase, BarChart, ImageIcon as ImageIconLucide, LayoutTemplate, FlaskConical, Server, BookCopy } from 'lucide-react';
import { AiBloggerTemplateGenerator } from '@/components/ai-blogger-template-generator';
import { AiSkripsiGenerator } from '@/components/ai-skripsi-generator';
import { AiWordpressPluginGenerator } from '@/components/ai-wordpress-plugin-generator';
import { AiGoogleAdsGenerator } from '@/components/ai-google-ads-generator';
import { AiDigitalInvitationGenerator } from '@/components/ai-digital-invitation-generator';
import { AiUmkmProfileGenerator } from '@/components/ai-umkm-profile-generator';
import { AiSpssAssistant } from '@/components/ai-spss-assistant';
import { AiImageGenerator } from '@/components/ai-image-generator';
import { AiAppPrototypeGenerator } from '@/components/ai-app-prototype-generator';
import { AiSoapFormulaGenerator } from '@/components/ai-soap-formula-generator';
import { AiWebAppGenerator } from '@/components/ai-web-app-generator';
import { AiMakalahGenerator } from '@/components/ai-makalah-generator';
import { AiPromoThumbnailGenerator } from '@/components/ai-promo-thumbnail-generator';
import Link from 'next/link';
import { getLandingPageSettings } from '@/lib/data';
import type { AiApp } from '@/types';

type AppComponent = React.FC;
type AppId = AiApp['id'];

const appComponentMap: Record<AppId, AppComponent> = {
  'blogger': AiBloggerTemplateGenerator,
  'skripsi': AiSkripsiGenerator,
  'wordpress': AiWordpressPluginGenerator,
  'google-ads': AiGoogleAdsGenerator,
  'digital-invitation': AiDigitalInvitationGenerator,
  'umkm': AiUmkmProfileGenerator,
  'spss': AiSpssAssistant,
  'image': AiImageGenerator,
  'prototype': AiAppPrototypeGenerator,
  'soap-formula': AiSoapFormulaGenerator,
  'web-app': AiWebAppGenerator,
  'makalah': AiMakalahGenerator,
  'promo-thumbnail': AiPromoThumbnailGenerator,
};

const appIconMap: Record<string, React.ReactNode> = {
  Bot: <Bot className="h-10 w-10 text-primary" />,
  FileText: <FileText className="h-10 w-10 text-primary" />,
  Plug: <Plug className="h-10 w-10 text-primary" />,
  Megaphone: <Megaphone className="h-10 w-10 text-primary" />,
  Mail: <Mail className="h-10 w-10 text-primary" />,
  Briefcase: <Briefcase className="h-10 w-10 text-primary" />,
  BarChart: <BarChart className="h-10 w-10 text-primary" />,
  ImageIcon: <ImageIconLucide className="h-10 w-10 text-primary" />,
  LayoutTemplate: <LayoutTemplate className="h-10 w-10 text-primary" />,
  FlaskConical: <FlaskConical className="h-10 w-10 text-primary" />,
  Server: <Server className="h-10 w-10 text-primary" />,
  BookCopy: <BookCopy className="h-10 w-10 text-primary" />,
};

function ProFeatures() {
  const [activeApp, setActiveApp] = useState<AppId | null>(null);
  const [availableApps, setAvailableApps] = useState<AiApp[]>([]);

  useEffect(() => {
    const settings = getLandingPageSettings();
    setAvailableApps(settings.aiApps?.filter(app => app.enabled) || []);
  }, []);

  const handleAppSelect = (appId: AppId) => {
    setActiveApp(appId);
  };

  const selectedApp = availableApps.find(a => a.id === activeApp);
  const ActiveComponent = activeApp ? appComponentMap[activeApp] : null;

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
          {availableApps.map((app) => (
            <Card
              key={app.id}
              onClick={() => handleAppSelect(app.id as AppId)}
              className="cursor-pointer hover:border-primary hover:shadow-xl transition-all group"
            >
              <CardContent className="flex flex-col items-center text-center gap-4 p-6">
                <div className="rounded-full bg-primary/10 p-4 group-hover:bg-primary/20 transition-colors">
                    {appIconMap[app.icon] || <Sparkles className="h-10 w-10 text-primary" />}
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

          {ActiveComponent && <ActiveComponent />}
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
        <Button size="lg" asChild>
            <Link href="/dashboard/upgrade">
                <Sparkles className="mr-2" />
                Upgrade ke Pro Sekarang
            </Link>
        </Button>
         <p className="mt-2 text-xs text-muted-foreground">(Anda akan diarahkan untuk konfirmasi manual)</p>
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
