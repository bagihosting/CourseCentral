
'use client';

import type { Course, Module, Lesson } from '@/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Film, FileText, Package, Pencil, PlusCircle, Trash2, Youtube, Loader2, Bold, Italic, List, Heading1, Heading2, Wand2 } from 'lucide-react';
import { useState, useOptimistic, FormEvent, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { addModule, updateModule, deleteModule, addLesson, updateLesson, deleteLesson } from '@/actions/curriculum';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { suggestModuleTitleAction, generateLessonContentAction, suggestLessonTitleAction } from '@/actions/ai';
import { useAuth } from '@/contexts/auth-context';

type FormErrors = {
    title?: string;
    type?: string;
    contentUrl?: string;
}

// --- Module Form ---
function ModuleForm({ course, module, onFinished }: { course: Course, module?: Module, onFinished: () => void }) {
  const [title, setTitle] = useState(module?.title || '');
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleGenerateTitle = async () => {
    setIsGenerating(true);
    const existingModuleTitles = course.modules.map(m => m.title);
    const result = await suggestModuleTitleAction({ courseTitle: course.title, existingModuleTitles });
    setIsGenerating(false);

    if ('error' in result) {
      toast({ title: 'Gagal', description: result.error, variant: 'destructive' });
    } else {
      setTitle(result.suggestedTitle);
      toast({ title: 'Sukses', description: 'Judul modul berhasil dibuat oleh AI.' });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (title.length < 3) {
      setError('Judul modul minimal 3 karakter.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      if (module) {
        await updateModule(course.id, module.id, { title }, user.id);
        toast({ title: 'Sukses', description: 'Modul berhasil diperbarui.'});
      } else {
        await addModule(course.id, user.id);
        toast({ title: 'Sukses', description: 'Modul berhasil ditambahkan.'});
      }
      onFinished();
    } catch(e) {
      const errorMessage = e instanceof Error ? e.message : 'Kesalahan tidak diketahui.';
      toast({ title: 'Gagal', description: errorMessage, variant: 'destructive'});
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 p-1">
        <div className="space-y-2">
          <Label htmlFor="title">Judul Modul</Label>
          <div className="flex items-center gap-2">
            <Input id="title" name="title" value={title} onChange={e => setTitle(e.target.value)} className="flex-grow" placeholder="Contoh: Pengenalan Dasar" />
            <Button type="button" variant="outline" size="icon" onClick={handleGenerateTitle} disabled={isGenerating || isSubmitting}>
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              <span className="sr-only">Buat dengan AI</span>
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </div>
      <DialogFooter className="mt-4">
        <DialogClose asChild><Button type="button" variant="ghost">Batal</Button></DialogClose>
        <Button type="submit" disabled={isGenerating || isSubmitting}>{isSubmitting ? 'Menyimpan...' : (module ? 'Simpan Perubahan' : 'Tambah Modul')}</Button>
      </DialogFooter>
    </form>
  );
}

// --- Lesson Form ---
function LessonForm({ course, moduleId, lesson, onFinished }: { course: Course, moduleId: string, lesson?: Lesson, onFinished: () => void }) {
    const { user } = useAuth();
    const [title, setTitle] = useState(lesson?.title || '');
    const [type, setType] = useState<Lesson['type']>(lesson?.type || 'text');
    const [contentUrl, setContentUrl] = useState(lesson?.contentUrl || '');
    const [content, setContent] = useState(lesson?.content || '');
    const [errors, setErrors] = useState<FormErrors>({});
    const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
    const [isGeneratingContent, setIsGeneratingContent] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const contentRef = useRef<HTMLTextAreaElement>(null);

    const handleGenerateTitle = async () => {
        const module = course.modules.find(m => m.id === moduleId);
        if (!module) {
            toast({ title: "Error", description: "Modul tidak ditemukan.", variant: "destructive" });
            return;
        }
        setIsGeneratingTitle(true);
        const existingLessonTitles = module.lessons.map(l => l.title);
        const result = await suggestLessonTitleAction({
            courseTitle: course.title,
            moduleTitle: module.title,
            existingLessonTitles: existingLessonTitles
        });
        setIsGeneratingTitle(false);

        if ('error' in result) {
            toast({ title: 'Gagal', description: result.error, variant: 'destructive' });
        } else {
            setTitle(result.suggestedTitle);
            toast({ title: 'Sukses', description: 'Judul pelajaran berhasil dibuat oleh AI.' });
        }
    };

    const handleFormat = (tag: 'b' | 'i' | 'h1' | 'h2' | 'ul') => {
        const textarea = contentRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);
        
        let replacement = '';
        let finalCursorStart = 0;
        let finalCursorEnd = 0;

        if (tag === 'ul') {
            const listItems = selectedText.split('\n').map(line => `  <li>${line}</li>`).join('\n');
            replacement = `<ul>\n${listItems || '  <li></li>'}\n</ul>`;
            finalCursorStart = start + (listItems ? replacement.length : '<ul>\n  <li>'.length);
            finalCursorEnd = finalCursorStart;
        } else {
            const openTag = `<${tag}>`;
            const closeTag = `</${tag}>`;
            replacement = `${openTag}${selectedText}${closeTag}`;
            finalCursorStart = start + openTag.length;
            finalCursorEnd = finalCursorStart + selectedText.length;
        }

        const newContent = content.substring(0, start) + replacement + content.substring(end);
        setContent(newContent);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(finalCursorStart, finalCursorEnd);
        }, 0);
    };

    const handleGenerateContent = async () => {
        if (!title) {
            toast({ title: "Gagal", description: "Judul pelajaran harus diisi terlebih dahulu.", variant: "destructive" });
            return;
        }
        setIsGeneratingContent(true);
        const result = await generateLessonContentAction({ courseTitle: course.title, lessonTitle: title });
        setIsGeneratingContent(false);

        if ('error' in result) {
            toast({ title: 'Gagal', description: result.error, variant: 'destructive' });
        } else {
            setContent(result.content);
            toast({ title: 'Sukses', description: 'Konten tutorial berhasil dibuat oleh AI.' });
        }
    };

    const validate = () => {
        const newErrors: FormErrors = {};
        if(title.length < 3) newErrors.title = 'Judul pelajaran minimal 3 karakter.';
        if ((type === 'video' || type === 'youtube' || type === 'zip') && !contentUrl) {
            newErrors.contentUrl = 'URL konten tidak boleh kosong.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }
  
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if(!validate() || !user) {
            toast({ title: 'Gagal', description: 'Harap periksa kembali isian Anda.', variant: 'destructive' });
            return
        };
        
        setIsSubmitting(true);
        try {
            const lessonData: Omit<Lesson, 'id' | 'downloadable'> = {
                title,
                type,
                ...(type === 'text' ? { content } : { contentUrl })
            };

            if(lesson) {
                await updateLesson(course.id, moduleId, lesson.id, lessonData, user.id);
                toast({ title: 'Sukses', description: 'Pelajaran berhasil diperbarui.'});
            } else {
                await addLesson(course.id, moduleId, lessonData, user.id);
                toast({ title: 'Sukses', description: 'Pelajaran berhasil ditambahkan.'});
            }
            onFinished();
        } catch(e) {
            const errorMessage = e instanceof Error ? e.message : 'Kesalahan tidak diketahui.';
            toast({ title: 'Gagal', description: errorMessage, variant: 'destructive'});
        } finally {
            setIsSubmitting(false);
        }
    }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 p-1">
        <div className="space-y-2">
            <Label htmlFor="title">Judul Pelajaran</Label>
            <div className="flex items-center gap-2">
                <Input id="title" name="title" value={title} onChange={e => setTitle(e.target.value)} className="flex-grow"/>
                <Button type="button" variant="outline" size="icon" onClick={handleGenerateTitle} disabled={isGeneratingTitle || isGeneratingContent}>
                    {isGeneratingTitle ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                    <span className="sr-only">Buat Judul dengan AI</span>
                </Button>
            </div>
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="type">Tipe Pelajaran</Label>
            <Select name="type" value={type} onValueChange={(v: Lesson['type']) => setType(v)}>
                <SelectTrigger id="type">
                    <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="text">Teks</SelectItem>
                    <SelectItem value="video">Video (URL Langsung)</SelectItem>
                    <SelectItem value="youtube">Video (YouTube)</SelectItem>
                    <SelectItem value="zip">ZIP (Unduhan)</SelectItem>
                </SelectContent>
            </Select>
        </div>

        {type !== 'text' ? (
           <div className="space-y-2">
                <Label htmlFor="contentUrl">
                    {type === 'youtube' && 'URL Video YouTube'}
                    {type === 'video' && 'URL Video Langsung'}
                    {type === 'zip' && 'URL File ZIP'}
                </Label>
                <Input 
                    id="contentUrl" 
                    name="contentUrl" 
                    value={contentUrl} 
                    onChange={e => setContentUrl(e.target.value)} 
                    placeholder={
                        type === 'youtube' ? "https://www.youtube.com/watch?v=..." 
                        : "https://... (URL publik ke file Anda)"
                    }
                />
                {errors.contentUrl && <p className="text-sm text-destructive">{errors.contentUrl}</p>}
                <p className="text-xs text-muted-foreground">
                    Gunakan penyedia hosting yang terpercaya dan pastikan file Anda telah dipindai dari malware sebelum diunggah.
                </p>
            </div>
        ) : (
           <div className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="content">Konten Pelajaran</Label>
                <p className="text-sm text-muted-foreground">
                    Tulis manual atau gunakan AI untuk membuat draf tutorial lengkap dengan gambar dan format yang rapi.
                </p>
            </div>
             <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGenerateContent}
                disabled={isGeneratingContent || !title || isGeneratingTitle}
            >
                {isGeneratingContent ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Buat Draf Tutorial dengan AI
            </Button>
            <div className="rounded-md border bg-transparent">
              <div className="flex items-center gap-1 border-b p-1">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFormat('b')} title="Tebal">
                  <Bold className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFormat('i')} title="Miring">
                  <Italic className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFormat('ul')} title="Daftar">
                  <List className="h-4 w-4" />
                </Button>
                <div className="mx-1 h-6 border-l" />
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFormat('h1')} title="Judul 1">
                  <Heading1 className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFormat('h2')} title="Judul 2">
                  <Heading2 className="h-4 w-4" />
                </Button>
              </div>
              <Textarea 
                ref={contentRef}
                id="content" 
                name="content" 
                value={content} 
                onChange={e => setContent(e.target.value)} 
                rows={15} 
                placeholder="Konten pelajaran akan muncul di sini setelah dibuat oleh AI, atau Anda bisa mengetiknya manual." 
                className="w-full resize-y rounded-t-none border-0 bg-transparent px-3 py-2 focus-visible:ring-0"
              />
            </div>
          </div>
        )}
      </div>
      <DialogFooter className="mt-4">
        <DialogClose asChild><Button type="button" variant="ghost">Batal</Button></DialogClose>
        <Button type="submit" disabled={isGeneratingContent || isGeneratingTitle || isSubmitting}>{isSubmitting ? 'Menyimpan...' : (lesson ? 'Simpan Perubahan' : 'Tambah Pelajaran')}</Button>
      </DialogFooter>
    </form>
  );
}

