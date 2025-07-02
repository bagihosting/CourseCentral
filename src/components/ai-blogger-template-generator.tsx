'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, Copy, Download } from 'lucide-react';
import { generateBloggerTemplateAction } from '@/actions/ai';

export function AiBloggerTemplateGenerator() {
  const [niche, setNiche] = useState('');
  const [style, setStyle] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [templateCode, setTemplateCode] = useState('');
  const { toast } = useToast();

  const previewCode = useMemo(() => {
    if (!templateCode) return '';

    // 1. Strip XML declaration
    let code = templateCode.replace(/<\?xml[^?]*\?>\s*/, '');

    // 2. Extract variables and their default values
    const variables: Record<string, string> = {};
    const varRegex = /<b:variable\s+name='([^']*)'[^>]*default='([^']*)'[^>]*\/>/g;
    let match;
    while ((match = varRegex.exec(templateCode)) !== null) {
        variables[match[1]] = match[2];
    }

    // 3. Find and process the CSS inside b:skin
    const skinRegex = /<b:skin\s*>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/b:skin>/;
    const skinMatch = code.match(skinRegex);
    
    if (skinMatch && skinMatch[1]) {
        let cssContent = skinMatch[1];
        
        // 4. Replace Blogger variables with their default values
        for (const [name, defaultValue] of Object.entries(variables)) {
            const varAsRegex = new RegExp(`\\$${name.replace('.', '\\.')}`, 'g');
            cssContent = cssContent.replace(varAsRegex, defaultValue);
        }
        
        // 5. Replace the entire <b:skin> block with a <style> block for preview
        const styleTag = `<style type="text/css">${cssContent}</style>`;
        code = code.replace(skinRegex, styleTag);
    }
    
    return code;
  }, [templateCode]);

  const handleGenerate = async () => {
    if (!niche || !style || !creatorName) {
      toast({
        title: 'Input Diperlukan',
        description: 'Silakan isi semua kolom: niche, gaya visual, dan nama pembuat.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setTemplateCode('');

    const result = await generateBloggerTemplateAction({ niche, style, creatorName });

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
    if (!templateCode) return;
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

  const handleDownload = () => {
    if (!templateCode) return;
    try {
        const blob = new Blob([templateCode], { type: 'application/xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `template-blogger-${niche.toLowerCase().replace(/\s/g, '-')}.xml`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({
            title: 'Mengunduh...',
            description: 'File template Anda telah mulai diunduh.',
        });
    } catch (err) {
        console.error('Download failed: ', err);
        toast({
            title: 'Gagal Mengunduh',
            description: 'Tidak dapat membuat file untuk diunduh.',
            variant: 'destructive',
        });
    }
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="niche">Niche Blog</Label>
            <Input
              id="niche"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="Contoh: Teknologi"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="style">Gaya Visual</Label>
            <Input
              id="style"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              placeholder="Contoh: Minimalis"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="creator">Nama Pembuat</Label>
            <Input
              id="creator"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              placeholder="Contoh: Studio Desain"
              disabled={isLoading}
            />
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={isLoading || !niche || !style || !creatorName} className="w-full">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Buat Template Sekarang
        </Button>

        {templateCode && (
          <div className="space-y-6">
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="template-output">Kode Template XML</Label>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={handleCopy}>
                            <Copy className="mr-2 h-4 w-4"/>
                            Salin
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleDownload}>
                            <Download className="mr-2 h-4 w-4"/>
                            Unduh
                        </Button>
                    </div>
                </div>
                <Textarea
                id="template-output"
                readOnly
                value={templateCode}
                className="font-mono h-96 text-xs bg-muted/30"
                placeholder="Kode template XML Anda akan muncul di sini..."
                />
                <p className="text-xs text-muted-foreground">
                    Salin kode ini dan tempelkan di editor HTML tema Blogger Anda, atau unduh sebagai file XML.
                </p>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="template-preview">Pratinjau Langsung</Label>
                <div className="w-full aspect-[16/10] border rounded-lg overflow-hidden bg-white">
                    <iframe
                        id="template-preview"
                        srcDoc={previewCode}
                        title="Pratinjau Template Blogger"
                        className="w-full h-full border-0"
                        sandbox="allow-scripts allow-same-origin"
                    />
                </div>
                 <p className="text-xs text-muted-foreground">
                    Pratinjau ini mungkin tidak sepenuhnya akurat karena keterbatasan sandbox. Untuk tampilan terbaik, uji langsung di Blogger.
                 </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
