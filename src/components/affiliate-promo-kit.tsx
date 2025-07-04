
'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { generatePromoThumbnailAction, generateAffiliatePromoAction } from '@/actions/ai';
import { Loader2, Sparkles, Copy, Download } from 'lucide-react';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const SocialIcon = ({ type, text, url }: { type: 'facebook' | 'twitter' | 'whatsapp' | 'telegram', text: string, url: string }) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text);
    let shareUrl = '';
    const svgProps = { width: 20, height: 20, className: "text-white" };

    let icon;
    switch(type) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
            icon = <svg {...svgProps} viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
            icon = <svg {...svgProps} viewBox="0 0 24 24" fill="currentColor"><path d="M22 4s-.7 2.1-2 3.4c1.6 1.4 3.3 4.9 3.3 4.9s-5.2-.6-5.2-.6l-3.3-3.3s.1 4.7-4.1 8.2c-4.2 3.5-7.8 2.3-7.8 2.3s2.9-.9 5.2-3.4c-2.1-.2-4.1-1.6-4.1-1.6s.5.2 1.2.2c-2.1-.4-3.4-2.2-3.4-2.2s.6.4 1.2.4c-2.1-.5-3.4-2.6-3.4-2.6s.7.5 1.2.5c-2.1-.6-3.4-3-3.4-3s1.6 1.2 3.3 1.2c-1.3-3.3.1-5.6.1-5.6s2.1 2.6 5.2 2.6c.2-2.1 2.3-3.4 2.3-3.4s.7-.2 1.2.5c.7.6.9.5.9.5s.7-.9 2.1-.9z"></path></svg>;
            break;
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${encodedText}`;
            icon = <svg {...svgProps} viewBox="0 0 24 24" fill="currentColor"><path d="M16.75 13.96c.25.13.43.2.5.28.07.08.1.18.1.28.02.1-.04.28-.08.38-.04.1-.1.18-.22.28-.12.1-.28.16-.48.16s-.4-.05-.53-.08c-.13-.03-.28-.07-.45-.13-.17-.06-.35-.13-.56-.23-.2-.1-.4-.2-.6-.35-.2-.13-.4-.28-.58-.45-.18-.17-.35-.35-.5-.55s-.27-.4-.38-.6c-.1-.2-.18-.4-.22-.6s-.06-.4-.04-.58c.02-.18.06-.35.13-.5.07-.15.15-.28.28-.4.12-.1.25-.18.4-.22.13-.04.25-.06.35-.06s.2.03.28.06c.07.03.13.07.18.13.05.06.1.13.13.2.03.07.05.13.05.2v.06c-.02.08-.04.15-.08.2s-.08.1-.14.13c-.06.03-.1.05-.14.05s-.1-.02-.15-.04c-.05-.02-.1-.05-.14-.08-.04-.03-.1-.07-.13-.1-.04-.03-.08-.07-.13-.1-.04-.03-.08-.07-.13-.1s-.1-.08-.14-.13c-.04-.05-.08-.1-.1-.15s-.04-.1-.04-.15v-.1c0-.07.03-.13.08-.18.05-.05.13-.08.2-.08.07-.02.16-.02.25 0 .1.01.18.04.25.08.07.04.13.1.18.17.05.07.1.15.13.25.03.1.05.2.05.3v.05c-.02.1-.05.2-.1.28-.05.08-.1.15-.18.2s-.17.1-.25.13c-.08.03-.17.05-.25.05s-.17-.02-.25-.04c-.08-.02-.15-.05-.2-.08-.05-.03-.1-.07-.13-.1s-.05-.07-.06-.1c-.02-.03-.02-.06-.02-.1v-.14c0-.05.02-.1.05-.13.03-.03.07-.05.1-.06.03-.02.07-.03.1-.03s.07.01.1.02c.03.01.07.02.1.04.03.02.07.04.1.06.03.02.07.05.1.08.03.03.06.06.1.1.03.03.06.07.1.1.02.03.05.07.08.1.03.03.06.06.1.1s.06.07.1.1c.02.03.05.06.08.1.03.03.05.06.08.1.03.03.05.06.08.1.03.02.05.05.08.08s.05.06.08.1c.02.04.05.08.08.13.03.05.05.1.08.15.03.05.05.1.08.18.02.07.04.15.05.23.01.08.02.17.02.25v.25c-.02.17-.07.32-.15.45s-.18.25-.3.35c-.12.1-.25.18-.4.25-.15.07-.3.1-.45.13z M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"></path></svg>;
            break;
        case 'telegram':
            shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
            icon = <svg {...svgProps} viewBox="0 0 24 24" fill="currentColor"><path d="M15 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM9.5 2C4.26 2 0 5.45 0 9.87c0 2.45.98 4.7 2.6 6.44L1 22.7l4.3-1.07c1.6.64 3.3.97 5.2.97 5.24 0 9.5-3.45 9.5-7.87S14.74 2 9.5 2z"></path></svg>;
            break;
    }
    return (
        <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-primary/80 hover:bg-primary rounded-full transition-colors">
            {icon}
        </a>
    )
}

export function AffiliatePromoKit({ referralLink }: { referralLink: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedTexts, setGeneratedTexts] = useState<string[] | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsLoading(true);
    setGeneratedImage(null);
    setGeneratedTexts(null);
    
    try {
      const [imageResult, textResult] = await Promise.all([
        generatePromoThumbnailAction(),
        generateAffiliatePromoAction({ referralLink })
      ]);

      if ('error' in imageResult) {
        throw new Error(`Gagal membuat gambar: ${imageResult.error}`);
      }
      if ('error' in textResult) {
        throw new Error(`Gagal membuat teks: ${textResult.error}`);
      }

      setGeneratedImage(imageResult.imageUrl);
      setGeneratedTexts(textResult.promoTexts);
      toast({ title: 'Sukses!', description: 'Alat promosi Anda berhasil dibuat.' });
      
    } catch(e) {
      const error = e as Error;
      toast({ title: 'Gagal Membuat Promosi', description: error.message, variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: 'Tersalin!', description: 'Teks promosi telah disalin.' });
    });
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const a = document.createElement('a');
    a.href = generatedImage;
    a.download = `promo-scriptify-${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        Buat Gambar & Teks Promosi
      </Button>

      {isLoading && (
        <div className="text-center p-8 border-2 border-dashed rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-muted-foreground">AI sedang meracik materi promosi Anda...</p>
        </div>
      )}

      {generatedImage && generatedTexts && (
        <div className="space-y-6 pt-4">
          <Card>
            <CardHeader>
                <CardTitle>Gambar Promosi</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                <Image src={generatedImage} alt="Gambar Promosi Afiliasi" fill className="object-contain" />
              </div>
              <Button onClick={handleDownload} variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" /> Unduh Gambar
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle>Teks Promosi (Clickbait)</CardTitle>
                <CardDescription>Gunakan teks ini untuk postingan media sosial Anda. Link referral sudah termasuk.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {generatedTexts.map((text, index) => (
                <div key={index} className="p-3 border rounded-lg bg-muted/30">
                  <p className="text-sm mb-3">{text}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <SocialIcon type="facebook" text={text} url={referralLink} />
                        <SocialIcon type="twitter" text={text} url={referralLink} />
                        <SocialIcon type="whatsapp" text={text} url={referralLink} />
                        <SocialIcon type="telegram" text={text} url={referralLink} />
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => handleCopy(text)}>
                      <Copy className="mr-2 h-4 w-4" /> Salin Teks
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Alert>
              <AlertTitle>Tips untuk Instagram & TikTok</AlertTitle>
              <AlertDescription>
                Unduh gambar di atas dan salin salah satu teks promosi. Buat postingan baru di Instagram atau TikTok, unggah gambarnya, dan tempelkan teksnya di caption Anda. Pastikan link referral Anda ada di bio!
              </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
