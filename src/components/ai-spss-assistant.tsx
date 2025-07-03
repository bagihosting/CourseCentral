'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, Copy, BarChart } from 'lucide-react';
import { generateSpssSyntaxAction } from '@/actions/ai';
import type { GenerateSpssSyntaxOutput } from '@/ai/flows/generate-spss-syntax';
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
      <Textarea
        readOnly
        value={value}
        className="font-mono h-48 text-xs bg-muted/30"
        placeholder="Hasil akan muncul di sini..."
      />
    </div>
  );
}


export function AiSpssAssistant() {
  const [analysisDescription, setAnalysisDescription] = useLocalStorage('ai_spss_analysisDesc', '');
  
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState<GenerateSpssSyntaxOutput | null>(null);

  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!analysisDescription) {
      toast({
        title: 'Input Diperlukan',
        description: 'Harap jelaskan analisis statistik yang Anda inginkan.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setOutput(null);

    const result = await generateSpssSyntaxAction({
      analysisDescription,
    });

    setIsLoading(false);

    if ('error' in result) {
      toast({
        title: 'Gagal Membuat Sintaks',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      setOutput(result);
      toast({
        title: 'Sukses!',
        description: 'Sintaks SPSS dan penjelasannya telah berhasil dibuat.',
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
            <BarChart className="text-primary" />
            AI Asisten SPSS
        </CardTitle>
        <CardDescription>
          Jelaskan analisis statistik yang Anda butuhkan, dan biarkan AI membuatkan sintaks SPSS beserta penjelasannya untuk Anda.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* --- Form Section --- */}
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="analysis-description">Deskripsi Analisis</Label>
                <Textarea id="analysis-description" value={analysisDescription} onChange={(e) => setAnalysisDescription(e.target.value)} placeholder="Contoh: Saya ingin melakukan uji-t untuk membandingkan rata-rata nilai belajar antara kelompok eksperimen dan kelompok kontrol." disabled={isLoading} rows={4}/>
            </div>
        </div>
        
        <Button onClick={handleGenerate} disabled={isLoading || !analysisDescription} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Buat Sintaks SPSS
        </Button>

        {/* --- Output Section --- */}
        {output && (
          <div className="space-y-6 pt-6 border-t">
            <h3 className="text-xl font-bold text-center">Hasil dari AI</h3>
            <OutputField label="Sintaks SPSS" value={output.spssSyntax} onCopy={() => handleCopy(output.spssSyntax, 'Sintaks SPSS')} />
            <OutputField label="Penjelasan Sintaks" value={output.explanation} onCopy={() => handleCopy(output.explanation, 'Penjelasan')} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
