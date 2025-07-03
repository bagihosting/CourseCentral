'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, Copy, Download, Folder, File, Server, Pencil } from 'lucide-react';
import { generateWebAppAction, editWebAppAction } from '@/actions/ai';
import type { GenerateWebAppOutput } from '@/ai/flows/generate-web-app';

export function AiWebAppGenerator() {
  const [appName, setAppName] = useState('');
  const [appDescription, setAppDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState<GenerateWebAppOutput | null>(null);

  const [editRequest, setEditRequest] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!appName || !appDescription) {
      toast({
        title: 'Input Diperlukan',
        description: 'Silakan isi nama dan deskripsi aplikasi.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setOutput(null);

    const result = await generateWebAppAction({ appName, appDescription });
    setIsLoading(false);

    if ('error' in result) {
      toast({
        title: 'Gagal Membuat Aplikasi',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      setOutput(result);
      setEditRequest('');
      toast({
        title: 'Sukses!',
        description: 'Boilerplate aplikasi web Anda telah berhasil dibuat.',
      });
    }
  };
  
  const handleEdit = async () => {
    if (!editRequest || !output) return;

    setIsEditing(true);
    const result = await editWebAppAction({
      files: output.files,
      editRequest,
    });
    setIsEditing(false);

    if ('error' in result) {
      toast({
        title: 'Gagal Mengedit Aplikasi',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      setOutput(result);
      setEditRequest(''); // Clear input
      toast({
        title: 'Sukses!',
        description: 'Aplikasi Anda telah berhasil diperbarui.',
      });
    }
  };

  const handleCopy = (content: string, fileName: string) => {
    navigator.clipboard.writeText(content).then(() => {
        toast({
            title: 'Tersalin!',
            description: `Konten untuk ${fileName} telah disalin.`,
        });
    });
  };

  const handleDownload = (content: string, fileName: string) => {
    try {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error('Download failed: ', err);
        toast({
            title: 'Gagal Mengunduh',
            variant: 'destructive',
        });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Server className="text-primary" />
            AI Web App Generator
        </CardTitle>
        <CardDescription>
          Jelaskan ide aplikasi Anda, dan biarkan AI membuatkan boilerplate lengkap dengan Next.js, Tailwind, dan Genkit untuk Anda.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
            <Label htmlFor="app-name">Nama Aplikasi (ID di package.json)</Label>
            <Input
                id="app-name"
                value={appName}
                onChange={(e) => setAppName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="my-awesome-app"
                disabled={isLoading || isEditing}
            />
        </div>
        <div className="space-y-2">
            <Label htmlFor="app-description">Deskripsi Aplikasi</Label>
            <Textarea
              id="app-description"
              value={appDescription}
              onChange={(e) => setAppDescription(e.target.value)}
              placeholder="Contoh: Sebuah platform untuk berbagi dan menemukan resep masakan dari seluruh dunia, dengan fitur pencarian berbasis bahan."
              disabled={isLoading || isEditing}
              rows={4}
            />
        </div>
        
        <Button onClick={handleGenerate} disabled={isLoading || isEditing || !appName || !appDescription} className="w-full">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Buat Boilerplate Aplikasi
        </Button>

        {isLoading && (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">AI sedang membangun aplikasi Anda, ini mungkin memakan waktu sejenak...</p>
            </div>
        )}

        {output && (
          <div className="space-y-6 pt-6 border-t">
            {/* Edit Section */}
            <Card className="bg-muted/30">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Pencil className="text-primary" />
                        Ubah & Tambah Fitur
                    </CardTitle>
                    <CardDescription>
                        Minta AI untuk mengubah kode yang ada. Contoh: "Ubah warna utama menjadi hijau" atau "Tambahkan bagian FAQ di halaman utama".
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Textarea
                        value={editRequest}
                        onChange={(e) => setEditRequest(e.target.value)}
                        placeholder="Ketik permintaan perubahan Anda..."
                        disabled={isEditing || isLoading}
                        rows={3}
                    />
                    <Button onClick={handleEdit} disabled={isEditing || isLoading || !editRequest}>
                        {isEditing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menerapkan...</> : <><Sparkles className="mr-2 h-4 w-4" /> Terapkan Perubahan</>}
                    </Button>
                </CardContent>
            </Card>

            {/* Live Preview Section */}
            <div className="space-y-2">
                <Label htmlFor="template-preview">Pratinjau Langsung (Statis)</Label>
                <div className="w-full aspect-[16/10] border rounded-lg overflow-hidden bg-white">
                    <iframe
                        id="template-preview"
                        srcDoc={output.previewHtml}
                        title="Pratinjau Aplikasi Web"
                        className="w-full h-full border-0"
                        sandbox="allow-scripts allow-same-origin"
                    />
                </div>
                <p className="text-xs text-muted-foreground">
                    Pratinjau ini adalah representasi statis dan mungkin tidak sepenuhnya akurat.
                </p>
            </div>

            {/* File List Section */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-center flex items-center justify-center gap-2"><Folder className="h-6 w-6"/>Struktur Aplikasi Anda</h3>
                <p className="text-sm text-center text-muted-foreground">Unduh setiap file dan letakkan sesuai dengan path yang ditentukan.</p>
                <div className="space-y-3">
                    {output.files.map((file, index) => (
                        <Card key={index} className="bg-muted/30">
                            <CardHeader className="flex flex-row items-center justify-between p-3">
                                <div className="flex items-center gap-2">
                                    <File className="h-4 w-4"/>
                                    <p className="font-mono text-sm font-semibold">{file.filePath}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button size="sm" variant="ghost" onClick={() => handleCopy(file.fileContent, file.fileName)}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => handleDownload(file.fileContent, file.fileName)}>
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
