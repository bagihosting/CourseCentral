'use client';

import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Lock, FileText, Bot } from 'lucide-react';
import { AiBloggerTemplateGenerator } from '@/components/ai-blogger-template-generator';
import { AiSkripsiGenerator } from '@/components/ai-skripsi-generator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


function ProFeatures() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pusat Aplikasi AI</h1>
        <p className="text-muted-foreground">
          Anda memiliki akses penuh ke semua alat bantu AI eksklusif kami.
        </p>
      </div>

      <Tabs defaultValue="blogger" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="blogger">
            <Bot className="mr-2" />
            AI Template Blogger
          </TabsTrigger>
          <TabsTrigger value="skripsi">
            <FileText className="mr-2" />
            AI Asisten Skripsi
          </TabsTrigger>
        </TabsList>
        <TabsContent value="blogger" className="mt-6">
          <AiBloggerTemplateGenerator />
        </TabsContent>
        <TabsContent value="skripsi" className="mt-6">
          <AiSkripsiGenerator />
        </TabsContent>
      </Tabs>
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
