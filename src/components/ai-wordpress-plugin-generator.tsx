'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, Copy, Download, Plug } from 'lucide-react';
import { generateWordpressPluginBoilerplateAction } from '@/actions/ai';
import { useLocalStorage } from '@/hooks/use-local-storage';

export function AiWordpressPluginGenerator() {
  const [pluginName, setPluginName] = useLocalStorage('ai_wp_pluginName', '');
  const [description, setDescription] = useLocalStorage('ai_wp_description', '');
  const [authorName, setAuthorName] = useLocalStorage('ai_wp_authorName', '');
  const [pluginUri, setPluginUri] = useLocalStorage('ai_wp_pluginUri', '');
  const [authorUri, setAuthorUri] = useLocalStorage('ai_wp_authorUri', '');
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState<{ readmeTxtContent: string, phpFileContent: string } | null>(null);

  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!pluginName || !description || !authorName) {
      toast({
        title: 'Input Diperlukan',
        description: 'Silakan isi Nama Plugin, Deskripsi, dan Nama Pembuat.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setOutput(null);

    const result = await generateWordpressPluginBoilerplateAction({
      pluginName,
      description,
      authorName,
      pluginUri,
      authorUri,
    });

    setIsLoading(false);

    if ('error' in result) {
      toast({
        title: 'Gagal Membuat Kerangka',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      setOutput(result);
      toast({
        title: 'Sukses!',
        description: 'Kerangka plugin WordPress Anda telah berhasil dibuat.',
      });
    }
  };
  
  const handleCopy = (content: string, fieldName: string) => {
    if (!content) return;
    navigator.clipboard.writeText(content).then(() => {
        toast({
            title: 'Tersalin!',
            description: `Konten untuk ${fieldName} telah disalin ke clipboard.`,
        });
    }).catch(err => {
        console.error('Failed to copy: ', err);
        toast({
            title: 'Gagal Menyalin',
            description: `Tidak dapat menyalin konten ${fieldName}.`,
            variant: 'destructive',
        });
    });
  };

  const handleDownload = (content: string, filename: string) => {
    if (!content) return;
    try {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error('Download failed: ', err);
        toast({
            title: 'Gagal Mengunduh',
            description: 'Tidak dapat membuat file untuk diunduh.',
            variant: 'destructive',
        });
    }
  };
  
  const phpFileName = `${pluginName.toLowerCase().replace(/\s+/g, '-') || 'my-plugin'}.php`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Plug className="text-primary" />
            AI Plugin Wordpress Generator
        </CardTitle>
        <CardDescription>
          Buat file kerangka dasar (boilerplate) untuk plugin WordPress baru Anda. Cukup isi detail di bawah ini dan AI akan membuatkan file `readme.txt` dan file PHP utama untuk Anda.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="plugin-name">Nama Plugin</Label>
            <Input id="plugin-name" value={pluginName} onChange={(e) => setPluginName(e.target.value)} placeholder="Contoh: My Awesome Slider" disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="author-name">Nama Pembuat</Label>
            <Input id="author-name" value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Contoh: John Doe" disabled={isLoading}/>
          </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="description">Deskripsi Singkat</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Contoh: Plugin slider yang luar biasa untuk menampilkan gambar." disabled={isLoading} rows={2}/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="plugin-uri">URL Plugin (Opsional)</Label>
                <Input id="plugin-uri" value={pluginUri} onChange={(e) => setPluginUri(e.target.value)} placeholder="https://example.com/my-plugin" disabled={isLoading}/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="author-uri">URL Pembuat (Opsional)</Label>
                <Input id="author-uri" value={authorUri} onChange={(e) => setAuthorUri(e.target.value)} placeholder="https://johndoe.com" disabled={isLoading}/>
            </div>
        </div>

        <Button onClick={handleGenerate} disabled={isLoading || !pluginName || !description || !authorName} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Buat Kerangka Plugin
        </Button>

        {output && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t">
            {/* Readme.txt Output */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="readme-output">Konten `readme.txt`</Label>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleCopy(output.readmeTxtContent, 'readme.txt')}><Copy className="mr-2 h-4 w-4"/>Salin</Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDownload(output.readmeTxtContent, 'readme.txt')}><Download className="mr-2 h-4 w-4"/>Unduh</Button>
                    </div>
                </div>
                <Textarea id="readme-output" readOnly value={output.readmeTxtContent} className="font-mono h-96 text-xs bg-muted/30"/>
            </div>
            
            {/* PHP File Output */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="php-output">Konten `{phpFileName}`</Label>
                     <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleCopy(output.phpFileContent, phpFileName)}><Copy className="mr-2 h-4 w-4"/>Salin</Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDownload(output.phpFileContent, phpFileName)}><Download className="mr-2 h-4 w-4"/>Unduh</Button>
                    </div>
                </div>
                <Textarea id="php-output" readOnly value={output.phpFileContent} className="font-mono h-96 text-xs bg-muted/30"/>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
