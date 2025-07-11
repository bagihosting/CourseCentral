
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, Server, Download, FileCode } from 'lucide-react';
import { generateGenkitAppAction } from '@/actions/ai';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

type AppFile = {
    filePath: string;
    fileContent: string;
}

export function AiGenkitAppFactory() {
  const [appName, setAppName] = useLocalStorage('ai_genkit_appName', 'my-ai-app');
  const [appDescription, setAppDescription] = useLocalStorage('ai_genkit_appDesc', '');
  
  const [isLoading, setIsLoading] = useState(false);
  const [outputFiles, setOutputFiles] = useState<AppFile[] | null>(null);

  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!appName || !appDescription) {
      toast({
        title: 'Input Diperlukan',
        description: 'Harap isi nama dan deskripsi aplikasi.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setOutputFiles(null);

    const result = await generateGenkitAppAction({ appName, appDescription });

    setIsLoading(false);

    if ('error' in result) {
      toast({
        title: 'Gagal Membuat Aplikasi',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      setOutputFiles(result.files);
      toast({
        title: 'Sukses!',
        description: 'Aplikasi portabel Anda telah berhasil dibuat. Anda dapat mengunduhnya sebagai file ZIP.',
      });
    }
  };
  
  const handleDownloadZip = async () => {
    if (!outputFiles) {
        toast({ title: 'Gagal', description: 'Tidak ada file untuk diunduh.', variant: 'destructive' });
        return;
    }
    
    toast({ title: 'Mempersiapkan ZIP...', description: 'Mohon tunggu sebentar.' });

    const zip = new JSZip();
    outputFiles.forEach(file => {
        // For files in subdirectories, create folders
        zip.file(file.filePath, file.fileContent);
    });

    try {
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, `${appName}.zip`);
    } catch(e) {
        console.error(e);
        toast({ title: 'Gagal Membuat ZIP', description: 'Terjadi kesalahan saat membuat file zip.', variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Server className="text-primary" />
            AI Genkit App Factory
        </CardTitle>
        <CardDescription>
          Buat boilerplate aplikasi AI portabel yang lengkap dengan Next.js dan Genkit. Jelaskan ide Anda, dan AI akan membuat seluruh kode sumber yang dapat Anda unduh dan jalankan secara lokal.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="app-name">Nama Aplikasi (tanpa spasi)</Label>
                <Input id="app-name" value={appName} onChange={(e) => setAppName(e.target.value.toLowerCase().replace(/\s+/g, '-'))} placeholder="Contoh: my-story-generator" disabled={isLoading} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="app-description">Deskripsi Aplikasi</Label>
                <Textarea id="app-description" value={appDescription} onChange={(e) => setAppDescription(e.target.value)} placeholder="Contoh: Aplikasi yang menghasilkan cerita pendek berdasarkan genre dan karakter yang diberikan pengguna." disabled={isLoading} rows={4}/>
            </div>
        </div>
        
        <Button onClick={handleGenerate} disabled={isLoading || !appName || !appDescription} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Buat Aplikasi Portabel
        </Button>

        {outputFiles && (
          <div className="space-y-6 pt-6 border-t">
            <div className="flex flex-col items-center gap-4 text-center">
                <h3 className="text-xl font-bold">Aplikasi Anda Siap!</h3>
                <p className="text-sm text-muted-foreground">
                    Semua file yang diperlukan telah dibuat. Unduh sebagai ZIP, ekstrak, jalankan `npm install` lalu `npm run dev` untuk memulai.
                </p>
                <Button onClick={handleDownloadZip} size="lg">
                    <Download className="mr-2" /> Unduh sebagai .ZIP
                </Button>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="files">
                    <AccordionTrigger>Lihat File yang Dihasilkan</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                            {outputFiles.map(file => (
                                <div key={file.filePath} className="space-y-2">
                                    <Label className="flex items-center gap-2 font-mono text-sm"><FileCode className="h-4 w-4"/>{file.filePath}</Label>
                                    <Textarea readOnly value={file.fileContent} className="h-48 bg-muted/50 font-mono text-xs"/>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