// --- Main Curriculum Manager ---
export function CurriculumManager({ course, onUpdate }: { course: Course; onUpdate: () => void; }) {
  const { user, loading: userLoading } = useAuth();
  const [optimisticModules, setOptimisticModules] = useOptimistic(course.modules, 
    (state, {action, moduleId, lessonId}: {action: string, moduleId?: string, lessonId?: string}) => {
        switch(action) {
            case 'delete_module':
                return state.filter(m => m.id !== moduleId);
            case 'delete_lesson':
                return state.map(m => m.id === moduleId ? {...m, lessons: m.lessons.filter(l => l.id !== lessonId)} : m);
            default:
                return state;
        }
    }
  );

  const [isModuleDialogOpen, setModuleDialogOpen] = useState(false);
  const [isLessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | undefined>(undefined);
  const [editingLesson, setEditingLesson] = useState<{ lesson: Lesson, moduleId: string } | undefined>(undefined);
  const [addingLessonToModule, setAddingLessonToModule] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  
  if (userLoading) return <Loader2 className="animate-spin" />;
  if (!user) return <p>Silakan masuk.</p>;
  
  const canEdit = user.role === 'admin' || user.id === course.authorId;
  const isLocked = course.status === 'pending_review' && user.role !== 'admin';

  const handleFinished = () => {
    setModuleDialogOpen(false);
    setLessonDialogOpen(false);
    onUpdate();
  }

  const openModuleDialog = (module?: Module) => {
    if (isLocked) return;
    setEditingModule(module);
    setModuleDialogOpen(true);
  };

  const openLessonDialog = (lesson: Lesson, moduleId: string) => {
    if (isLocked) return;
    setEditingLesson({ lesson, moduleId });
    setLessonDialogOpen(true);
  };
  
  const openNewLessonDialog = (moduleId: string) => {
    if (isLocked) return;
    setEditingLesson(undefined);
    setAddingLessonToModule(moduleId);
    setLessonDialogOpen(true);
  };

  const handleDeleteModule = async (moduleId: string) => {
    setOptimisticModules({action: 'delete_module', moduleId});
    try {
        await deleteModule(course.id, moduleId, user.id);
        toast({ title: "Sukses", description: "Modul berhasil dihapus." });
        onUpdate();
    } catch(e) {
        const errorMessage = e instanceof Error ? e.message : 'Kesalahan tidak diketahui.';
        toast({ title: "Gagal", description: errorMessage, variant: "destructive" });
        onUpdate();
    }
  };

  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
    setOptimisticModules({action: 'delete_lesson', moduleId, lessonId});
     try {
        await deleteLesson(course.id, moduleId, lessonId, user.id);
        toast({ title: "Sukses", description: "Pelajaran berhasil dihapus." });
        onUpdate();
    } catch(e) {
        const errorMessage = e instanceof Error ? e.message : 'Kesalahan tidak diketahui.';
        toast({ title: "Gagal", description: errorMessage, variant: "destructive" });
        onUpdate();
    }
  };

  const getLessonIcon = (type: Lesson['type']) => {
    switch (type) {
        case 'video': return <Film className="h-4 w-4 text-muted-foreground" />;
        case 'youtube': return <Youtube className="h-4 w-4 text-red-500" />;
        case 'text': return <FileText className="h-4 w-4 text-muted-foreground" />;
        case 'zip': return <Package className="h-4 w-4 text-muted-foreground" />;
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Kurikulum Kursus</CardTitle>
          <CardDescription>Susun modul dan pelajaran untuk kursus ini.</CardDescription>
        </div>
        <Button onClick={() => openModuleDialog()} disabled={isLocked || !canEdit}>
          <PlusCircle className="mr-2" />
          Tambah Modul
        </Button>
      </CardHeader>
      <CardContent>
        {optimisticModules.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Belum ada modul. Mulai dengan menambahkan modul pertama Anda.
          </div>
        ) : (
          <Accordion type="multiple" className="w-full" defaultValue={optimisticModules.map(m => m.id)}>
            {optimisticModules.map((module) => (
              <AccordionItem value={module.id} key={module.id} className="border rounded-md mb-2 px-4">
                <AccordionTrigger className="hover:no-underline font-semibold text-base py-4">
                    <div className="flex-1 text-left">{module.title}</div>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="border-t -mx-4 px-4 pt-4">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold">Pelajaran</h4>
                            {canEdit && (
                                <div>
                                    <Button variant="outline" size="sm" onClick={() => openModuleDialog(module)} className="mr-2" disabled={isLocked}>
                                        <Pencil className="h-3 w-3 mr-1" /> Ubah
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="sm" disabled={isLocked}><Trash2 className="h-3 w-3 mr-1" /> Hapus Modul</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>Hapus Modul?</AlertDialogTitle><AlertDialogDescription>Ini akan menghapus modul dan semua pelajaran di dalamnya.</AlertDialogDescription></AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteModule(module.id)}>Hapus</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            )}
                        </div>

                        {module.lessons.length > 0 ? (
                        <ul className="space-y-2">
                            {module.lessons.map(lesson => (
                                <li key={lesson.id} className="flex items-center justify-between p-2 rounded-md border bg-muted/20">
                                    <div className="flex items-center gap-2">
                                        {getLessonIcon(lesson.type)}
                                        <span>{lesson.title}</span>
                                    </div>
                                    {canEdit && (
                                        <div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openLessonDialog(lesson, module.id)} disabled={isLocked}><Pencil className="h-4 w-4" /></Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" disabled={isLocked}><Trash2 className="h-4 w-4" /></Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader><AlertDialogTitle>Hapus Pelajaran?</AlertDialogTitle><AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription></AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteLesson(module.id, lesson.id)}>Hapus</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">Modul ini belum memiliki pelajaran.</p>
                        )}
                        {canEdit && (
                            <Button variant="secondary" size="sm" className="mt-4 w-full" onClick={() => openNewLessonDialog(module.id)} disabled={isLocked}>
                                <PlusCircle className="h-4 w-4 mr-2" /> Tambah Pelajaran
                            </Button>
                        )}
                    </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>

      {/* Module Dialog */}
      <Dialog open={isModuleDialogOpen} onOpenChange={setModuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingModule ? 'Ubah Modul' : 'Tambah Modul Baru'}</DialogTitle>
            <DialogDescription>Isi detail modul di bawah ini.</DialogDescription>
          </DialogHeader>
          <ModuleForm course={course} module={editingModule} onFinished={handleFinished} />
        </DialogContent>
      </Dialog>
      
      {/* Lesson Dialog */}
      <Dialog open={isLessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingLesson ? 'Ubah Pelajaran' : 'Tambah Pelajaran Baru'}</DialogTitle>
          </DialogHeader>
          <LessonForm 
            course={course} 
            moduleId={editingLesson?.moduleId ?? addingLessonToModule!}
            lesson={editingLesson?.lesson}
            onFinished={handleFinished}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
