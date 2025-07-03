'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, Copy, Briefcase } from 'lucide-react';
import { generateUmkmProfileAction } from '@/actions/ai';
import type { GenerateUmkmProfileOutput } from '@/ai/flows/generate-umkm-profile';
import { useLocalStorage } from '@/hooks/use-local-storage';

function OutputField({ label, value, onCopy }: { label: string; value: string; onCopy: () => void; }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="text-base font-semibold">{label}</Label>
        <Button size="sm" variant="ghost" onClick={onCopy}>
            <Copy className="h-4 w-4 mr-2" /> Salin
        </Button>
      </div>
      <div className="p-4 rounded-md border bg-muted/50 whitespace-pre-wrap text-sm">
        {value}
      </div>
    </div>
  );
}

export function AiUmkmProfileGenerator() {
  const [businessType, setBusinessType] = useLocalStorage('ai_umkm_businessType', '');
  const [targetMarket, setTargetMarket] = useLocalStorage('ai_umkm_targetMarket', '');
  const [uniqueSellingPoint, setUniqueSellingPoint] = useLocalStorage('ai_umkm_usp', '');
  
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState<GenerateUmkmProfileOutput | null>(null);

  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!businessType || !targetMarket || !uniqueSellingPoint) {
      toast({
        title: 'Input Diperlukan',
        description: 'Harap isi semua kolom untuk hasil terbaik.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setOutput(null);

    const result = await generateUmkmProfileAction({
      businessType,
      targetMarket,
      uniqueSellingPoint,
    });

    setIsLoading(false);

    if ('error' in result) {
      toast({
        title: 'Gagal Membuat Profil',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      setOutput(result);
      toast({
        title: 'Sukses!',
        description: 'Profil bisnis UMKM Anda telah berhasil dibuat.',
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
            <Briefcase className="text-primary" />
            AI Asisten UMKM
        </CardTitle>
        <CardDescription>
          Buat identitas awal untuk bisnis Anda. Masukkan ide Anda, dan biarkan AI membantu membuat nama, slogan, deskripsi, dan bahkan ide postingan media sosial pertama Anda.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* --- Form Section --- */}
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="business-type">Jenis Usaha</Label>
                <Input id="business-type" value={businessType} onChange={(e) => setBusinessType(e.target.value)} placeholder="Contoh: Kedai Kopi, Toko Pakaian, Jasa Desain Grafis" disabled={isLoading} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="target-market">Target Pasar</Label>
                <Input id="target-market" value={targetMarket} onChange={(e) => setTargetMarket(e.target.value)} placeholder="Contoh: Mahasiswa, Profesional muda, Keluarga" disabled={isLoading}/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="usp">Keunggulan Unik / Nilai Jual</Label>
                <Textarea id="usp" value={uniqueSellingPoint} onChange={(e) => setUniqueSellingPoint(e.target.value)} placeholder="Contoh: Menggunakan bahan organik, layanan 24 jam, harga terjangkau" disabled={isLoading} rows={3}/>
            </div>
        </div>
        
        <Button onClick={handleGenerate} disabled={isLoading || !businessType || !targetMarket || !uniqueSellingPoint} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Buat Profil Bisnis
        </Button>

        {/* --- Output Section --- */}
        {output && (
          <div className="space-y-6 pt-6 border-t">
            <h3 className="text-xl font-bold text-center">Hasil Profil Bisnis Anda</h3>
            <OutputField label="Nama Bisnis" value={output.businessName} onCopy={() => handleCopy(output.businessName, 'Nama Bisnis')} />
            <OutputField label="Slogan / Tagline" value={output.tagline} onCopy={() => handleCopy(output.tagline, 'Slogan')} />
            <OutputField label="Deskripsi Singkat" value={output.shortDescription} onCopy={() => handleCopy(output.shortDescription, 'Deskripsi Singkat')} />
            <OutputField label="Ide Postingan Media Sosial" value={output.socialMediaPostIdea} onCopy={() => handleCopy(output.socialMediaPostIdea, 'Ide Postingan')} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
