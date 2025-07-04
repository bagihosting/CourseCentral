'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, BookCopy, FileDown, Pencil, Wand2 } from 'lucide-react';
import { suggestMakalahTitlesAction, generateMakalahAction, editMakalahAction } from '@/actions/ai';
import type { GenerateMakalahOutput } from '@/ai/flows/generate-makalah';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DOMPurify from 'isomorphic-dompurify';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, HeadingLevel } from 'docx';

export function AiMakalahGenerator() {
  const [major, setMajor] = useLocalStorage('ai_makalah_major', '');
  const [title, setTitle] = useLocalStorage('ai_makalah_title', '');
  const [pageCount, setPageCount] = useLocalStorage('ai_makalah_pageCount', 5);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [output, setOutput] = useLocalStorage<GenerateMakalahOutput | null>('ai_makalah_output', null);
  const [editRequest, setEditRequest] = useLocalStorage('ai_makalah_editRequest', '');
  
  const { toast } = useToast();
  const paperContentRef =  useState<HTMLDivElement>(null);

  const handleGenerateTitles = async () => {
    if (!major) {
      toast({ title: 'Input Diperlukan', description: 'Harap masukkan jurusan Anda.', variant: 'destructive' });
      return;
    }
    setIsGeneratingTitle(true);
    setTitleSuggestions([]);
    const result = await suggestMakalahTitlesAction({ major });
    setIsGeneratingTitle(false);
    if ('error' in result) {
      toast({ title: 'Gagal', description: result.error, variant: 'destructive' });
    } else {
      setTitleSuggestions(result.titles);
      toast({ title: 'Sukses', description: 'Saran judul telah dibuat.' });
    }
  };

  const handleGenerateMakalah = async () => {
    if (!title || !major || pageCount <= 0) {
      toast({ title: 'Input Diperlukan', description: 'Harap isi jurusan, judul, dan jumlah halaman.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setOutput(null);
    const result = await generateMakalahAction({ title, major, pageCount });
    setIsLoading(false);
    if ('error' in result) {
      toast({ title: 'Gagal Membuat Makalah', description: result.error, variant: 'destructive' });
    } else {
      setOutput(result);
      toast({ title: 'Sukses!', description: 'Draf makalah Anda telah berhasil dibuat.' });
    }
  };

  const handleEditMakalah = async () => {
    if (!output?.paperContent || !editRequest) {
      toast({ title: 'Input Diperlukan', description: 'Harap buat makalah dan isi permintaan edit.', variant: 'destructive' });
      return;
    }
    setIsEditing(true);
    const fullContent = `## Konten Utama\n${output.paperContent}\n\n## Daftar Pustaka\n${output.bibliography}`;
    const result = await editMakalahAction({ currentContent: fullContent, editRequest });
    setIsEditing(false);

    if ('error' in result) {
      toast({ title: 'Gagal Mengedit', description: result.error, variant: 'destructive' });
    } else {
      // Simple split, might need more robust logic if content structure changes
      const [newContent, newBiblio] = result.editedContent.split('## Daftar Pustaka');
      setOutput({
          paperContent: newContent.replace('## Konten Utama\n', ''),
          bibliography: newBiblio || ''
      });
      setEditRequest('');
      toast({ title: 'Sukses!', description: 'Makalah Anda telah diperbarui.' });
    }
  };

  const downloadPdf = async () => {
    const contentElement = paperContentRef.current;
    if (!contentElement) {
        toast({ title: "Gagal", description: "Konten tidak ditemukan untuk diunduh.", variant: "destructive" });
        return;
    }
    setIsDownloading(true);
    try {
        const canvas = await html2canvas(contentElement, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgWidth / imgHeight;
        const height = pdfWidth / ratio;
        let position = 0;
        let remainingHeight = imgHeight;

        while(remainingHeight > 0) {
            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = imgWidth;
            pageCanvas.height = imgHeight;
            const pageCtx = pageCanvas.getContext('2d');
            if (!pageCtx) continue;
            
            const sourceY = position * canvas.height;
            const sourceHeight = Math.min(canvas.height, remainingHeight);
            
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = sourceHeight;
            const tempCtx = tempCanvas.getContext('2d');
            if (!tempCtx) continue;
            tempCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
            
            const pageImgData = tempCanvas.toDataURL('image/png');
            const pageImgHeight = pdfWidth / (tempCanvas.width/tempCanvas.height);


            if(position > 0) pdf.addPage();
            pdf.addImage(pageImgData, 'PNG', 0, 0, pdfWidth, pageImgHeight);
            position++;
            remainingHeight -= sourceHeight * ratio * 1.5; // Heuristic adjustment
        }
        
        pdf.save(`makalah-${title.substring(0, 20)}.pdf`);
    } catch(e) {
        console.error(e);
        toast({ title: "Gagal Mengunduh PDF", description: "Terjadi kesalahan saat membuat PDF.", variant: "destructive" });
    } finally {
        setIsDownloading(false);
    }
  };

  const downloadDocx = async () => {
      if (!output) return;
      setIsDownloading(true);

      const formatText = (text: string) => {
          const lines = text.split('\n').filter(line => line.trim() !== '');
          const children: any[] = [];
          
          lines.forEach(line => {
              if (line.startsWith('# ')) {
                  children.push(new Paragraph({ text: line.substring(2), heading: HeadingLevel.HEADING_1 }));
              } else if (line.startsWith('## ')) {
                  children.push(new Paragraph({ text: line.substring(3), heading: HeadingLevel.HEADING_2 }));
              } else if (line.startsWith('### ')) {
                  children.push(new Paragraph({ text: line.substring(4), heading: HeadingLevel.HEADING_3 }));
              } else {
                  children.push(new Paragraph({ text: line }));
              }
          });
          return children;
      };

      const doc = new Document({
          sections: [{
              children: [
                  ...formatText(output.paperContent),
                  new Paragraph({ text: "Daftar Pustaka", heading: HeadingLevel.HEADING_1 }),
                  ...formatText(output.bibliography),
              ]
          }]
      });

      try {
        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `makalah-${title.substring(0, 20)}.docx`;
        a.click();
        URL.revokeObjectURL(url);
      } catch(e) {
          toast({ title: "Gagal Mengunduh DOCX", description: "Terjadi kesalahan saat membuat file.", variant: "destructive" });
      } finally {
        setIsDownloading(false);
      }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <BookCopy className="text-primary" />
            AI Generator Makalah
        </CardTitle>
        <CardDescription>
          Buat draf makalah perkuliahan lengkap dari berbagai jurusan. Cukup tentukan jurusan, judul, dan jumlah halaman yang diinginkan.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="major">Jurusan</Label>
            <Input id="major" value={major} onChange={(e) => setMajor(e.target.value)} placeholder="Contoh: Teknik Informatika" disabled={isLoading || isEditing}/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pageCount">Jumlah Halaman</Label>
            <Input id="pageCount" type="number" value={pageCount} onChange={(e) => setPageCount(parseInt(e.target.value, 10))} min="1" disabled={isLoading || isEditing}/>
          </div>
        </div>

        <div className="space-y-2">
            <Label htmlFor="title">Judul Makalah</Label>
            <div className="flex gap-2">
                <Select value={title} onValueChange={setTitle} disabled={isLoading || isEditing}>
                    <SelectTrigger id="title"><SelectValue placeholder="Pilih atau ketik judul..." /></SelectTrigger>
                    <SelectContent>
                        {titleSuggestions.map((s, i) => <SelectItem key={i} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Button variant="outline" onClick={handleGenerateTitles} disabled={isGeneratingTitle || !major}>
                    {isGeneratingTitle ? <Loader2 className="h-4 w-4 animate-spin"/> : <Wand2 className="h-4 w-4"/>}
                </Button>
            </div>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Atau ketik judul Anda sendiri di sini"/>
        </div>

        <Button onClick={handleGenerateMakalah} disabled={isLoading || isEditing || !title || !major || pageCount <= 0} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Buat Draf Makalah
        </Button>

        {output && (
          <div className="space-y-6 pt-6 border-t">
            {/* Download Buttons */}
            <Card>
                <CardHeader className="pb-2"><CardTitle className="text-xl">Unduh Makalah</CardTitle></CardHeader>
                <CardContent className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={downloadDocx} disabled={isDownloading}><FileDown className="mr-2"/> Word (.docx)</Button>
                    <Button variant="outline" className="flex-1" onClick={downloadPdf} disabled={isDownloading}><FileDown className="mr-2"/> PDF</Button>
                </CardContent>
                <CardFooter><p className="text-xs text-muted-foreground">Unduh PDF mungkin memerlukan waktu beberapa saat untuk diproses.</p></CardFooter>
            </Card>

            {/* Editor */}
            <Card className="bg-muted/30">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Pencil className="text-primary" />
                        Edit dengan AI
                    </CardTitle>
                    <CardDescription>
                        Minta perubahan pada makalah di bawah ini. Contoh: "Tambahkan penjelasan tentang algoritma A*", "Buat kesimpulan lebih ringkas".
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Textarea value={editRequest} onChange={(e) => setEditRequest(e.target.value)} placeholder="Ketik permintaan edit Anda di sini..." disabled={isEditing || isLoading} rows={3}/>
                    <Button onClick={handleEditMakalah} disabled={isEditing || isLoading || !editRequest}>
                        {isEditing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Pencil className="mr-2 h-4 w-4" />}
                        Terapkan Perubahan
                    </Button>
                </CardContent>
            </Card>
            
            {/* Result */}
            <div className="space-y-4" ref={paperContentRef}>
                <h3 className="text-2xl font-bold text-center">{title}</h3>
                <div className="prose dark:prose-invert max-w-none p-4 border rounded-lg bg-background" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(output.paperContent.replace(/\n/g, '<br/>')) }} />
                
                <h4 className="text-xl font-bold pt-4">Daftar Pustaka</h4>
                <div className="prose dark:prose-invert max-w-none p-4 border rounded-lg bg-background" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(output.bibliography.replace(/\n/g, '<br/>')) }} />
            </div>

          </div>
        )}
      </CardContent>
    </Card>
  );
}
