'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, LayoutTemplate, Lightbulb, Tag, CheckSquare, Users, DollarSign } from 'lucide-react';
import { generateAppPrototypeAction } from '@/actions/ai';
import type { GenerateAppPrototypeOutput } from '@/ai/flows/generate-app-prototype';
import { Badge } from '@/components/ui/badge';
import { useLocalStorage } from '@/hooks/use-local-storage';

export function AiAppPrototypeGenerator() {
  const [appIdea, setAppIdea] = useLocalStorage('ai_prototype_appIdea', '');
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState<GenerateAppPrototypeOutput | null>(null);

  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!appIdea) {
      toast({
        title: 'Input Diperlukan',
        description: 'Harap masukkan ide aplikasi Anda.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setOutput(null);

    const result = await generateAppPrototypeAction({ appIdea });
    setIsLoading(false);

    if ('error' in result) {
      toast({
        title: 'Gagal Membuat Prototipe',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      setOutput(result);
      toast({
        title: 'Sukses!',
        description: 'Rencana prototipe aplikasi Anda telah berhasil dibuat.',
      });
    }
  };

  const renderList = (title: string, items: string[], icon: React.ReactNode) => (
    <Card>
        <CardHeader className="flex-row items-center gap-2 space-y-0">
            {icon}
            <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex flex-wrap gap-2">
                {items.map((item, index) => (
                    <Badge key={index} variant="secondary">{item}</Badge>
                ))}
            </div>
        </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <LayoutTemplate className="text-primary" />
            AI App Prototyper
        </CardTitle>
        <CardDescription>
          Ubah ide aplikasi mentah Anda menjadi rencana MVP (Minimum Viable Product) yang terstruktur. Jelaskan konsep Anda, dan biarkan AI menyusun rencana awalnya.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
            <Label htmlFor="app-idea">Jelaskan Ide Aplikasi Anda</Label>
            <Textarea
              id="app-idea"
              value={appIdea}
              onChange={(e) => setAppIdea(e.target.value)}
              placeholder="Contoh: Sebuah aplikasi seluler untuk membantu pengguna merawat tanaman hias mereka, dengan pengingat penyiraman, tips perawatan, dan identifikasi penyakit."
              disabled={isLoading}
              rows={5}
            />
        </div>
        
        <Button onClick={handleGenerate} disabled={isLoading || !appIdea} className="w-full">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Buat Rencana Prototipe
        </Button>

        {isLoading && (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">AI sedang menyusun rencana, mohon tunggu...</p>
            </div>
        )}

        {output && (
          <div className="space-y-6 pt-6 border-t">
            <h3 className="text-xl font-bold text-center">Rencana Prototipe Aplikasi Anda</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderList("Saran Nama Aplikasi", output.nameSuggestions, <Lightbulb className="text-primary"/>)}
                {renderList("Saran Slogan / Tagline", output.taglineSuggestions, <Tag className="text-primary"/>)}
            </div>
            
            <Card>
                <CardHeader className="flex-row items-center gap-2 space-y-0">
                    <CheckSquare className="text-primary"/>
                    <CardTitle className="text-lg">Fitur Inti (MVP)</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        {output.coreFeatures.map((feature, index) => (
                            <li key={index} className="flex flex-col p-3 border rounded-md bg-muted/30">
                                <span className="font-semibold">{feature.feature}</span>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="flex-row items-center gap-2 space-y-0">
                        <Users className="text-primary"/>
                        <CardTitle className="text-lg">Target Audiens</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">{output.targetAudience}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex-row items-center gap-2 space-y-0">
                        <DollarSign className="text-primary"/>
                        <CardTitle className="text-lg">Ide Monetisasi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                             {output.monetizationIdeas.map((item, index) => (
                                <Badge key={index} variant="outline">{item}</Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

          </div>
        )}
      </CardContent>
    </Card>
  );
}
