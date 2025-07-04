
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, Server, Globe, FileCode, Eye, ShieldAlert } from 'lucide-react';
import { generateWebAppAction, editWebAppAction } from '@/actions/ai';
import type { GenerateWebAppOutput, EditWebAppOutput } from '@/ai/flows/generate-web-app';
import DOMPurify from 'isomorphic-dompurify';
import { useLocalStorage } from '@/hooks/use-local-storage';

type AppFile = GenerateWebAppOutput['files'][0];

export function AiWebAppGenerator() {
  const [appName, setAppName] = useLocalStorage('ai_webapp_appName', 'my-awesome-app');
  const [appDescription, setAppDescription] = useLocalStorage('ai_webapp_appDescription', '');
  const [cloneUrl, setCloneUrl] = useLocalStorage('ai_webapp_cloneUrl', '');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [files, setFiles] = useLocalStorage<AppFile[] | null>('ai_webapp_files', null);
  const [previewHtml, setPreviewHtml] = useLocalStorage<string | null>('ai_webapp_previewHtml', null);
  const [explanation, setExplanation] = useLocalStorage<string | null>('ai_webapp_explanation', null);
  
  const [editRequest, setEditRequest] = useLocalStorage('ai_webapp_editRequest', '');
  
  const { toast } = useToast();

  // --- Main Generation ---
  const handleGenerate = async () => {
    if (!appName || (!appDescription && !cloneUrl)) {
      toast({
        title: 'Input Diperlukan',
        description: 'Harap isi nama aplikasi dan deskripsi atau URL untuk dikloning.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setFiles(null);
    setPreviewHtml(null);
    setExplanation(null);

    try {
        const result = await generateWebAppAction({ appName, appDescription, cloneUrl });
        if ('error' in result) {
            throw new Error(result.error);
        }
        setFiles(result.files);
        setPreviewHtml(result.previewHtml);
        setExplanation(result.explanation);
        toast({
            title: 'Sukses!',
            description: 'Boilerplate aplikasi web Anda telah berhasil dibuat.',
        });
    } catch (e: any) {
        toast({
            title: 'Gagal Membuat Aplikasi',
            description: e.message,
            variant: 'destructive',
        });
    } finally {
        setIsLoading(false);
    }
  };

  // --- Edit Feature ---
  const handleEdit = async () => {
    if (!files || files.length === 0 || !editRequest) {
        toast({
            title: 'Input Diperlukan',
            description: 'Harap buat aplikasi terlebih dahulu dan masukkan permintaan edit.',
            variant: 'destructive',
        });
        return;
    }
    
    setIsEditing(true);

    try {
        const result = await editWebAppAction({ files, editRequest });
        if ('error'in result) {
            throw new Error(result.error);
        }
        setFiles(result.files);
        setPreviewHtml(result.previewHtml);
        setExplanation(result.explanation);
        setEditRequest('');
        toast({
            title: 'Sukses!',
            description: 'Aplikasi Anda telah berhasil diperbarui.',
        });
    } catch (e: any) {
        toast({
            title: 'Gagal Mengedit Aplikasi',
            description: e.message,
            variant: 'destructive',
        });
    } finally {
        setIsEditing(false);
    }
  };

  const isFlowDisabled = true;

  if (isFlowDisabled) {
     return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Server className="text-primary" />
                AI Web App Generator
            </CardTitle>
            <CardDescription>
              Jelaskan ide aplikasi Anda atau berikan URL untuk dikloning, dan biarkan AI membuatkan boilerplate lengkap untuk Anda.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-amber-500/50 rounded-lg bg-amber-500/10 text-amber-800">
                <ShieldAlert className="h-10 w-10 mb-4" />
                <h3 className="font-semibold text-lg">Fitur Dinonaktifkan Sementara</h3>
                <p className="text-center mt-2 text-sm">
                    Untuk alasan keamanan, fitur ini sedang dalam peninjauan dan dinonaktifkan sementara.
                </p>
            </div>
          </CardContent>
        </Card>
      );
  }


  return (
    <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Server className="text-primary" />
            AI Web App Generator
        </CardTitle>
        <CardDescription>
          Jelaskan ide aplikasi Anda atau berikan URL untuk dikloning, dan biarkan AI membuatkan boilerplate lengkap untuk Anda.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="app-name">Nama Aplikasi</Label>
            <Input id="app-name" value={appName} onChange={(e) => setAppName(e.target.value)} placeholder="Contoh: my-awesome-app" disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clone-url">URL untuk Kloning UI (Opsional)</Label>
            <Input id="clone-url" value={cloneUrl} onChange={(e) => setCloneUrl(e.target.value)} placeholder="https://example.com" disabled={isLoading}/>
          </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="app-description">Deskripsi Aplikasi</Label>
            <Textarea id="app-description" value={appDescription} onChange={(e) => setAppDescription(e.target.value)} placeholder="Contoh: Aplikasi to-do list sederhana dengan autentikasi pengguna dan penyimpanan data." disabled={isLoading} rows={3}/>
        </div>
        
        <Button onClick={handleGenerate} disabled={isLoading || isEditing} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Buat Aplikasi Web
        </Button>
       </CardContent>
    </Card>

    {files && (
        <Card>
             <CardHeader>
                <CardTitle className="flex items-center gap-2"><Eye /> Hasil & Pratinjau</CardTitle>
                <CardDescription>Berikut adalah file yang dihasilkan, penjelasan, dan pratinjau aplikasi Anda.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 {/* Preview */}
                <div className="space-y-2">
                    <Label htmlFor="app-preview">Pratinjau Aplikasi</Label>
                    <div className="w-full h-96 border rounded-lg overflow-hidden bg-white">
                        <iframe
                            id="app-preview"
                            srcDoc={DOMPurify.sanitize(previewHtml || '', { WHOLE_DOCUMENT: true })}
                            title="Pratinjau Aplikasi"
                            className="w-full h-full border-0"
                            sandbox="allow-scripts allow-same-origin"
                        />
                    </div>
                </div>

                {/* File List */}
                <div className="space-y-2">
                    <Label>File yang Dihasilkan</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {files.map(file => (
                            <Card key={file.filePath} className="p-3">
                                <p className="font-semibold flex items-center gap-2"><FileCode className="h-4 w-4" /> {file.fileName}</p>
                                <p className="text-xs text-muted-foreground">{file.filePath}</p>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Explanation */}
                {explanation && (
                     <div className="space-y-2">
                        <Label>Penjelasan Kode</Label>
                        <div className="prose dark:prose-invert max-w-none p-4 border rounded-lg" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(explanation) }} />
                     </div>
                )}

                 {/* Edit Section */}
                <div className="space-y-4 pt-4 border-t">
                    <Label htmlFor="edit-request">Minta Perubahan</Label>
                    <Textarea
                        id="edit-request"
                        value={editRequest}
                        onChange={(e) => setEditRequest(e.target.value)}
                        placeholder="Contoh: Ubah warna primer menjadi biru, atau tambahkan tombol logout di header."
                        rows={3}
                        disabled={isEditing || isLoading}
                    />
                    <Button onClick={handleEdit} disabled={isEditing || isLoading}>
                        {isEditing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Terapkan Perubahan
                    </Button>
                </div>
            </CardContent>
        </Card>
    )}
    </div>
  );
}
