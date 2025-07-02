'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, Copy } from 'lucide-react';
import { generateBloggerTemplateAction } from '@/actions/ai';

export function AiBloggerTemplateGenerator() {
  const [niche, setNiche] = useState('');
  const [style, setStyle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [templateCode, setTemplateCode] = useState('');
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!niche || !style) {
      toast({
        title: 'Input Diperlukan',
        description: 'Silakan isi niche dan gaya visual.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setTemplateCode('');

    const result = await generateBloggerTemplateAction({ niche, style });

    setIsLoading(false);

    if ('error' in result) {
      toast({
        title: 'Gagal Membuat Template',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      setTemplateCode(result.templateCode);
      toast({
        title: 'Sukses!',
        description: 'Template Blogger Anda telah berhasil dibuat.',
      });
    }
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(templateCode).then(() => {
        toast({
            title: 'Tersalin!',
            description: 'Kode template telah disalin ke clipboard.',
        });
    }).catch(err => {
        console.error('Failed to copy: ', err);
        toast({
            title: 'Gagal Menyalin',
            description: 'Tidak dapat menyalin kode ke clipboard.',
            variant: 'destructive',
        });
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-primary" />
            AI Template Blogger Generator
        </CardTitle>
        <CardDescription>
          Buat template Blogger yang responsif dan dapat disesuaikan secara instan. Cukup tentukan niche dan gaya visual blog Anda.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="niche">Niche Blog</Label>
            <Input
              id="niche"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="Contoh: Teknologi, Kuliner, Fashion"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="style">Gaya Visual</Label>
            <Input
              id="style"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              placeholder="Contoh: Minimalis, Modern, Vintage"
              disabled={isLoading}
            />
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={isLoading || !niche || !style} className="w-full">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Buat Template Sekarang
        </Button>

        {templateCode && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
                <Label htmlFor="template-output">Kode Template XML</Label>
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                    <Copy className="mr-2 h-4 w-4"/>
                    Salin Kode
                </Button>
            </div>
            <Textarea
              id="template-output"
              readOnly
              value={templateCode}
              className="font-mono h-96 text-xs"
              placeholder="Kode template XML Anda akan muncul di sini..."
            />
             <p className="text-xs text-muted-foreground">
                Salin kode ini dan tempelkan di editor HTML tema Blogger Anda.
             </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
