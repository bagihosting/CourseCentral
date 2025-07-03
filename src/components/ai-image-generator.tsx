'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, Download, Image as ImageIcon } from 'lucide-react';
import { generateImageAction } from '@/actions/ai';
import Image from 'next/image';
import { useLocalStorage } from '@/hooks/use-local-storage';

export function AiImageGenerator() {
  const [prompt, setPrompt] = useLocalStorage('ai_image_prompt', '');
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useLocalStorage<string | null>('ai_image_imageUrl', null);

  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt) {
      toast({
        title: 'Input Diperlukan',
        description: 'Harap masukkan deskripsi gambar yang ingin Anda buat.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setImageUrl(null);

    const result = await generateImageAction({ prompt });

    setIsLoading(false);

    if ('error' in result) {
      toast({
        title: 'Gagal Membuat Gambar',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      setImageUrl(result.imageUrl);
      toast({
        title: 'Sukses!',
        description: 'Gambar Anda telah berhasil dibuat dengan AI.',
      });
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    try {
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = `ai-generated-image-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast({
            title: 'Mengunduh...',
            description: 'Gambar Anda telah mulai diunduh.',
        });
    } catch (err) {
        console.error('Download failed: ', err);
        toast({
            title: 'Gagal Mengunduh',
            description: 'Tidak dapat mengunduh gambar.',
            variant: 'destructive',
        });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <ImageIcon className="text-primary" />
            AI Image Generator (Gemini Flash)
        </CardTitle>
        <CardDescription>
          Ubah deskripsi teks Anda menjadi gambar yang menakjubkan. Tuliskan imajinasi Anda dan biarkan AI yang melukisnya.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
            <Label htmlFor="prompt">Deskripsi Gambar (Prompt)</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Contoh: Seekor kucing astronot melayang di angkasa dengan latar belakang galaksi, gaya lukisan cat minyak"
              disabled={isLoading}
              rows={4}
            />
        </div>
        
        <Button onClick={handleGenerate} disabled={isLoading || !prompt} className="w-full">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Buat Gambar
        </Button>

        {isLoading && (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">AI sedang menggambar, mohon tunggu...</p>
            </div>
        )}

        {imageUrl && (
          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-xl font-bold text-center">Hasil Gambar Anda</h3>
            <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted border">
                <Image src={imageUrl} alt={prompt} fill className="object-contain" />
            </div>
             <Button variant="outline" className="w-full" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Unduh Gambar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
