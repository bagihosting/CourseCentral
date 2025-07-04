
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, Download, Image as ImageIcon } from 'lucide-react';
import { generatePromoThumbnailAction } from '@/actions/ai';
import Image from 'next/image';
import { useLocalStorage } from '@/hooks/use-local-storage';

export function AiPromoThumbnailGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useLocalStorage<string | null>('ai_promo_thumbnail_url', null);

  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsLoading(true);
    setImageUrl(null);

    const result = await generatePromoThumbnailAction();

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
        description: 'Thumbnail promosi Anda telah berhasil dibuat dengan AI.',
      });
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    try {
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = `scriptify-promo-thumbnail-${Date.now()}.png`;
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
            AI Thumbnail Promosi
        </CardTitle>
        <CardDescription>
          Buat gambar promosi yang menarik untuk Scriptify dengan karakter superhero dan teks clickbait. Cukup klik tombol di bawah ini.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Buat Thumbnail Promosi
        </Button>

        {isLoading && (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">AI sedang menggambar, ini bisa memakan waktu sejenak...</p>
            </div>
        )}

        {imageUrl && (
          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-xl font-bold text-center">Hasil Gambar Anda</h3>
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted border">
                <Image src={imageUrl} alt="Thumbnail Promosi Scriptify" fill className="object-contain" />
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
    