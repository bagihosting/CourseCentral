'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, Copy, Download, Pencil } from 'lucide-react';
import { generateBloggerTemplateAction, editBloggerTemplateAction } from '@/actions/ai';

export function AiBloggerTemplateGenerator() {
  const [niche, setNiche] = useState('');
  const [style, setStyle] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [templateCode, setTemplateCode] = useState('');
  
  // State for the new edit feature
  const [editRequest, setEditRequest] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const { toast } = useToast();

  const previewCode = useMemo(() => {
    if (!templateCode) return '';

    // 1. Strip XML declaration and DOCTYPE for cleaner HTML
    let code = templateCode
      .replace(/<\?xml[^?]*\?>\s*/, '')
      .replace(/<!DOCTYPE[^>]*>\s*/, '');

    // 2. Extract variables and their default values
    const variables: Record<string, string> = {};
    const varRegex = /<b:variable\s+name='([^']*)'[^>]*default='([^']*)'[^>]*\/>/g;
    let match;
    while ((match = varRegex.exec(templateCode)) !== null) {
        variables[match[1]] = match[2];
    }

    // 3. Find and process the CSS inside b:skin
    const skinRegex = /<b:skin\s*>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/b:skin>/;
    const skinMatch = code.match(skinRegex);
    
    if (skinMatch && skinMatch[1]) {
        let cssContent = skinMatch[1];
        
        // 4. Replace Blogger variables with their default values
        for (const [name, defaultValue] of Object.entries(variables)) {
            const varAsRegex = new RegExp(`\\$${name.replace('.', '\\.')}`, 'g');
            cssContent = cssContent.replace(varAsRegex, defaultValue);
        }
        
        // 5. Replace the entire <b:skin> block with a <style> block for preview
        const styleTag = `<style type="text/css">${cssContent}</style>`;
        code = code.replace(skinRegex, styleTag);
    }
    
    // 6. Replace Blogger-specific tags with standard HTML tags for better preview rendering
    code = code
      .replace(/<b:section/g, '<div')
      .replace(/<\/b:section>/g, '</div>')
      .replace(/<b:widget/g, '<div')
      .replace(/<\/b:widget>/g, '</div>')
      // Also remove template-skin which is not a standard tag
      .replace(/<b:template-skin>[\s\S]*?<\/b:template-skin>/, '');

    // 7. Add some placeholder content for common data tags to make the preview look more alive
    code = code
        .replace(/>data:blog.title</g, '>Nama Blog Saya<')
        .replace(/>data:blog.pageTitle</g, '>Judul Halaman<')
        .replace(/>data:widget.title</g, '>Judul Widget<');
        
    // A simple placeholder for a blog post loop
    const blogWidgetRegex = /(<div[^>]*type='Blog'[^>]*>)([\s\S]*?)(<\/div>)/;
    const blogWidgetMatch = code.match(blogWidgetRegex);
    
    if(blogWidgetMatch) {
      const blogPostPlaceholder = `
        <div class='post'>
          <h3 class='post-title'>Ini Contoh Judul Postingan</h3>
          <div class='post-body'>
            <p>Ini adalah paragraf contoh untuk isi postingan blog. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor.</p>
            <p>Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat.</p>
          </div>
        </div>
        <div class='post'>
          <h3 class='post-title'>Postingan Blog Lainnya</h3>
          <div class='post-body'>
            <p>Ini adalah paragraf kedua untuk menunjukkan bagaimana beberapa postingan akan terlihat di halaman utama Anda.</p>
          </div>
        </div>
      `;
      code = code.replace(blogWidgetRegex, `$1${blogPostPlaceholder}$3`);
    }

    return code;
  }, [templateCode]);

  const handleGenerate = async () => {
    if (!niche || !style || !creatorName) {
      toast({
        title: 'Input Diperlukan',
        description: 'Silakan isi semua kolom: niche, gaya visual, dan nama pembuat.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setTemplateCode('');
    setEditRequest(''); // Reset edit request on new generation

    const result = await generateBloggerTemplateAction({ niche, style, creatorName });

    setIsLoading(false);

    if ('error' in result) {
      toast({
        title: 'Gagal Membuat Template',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      setTemplateCode(result.templateCode);
      toast({
        title: 'Sukses!',
        description: 'Template Blogger Anda telah berhasil dibuat.',
      });
    }
  };
  
  const handleCopy = () => {
    if (!templateCode) return;
    navigator.clipboard.writeText(templateCode).then(() => {
        toast({
            title: 'Tersalin!',
            description: 'Kode template telah disalin ke clipboard.',
        });
    }).catch(err => {
        console.error('Failed to copy: ', err);
        toast({
            title: 'Gagal Menyalin',
            description: 'Tidak dapat menyalin kode ke clipboard.',
            variant: 'destructive',
        });
    });
  };

  const handleDownload = () => {
    if (!templateCode) return;
    try {
        const blob = new Blob([templateCode], { type: 'application/xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `template-blogger-${niche.toLowerCase().replace(/\s/g, '-')}.xml`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({
            title: 'Mengunduh...',
            description: 'File template Anda telah mulai diunduh.',
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

  // Handler for the new edit feature
  const handleEdit = async () => {
    if (!editRequest) {
      toast({
        title: 'Input Diperlukan',
        description: 'Silakan isi permintaan edit Anda.',
        variant: 'destructive',
      });
      return;
    }

    setIsEditing(true);
    const result = await editBloggerTemplateAction({ templateCode, editRequest });
    setIsEditing(false);

    if ('error' in result) {
      toast({
        title: 'Gagal Mengedit Template',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      setTemplateCode(result.editedTemplateCode);
      setEditRequest(''); // Clear input after successful edit
      toast({
        title: 'Sukses!',
        description: 'Template Anda telah berhasil diedit.',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-primary" />
            AI Template Blogger Generator
        </CardTitle>
        <CardDescription>
          Buat template Blogger yang responsif dan dapat disesuaikan secara instan. Cukup tentukan niche dan gaya visual blog Anda.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="niche">Niche Blog</Label>
            <Input
              id="niche"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="Contoh: Teknologi"
              disabled={isLoading || isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="style">Gaya Visual</Label>
            <Input
              id="style"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              placeholder="Contoh: Minimalis"
              disabled={isLoading || isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="creator">Nama Pembuat</Label>
            <Input
              id="creator"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              placeholder="Contoh: Studio Desain"
              disabled={isLoading || isEditing}
            />
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={isLoading || isEditing || !niche || !style || !creatorName} className="w-full">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Buat Template Baru
        </Button>

        {templateCode && (
          <div className="space-y-6 pt-6 border-t">
            {/* --- Edit with AI Section --- */}
            <Card className="bg-muted/30">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Pencil className="text-primary" />
                        Edit Template dengan Kata Kunci
                    </CardTitle>
                    <CardDescription>
                        Masukkan instruksi untuk mengubah templat di atas. Misalnya: "Ubah warna utama menjadi biru tua" atau "Buat header lebih tinggi 100px".
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="space-y-2">
                        <Label htmlFor="edit-request">Permintaan Perubahan Anda</Label>
                        <Textarea
                            id="edit-request"
                            value={editRequest}
                            onChange={(e) => setEditRequest(e.target.value)}
                            placeholder="Ketik permintaan edit Anda di sini..."
                            disabled={isEditing || isLoading}
                            rows={3}
                        />
                    </div>
                    <Button onClick={handleEdit} disabled={isEditing || isLoading || !editRequest} className="w-full md:w-auto">
                        {isEditing ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menerapkan...</>
                        ) : (
                            <><Pencil className="mr-2 h-4 w-4" /> Terapkan Perubahan</>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* --- Output Section --- */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="template-output">Kode Template XML (Hasil Akhir)</Label>
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
                id="template-output"
                readOnly
                value={templateCode}
                className="font-mono h-96 text-xs bg-muted/30"
                placeholder="Kode template XML Anda akan muncul di sini..."
                />
                <p className="text-xs text-muted-foreground">
                    Salin kode ini dan tempelkan di editor HTML tema Blogger Anda, atau unduh sebagai file XML.
                </p>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="template-preview">Pratinjau Langsung</Label>
                <div className="w-full aspect-[16/10] border rounded-lg overflow-hidden bg-white">
                    <iframe
                        id="template-preview"
                        srcDoc={previewCode}
                        title="Pratinjau Template Blogger"
                        className="w-full h-full border-0"
                        sandbox="allow-scripts allow-same-origin"
                    />
                </div>
                 <p className="text-xs text-muted-foreground">
                    Pratinjau ini mungkin tidak sepenuhnya akurat karena keterbatasan sandbox. Untuk tampilan terbaik, uji langsung di Blogger.
                 </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
