
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, Server, FileCode, Eye, Copy } from 'lucide-react';
import { generateInstantAppAction } from '@/actions/ai';
import type { GenerateInstantAppOutput } from '@/ai/flows/generate-instant-app';
import DOMPurify from 'isomorphic-dompurify';
import { useLocalStorage } from '@/hooks/use-local-storage';

export function AiInstantAppGenerator() {
  const [appDescription, setAppDescription] = useLocalStorage('ai_instant_app_desc', '');
  const [isLoading, setIsLoading] = useState(false);

  const [generatedCode, setGeneratedCode] = useLocalStorage<string | null>('ai_instant_app_code', null);
  const [explanation, setExplanation] = useLocalStorage<string | null>('ai_instant_app_explanation', null);
  const [previewHtml, setPreviewHtml] = useLocalStorage<string | null>('ai_instant_app_preview', null);

  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!appDescription) {
      toast({
        title: 'Input Diperlukan',
        description: 'Harap masukkan deskripsi aplikasi yang ingin Anda buat.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setGeneratedCode(null);
    setPreviewHtml(null);
    setExplanation(null);

    try {
        const result = await generateInstantAppAction({ appDescription });
        if ('error' in result) {
            throw new Error(result.error);
        }
        setGeneratedCode(result.pageTsxContent);
        setPreviewHtml(result.previewHtml);
        setExplanation(result.explanation);
        toast({
            title: 'Sukses!',
            description: 'Aplikasi instan Anda telah berhasil dibuat oleh AI.',
        });
    } catch (e: any) {
        toast({
            title: 'Gagal Membuat Aplikasi',
            description: e.message,
            variant: 'destructive',
        });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleCopyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode).then(() => {
        toast({ description: 'Kode aplikasi telah disalin.' });
    });
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Server className="text-primary" />
            AI Instant App Generator
        </CardTitle>
        <CardDescription>
          Sambil menunggu aplikasi kustom Anda, coba buat prototipe aplikasi satu halaman dengan AI. Jelaskan ide Anda, dan AI akan membuatkan kodenya untuk Anda.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
            <Label htmlFor="app-description">Jelaskan Ide Aplikasi Anda</Label>
            <Textarea 
                id="app-description"
                value={appDescription}
                onChange={(e) => setAppDescription(e.target.value)}
                placeholder="Contoh: Aplikasi pencatat pengeluaran harian sederhana dengan kategori, yang menyimpan data di browser."
                disabled={isLoading}
                rows={4}
            />
        </div>
        
        <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Buat Aplikasi Instan
        </Button>

        {(isLoading || generatedCode) && (
             <div className="space-y-6 pt-6 border-t">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">AI sedang membangun aplikasi Anda...</p>
                    </div>
                )}
                {generatedCode && (
                    <div className="space-y-4">
                        <Label htmlFor="code-output" className="flex items-center gap-2 text-lg font-semibold"><FileCode/> Kode Aplikasi (page.tsx)</Label>
                        <div className="relative">
                            <Textarea
                                id="code-output"
                                readOnly
                                value={generatedCode}
                                className="font-mono h-96 text-xs bg-background"
                            />
                            <Button size="sm" variant="ghost" className="absolute top-2 right-2" onClick={handleCopyCode}>
                                <Copy className="h-4 w-4 mr-2" /> Salin
                            </Button>
                        </div>
                    </div>
                )}
                {explanation && (
                     <div className="space-y-2">
                        <Label className="text-lg font-semibold">Penjelasan Kode</Label>
                        <div className="prose dark:prose-invert max-w-none p-4 border rounded-lg bg-background" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(explanation) }} />
                     </div>
                )}
                {previewHtml && (
                    <div className="space-y-2">
                        <Label htmlFor="app-preview" className="flex items-center gap-2 text-lg font-semibold"><Eye /> Pratinjau Visual</Label>
                        <div className="w-full h-96 border rounded-lg overflow-hidden bg-white">
                            <iframe
                                id="app-preview"
                                srcDoc={DOMPurify.sanitize(previewHtml, { WHOLE_DOCUMENT: true })}
                                title="Pratinjau Aplikasi"
                                className="w-full h-full border-0"
                                sandbox="allow-scripts allow-same-origin"
                            />
                        </div>
                    </div>
                )}
             </div>
        )}
      </CardContent>
    </Card>
  );
}
