'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, Copy, Megaphone } from 'lucide-react';
import { generateGoogleAdsAction } from '@/actions/ai';
import type { GenerateGoogleAdsOutput } from '@/ai/flows/generate-google-ads';
import { Badge } from '@/components/ui/badge';
import { useLocalStorage } from '@/hooks/use-local-storage';

export function AiGoogleAdsGenerator() {
  const [productName, setProductName] = useLocalStorage('ai_ads_productName', '');
  const [targetAudience, setTargetAudience] = useLocalStorage('ai_ads_targetAudience', '');
  const [keyFeatures, setKeyFeatures] = useLocalStorage('ai_ads_keyFeatures', '');
  
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState<GenerateGoogleAdsOutput | null>(null);

  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!productName || !targetAudience || !keyFeatures) {
      toast({
        title: 'Input Diperlukan',
        description: 'Silakan isi semua kolom untuk hasil terbaik.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setOutput(null);

    const result = await generateGoogleAdsAction({
      productName,
      targetAudience,
      keyFeatures,
    });

    setIsLoading(false);

    if ('error' in result) {
      toast({
        title: 'Gagal Membuat Iklan',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      setOutput(result);
      toast({
        title: 'Sukses!',
        description: 'Teks iklan Google Anda telah berhasil dibuat.',
      });
    }
  };
  
  const handleCopy = (textToCopy: string, fieldName: string) => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy).then(() => {
        toast({
            title: 'Tersalin!',
            description: `${fieldName} telah disalin ke clipboard.`,
        });
    }).catch(err => {
        console.error('Failed to copy: ', err);
        toast({
            title: 'Gagal Menyalin',
            description: 'Tidak dapat menyalin ke clipboard.',
            variant: 'destructive',
        });
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Megaphone className="text-primary" />
            AI Google Ads Copy Generator
        </CardTitle>
        <CardDescription>
          Buat teks iklan yang menarik untuk kampanye Google Ads Anda. Cukup isi detail produk dan biarkan AI yang bekerja.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="product-name">Nama Produk/Layanan</Label>
            <Input id="product-name" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Contoh: Kursus Memasak Online" disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target-audience">Target Audiens</Label>
            <Input id="target-audience" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="Contoh: Ibu rumah tangga, pemula" disabled={isLoading}/>
          </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="key-features">Fitur Utama / Poin Penjualan</Label>
            <Textarea id="key-features" value={keyFeatures} onChange={(e) => setKeyFeatures(e.target.value)} placeholder="Contoh: Resep eksklusif, diajar oleh chef profesional, akses seumur hidup" disabled={isLoading} rows={3}/>
        </div>
        
        <Button onClick={handleGenerate} disabled={isLoading || !productName || !targetAudience || !keyFeatures} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Buat Teks Iklan
        </Button>

        {output && (
          <div className="space-y-6 pt-6 border-t">
            {/* Headlines */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Judul (Headlines)</CardTitle>
                    <CardDescription>Maksimal 30 karakter. Gunakan 3-5 judul ini dalam kampanye Anda.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {output.headlines.map((headline, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-md border bg-muted/30">
                            <p className="text-sm font-mono">"{headline}"</p>
                             <div className="flex items-center gap-2">
                                <span className={`text-xs ${headline.length > 30 ? 'text-destructive' : 'text-muted-foreground'}`}>
                                    {headline.length}/30
                                </span>
                                <Button size="sm" variant="ghost" onClick={() => handleCopy(headline, `Judul ${index + 1}`)}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Descriptions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Deskripsi</CardTitle>
                    <CardDescription>Maksimal 90 karakter. Gunakan 2 deskripsi ini dalam kampanye Anda.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {output.descriptions.map((desc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-md border bg-muted/30">
                            <p className="text-sm font-mono">"{desc}"</p>
                             <div className="flex items-center gap-2">
                                <span className={`text-xs ${desc.length > 90 ? 'text-destructive' : 'text-muted-foreground'}`}>
                                    {desc.length}/90
                                </span>
                                <Button size="sm" variant="ghost" onClick={() => handleCopy(desc, `Deskripsi ${index + 1}`)}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Keywords */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Saran Kata Kunci</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {output.keywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary">{keyword}</Badge>
                    ))}
                </CardContent>
                 <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => handleCopy(output.keywords.join('\n'), 'Kata kunci')}>
                        <Copy className="mr-2 h-4 w-4" />
                        Salin Semua Kata Kunci
                    </Button>
                </CardFooter>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
