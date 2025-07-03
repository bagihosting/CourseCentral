'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, Copy, FlaskConical, AlertTriangle } from 'lucide-react';
import { generateSoapFormulaAction } from '@/actions/ai';
import type { GenerateSoapFormulaInput, GenerateSoapFormulaOutput } from '@/ai/flows/generate-soap-formula';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export function AiSoapFormulaGenerator() {
  const [productType, setProductType] = useState<GenerateSoapFormulaInput['productType']>('dish-soap');
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState<GenerateSoapFormulaOutput | null>(null);

  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsLoading(true);
    setOutput(null);

    const result = await generateSoapFormulaAction({ productType });

    setIsLoading(false);

    if ('error' in result) {
      toast({
        title: 'Gagal Membuat Formula',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      setOutput(result);
      toast({
        title: 'Sukses!',
        description: 'Formula Anda telah berhasil dibuat.',
      });
    }
  };

  const handleCopy = (textToCopy: string) => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy).then(() => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <FlaskConical className="text-primary" />
            AI Generator Formula Sabun
        </CardTitle>
        <CardDescription>
          Hasilkan formula dasar untuk berbagai produk pembersih. Pilih jenis produk dan biarkan AI meracik resepnya untuk Anda.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
            <Label htmlFor="product-type">Pilih Jenis Produk</Label>
            <Select value={productType} onValueChange={(v) => setProductType(v as any)} disabled={isLoading}>
                <SelectTrigger id="product-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="dish-soap">Sabun Cuci Piring</SelectItem>
                    <SelectItem value="face-wash">Sabun Wajah Cair</SelectItem>
                    <SelectItem value="laundry-detergent">Deterjen Pakaian Cair</SelectItem>
                    <SelectItem value="anti-dandruff-shampoo">Sampo Anti Ketombe</SelectItem>
                </SelectContent>
            </Select>
        </div>
        
        <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Buat Formula
        </Button>

        {output && (
          <div className="space-y-6 pt-6 border-t">
            <h3 className="text-xl font-bold text-center">{output.productName}</h3>
            <p className="text-center text-sm text-muted-foreground -mt-4">{output.description}</p>
            
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Peringatan Keamanan Penting!</AlertTitle>
                <AlertDescription>
                    {output.safetyWarning}
                </AlertDescription>
            </Alert>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Bahan-Bahan</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Bahan</TableHead>
                                <TableHead>Jumlah</TableHead>
                                <TableHead>Satuan</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {output.ingredients.map((ing, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{ing.name}</TableCell>
                                    <TableCell>{ing.quantity}</TableCell>
                                    <TableCell>{ing.unit}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Instruksi Pembuatan</CardTitle>
                </CardHeader>
                <CardContent>
                    <ol className="list-decimal space-y-2 pl-5">
                        {output.instructions.map((step, index) => (
                            <li key={index}>{step}</li>
                        ))}
                    </ol>
                     <Button variant="outline" className="w-full mt-4" onClick={() => handleCopy(output.instructions.join('\n'))}>
                        <Copy className="mr-2 h-4 w-4" />
                        Salin Instruksi
                    </Button>
                </CardContent>
            </Card>

          </div>
        )}
      </CardContent>
    </Card>
  );
}
