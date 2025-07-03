'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, Copy, Download } from 'lucide-react';
import { generateSkripsiChapterAction } from '@/actions/ai';
import { useLocalStorage } from '@/hooks/use-local-storage';

export function AiSkripsiGenerator() {
  const [topic, setTopic] = useLocalStorage('ai_skripsi_topic', '');
  const [chapterTitle, setChapterTitle] = useLocalStorage('ai_skripsi_chapterTitle', '');
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useLocalStorage('ai_skripsi_content', '');

  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic || !chapterTitle) {
      toast({
        title: 'Input Diperlukan',
        description: 'Silakan isi topik skripsi dan judul bab.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setContent('');

    const result = await generateSkripsiChapterAction({ topic, chapterTitle });

    setIsLoading(false);

    if ('error' in result) {
      toast({
        title: 'Gagal Membuat Draf',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      setContent(result.content);
      toast({
        title: 'Sukses!',
        description: 'Draf bab skripsi Anda telah berhasil dibuat.',
      });
    }
  };
  
  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content).then(() => {
        toast({
            title: 'Tersalin!',
            description: 'Konten telah disalin ke clipboard.',
        });
    }).catch(err => {
        console.error('Failed to copy: ', err);
        toast({
            title: 'Gagal Menyalin',
            description: 'Tidak dapat menyalin konten ke clipboard.',
            variant: 'destructive',
        });
    });
  };

  const handleDownload = () => {
    if (!content) return;
    try {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${chapterTitle.toLowerCase().replace(/\s/g, '-')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({
            title: 'Mengunduh...',
            description: 'File draf Anda telah mulai diunduh.',
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
            AI Asisten Penulisan Skripsi
        </CardTitle>
        <CardDescription>
          Buat draf untuk bab skripsi Anda secara instan. Cukup tentukan topik utama dan judul bab yang diinginkan.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Topik Skripsi</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Contoh: Analisis Sentimen Media Sosial..."
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="chapter">Judul Bab</Label>
            <Input
              id="chapter"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              placeholder="Contoh: BAB I PENDAHULUAN"
              disabled={isLoading}
            />
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={isLoading || !topic || !chapterTitle} className="w-full">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Buat Draf Bab
        </Button>

        {content && (
          <div className="space-y-2 pt-6 border-t">
            <div className="flex justify-between items-center">
                <Label htmlFor="skripsi-output">Hasil Draf</Label>
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
              id="skripsi-output"
              readOnly
              value={content}
              className="font-mono h-96 text-sm bg-muted/30"
              placeholder="Draf bab skripsi Anda akan muncul di sini..."
            />
            <p className="text-xs text-muted-foreground">
              Harap tinjau, sunting, dan verifikasi semua informasi yang dihasilkan AI sebelum digunakan dalam pekerjaan akademis Anda.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
