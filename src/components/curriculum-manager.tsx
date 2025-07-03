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
import { Film, FileText, Package, Pencil, PlusCircle, Trash2, Youtube, Loader2, UploadCloud } from 'lucide-react';
import { useState, useOptimistic, FormEvent, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { addModule, updateModule, deleteModule, addLesson, updateLesson, deleteLesson } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type FormErrors = {
    title?: string;
    type?: string;
    contentUrl?: string;
}

// --- Module Form ---
function ModuleForm({ courseId, module, onFinished }: { courseId: string, module?: Module, onFinished: () => void }) {
  const [title, setTitle] = useState(module?.title || '');
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (title.length < 3) {
      setError('Judul modul minimal 3 karakter.');
      return;
    }
    setError('');

    try {
      if (module) {
        updateModule(courseId, module.id, { title });
        toast({ title: 'Sukses', description: 'Modul berhasil diperbarui.'});
      } else {
        addModule(courseId, { title });
        toast({ title: 'Sukses', description: 'Modul berhasil ditambahkan.'});
      }
      onFinished();
    } catch(e) {
      const errorMessage = e instanceof Error ? e.message : 'Kesalahan tidak diketahui.';
      toast({ title: 'Gagal', description: errorMessage, variant: 'destructive'});
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 p-1">
        <div className="space-y-2">
          <Label htmlFor="title">Judul Modul</Label>
          <Input id="title" name="title" value={title} onChange={e => setTitle(e.target.value)} />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </div>
      <DialogFooter className="mt-4">
        <DialogClose asChild><Button type="button" variant="ghost">Batal</Button></DialogClose>
        <Button type="submit">{module ? 'Simpan Perubahan' : 'Tambah Modul'}</Button>
      </DialogFooter>
    </form>
  );
}

// --- Lesson Form ---
function LessonForm({ courseId, moduleId, lesson, onFinished }: { courseId: string, moduleId: string, lesson?: Lesson, onFinished: () => void }) {
    const [title, setTitle] = useState(lesson?.title || '');
    const [type, setType] = useState<Lesson['type']>(lesson?.type || 'text');
    const [contentUrl, setContentUrl] = useState(lesson?.contentUrl || '');
    const [content, setContent] = useState(lesson?.content || '');
    const [errors, setErrors] = useState<FormErrors>({});
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validate = () => {
        const newErrors: FormErrors = {};
        if(title.length < 3) newErrors.title = 'Judul pelajaran minimal 3 karakter.';
        if ((type === 'video' || type === 'youtube' || type === 'zip') && !contentUrl) {
            newErrors.contentUrl = 'URL konten atau hasil unggahan tidak boleh kosong.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        
        const allowedTypes = ['video/', 'application/zip', 'application/x-zip-compressed'];
        if (!allowedTypes.some(type => file.type.startsWith(type))) {
            toast({ title: 'Gagal', description: 'Hanya file video atau ZIP yang diizinkan.', variant: 'destructive' });
            setIsUploading(false);
            return;
        }

        const maxSizeInBytes = 100 * 1024 * 1024; 
        if (file.size > maxSizeInBytes) {
            toast({ title: 'Gagal', description: `Ukuran file tidak boleh melebihi ${maxSizeInBytes / 1024 / 1024}MB.`, variant: 'destructive' });
            setIsUploading(false);
            return;
        }

        try {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                setContentUrl(dataUrl);
                if (file.type.startsWith('video/')) {
                    setType('video');
                } else {
                    setType('zip');
                }
                setIsUploading(false);
                toast({ title: 'Sukses', description: 'File berhasil dibaca dan siap disimpan.' });
            };
            reader.onerror = () => {
                setIsUploading(false);
                toast({ title: 'Gagal Membaca File', description: 'Terjadi kesalahan saat membaca file.', variant: 'destructive' });
            };
            reader.readAsDataURL(file);
        } catch (error) {
            setIsUploading(false);
            const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
            toast({ title: 'Gagal', description: errorMessage, variant: 'destructive' });
        }
        
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
  
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if(!validate()) {
            toast({ title: 'Gagal', description: 'Harap periksa kembali isian Anda.', variant: 'destructive' });
            return
        };
        
        try {
            const lessonData: Omit<Lesson, 'id' | 'downloadable'> = {
                title,
                type,
                ...(type === 'text' ? { content } : { contentUrl })
            };

            if(lesson) {
                updateLesson(courseId, moduleId, lesson.id, lessonData);
                toast({ title: 'Sukses', description: 'Pelajaran berhasil diperbarui.'});
            } else {
                addLesson(courseId, moduleId, lessonData);
                toast({ title: 'Sukses', description: 'Pelajaran berhasil ditambahkan.'});
            }
            onFinished();
        } catch(e) {
            const errorMessage = e instanceof Error ? e.message : 'Kesalahan tidak diketahui.';
            toast({ title: 'Gagal', description: errorMessage, variant: 'destructive'});
        }
    }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 p-1">
        <div className="space-y-2">
          <Label htmlFor="title">Judul Pelajaran</Label>
          <Input id="title" name="title" value={title} onChange={e => setTitle(e.target.value)} />
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

        {type === 'text' ? (
          <div className="space-y-2">
            <Label htmlFor="content">Konten Teks</Label>
            <Textarea 
              id="content" 
              name="content" 
              value={content} 
              onChange={e => setContent(e.target.value)} 
              rows={10} 
              placeholder="Tulis konten pelajaran (mendukung HTML dasar)." 
            />
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="contentUrl">URL Konten</Label>
            <Input id="contentUrl" name="contentUrl" value={contentUrl} onChange={e => setContentUrl(e.target.value)} placeholder={type === 'youtube' ? "https://www.youtube.com/watch?v=..." : "https://..."} />
            {errors.contentUrl && <p className="text-sm text-destructive">{errors.contentUrl}</p>}
          </div>
        )}
        
        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Atau</span>
            </div>
        </div>

        <div className="space-y-2">
            <Label htmlFor="file-upload">Unggah File (Video/ZIP, Maks 100MB)</Label>
            <div className="flex gap-2">
                <Input id="file-upload" type="file" accept="video/*,application/zip,application/x-zip-compressed" onChange={handleFileUpload} ref={fileInputRef} disabled={isUploading} className="flex-grow" />
                {isUploading && <Button disabled variant="outline" size="icon"><Loader2 className="animate-spin" /></Button>}
            </div>
            <p className="text-xs text-muted-foreground">Mengunggah file akan otomatis mengatur tipe pelajaran dan mengisi URL-nya.</p>
        </div>


      </div>
      <DialogFooter className="mt-4">
        <DialogClose asChild><Button type="button" variant="ghost">Batal</Button></DialogClose>
        <Button type="submit" disabled={isUploading}>{isUploading ? 'Mengunggah...' : (lesson ? 'Simpan Perubahan' : 'Tambah Pelajaran')}</Button>
      </DialogFooter>
    </form>
  );
}

// --- Main Curriculum Manager ---
export function CurriculumManager({ course, onUpdate }: { course: Course; onUpdate: () => void; }) {
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

  const handleFinished = () => {
    setModuleDialogOpen(false);
    setLessonDialogOpen(false);
    onUpdate(); // Trigger parent component to re-fetch course data
  }

  const openModuleDialog = (module?: Module) => {
    setEditingModule(module);
    setModuleDialogOpen(true);
  };

  const openLessonDialog = (lesson: Lesson, moduleId: string) => {
    setEditingLesson({ lesson, moduleId });
    setLessonDialogOpen(true);
  };
  
  const openNewLessonDialog = (moduleId: string) => {
    setEditingLesson(undefined);
    setAddingLessonToModule(moduleId);
    setLessonDialogOpen(true);
  };

  const handleDeleteModule = (moduleId: string) => {
    setOptimisticModules({action: 'delete_module', moduleId});
    try {
        deleteModule(course.id, moduleId);
        toast({ title: "Sukses", description: "Modul berhasil dihapus." });
        onUpdate();
    } catch(e) {
        const errorMessage = e instanceof Error ? e.message : 'Kesalahan tidak diketahui.';
        toast({ title: "Gagal", description: errorMessage, variant: "destructive" });
        onUpdate(); // Re-fetch to revert optimistic update
    }
  };

  const handleDeleteLesson = (moduleId: string, lessonId: string) => {
    setOptimisticModules({action: 'delete_lesson', moduleId, lessonId});
     try {
        deleteLesson(course.id, moduleId, lessonId);
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
        <Button onClick={() => openModuleDialog()}>
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
                            <div>
                                <Button variant="outline" size="sm" onClick={() => openModuleDialog(module)} className="mr-2">
                                    <Pencil className="h-3 w-3 mr-1" /> Ubah
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm"><Trash2 className="h-3 w-3 mr-1" /> Hapus Modul</Button>
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
                        </div>

                        {module.lessons.length > 0 ? (
                        <ul className="space-y-2">
                            {module.lessons.map(lesson => (
                                <li key={lesson.id} className="flex items-center justify-between p-2 rounded-md border bg-muted/20">
                                    <div className="flex items-center gap-2">
                                        {getLessonIcon(lesson.type)}
                                        <span>{lesson.title}</span>
                                    </div>
                                    <div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openLessonDialog(lesson, module.id)}><Pencil className="h-4 w-4" /></Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
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
                                </li>
                            ))}
                        </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">Modul ini belum memiliki pelajaran.</p>
                        )}
                        <Button variant="secondary" size="sm" className="mt-4 w-full" onClick={() => openNewLessonDialog(module.id)}>
                            <PlusCircle className="h-4 w-4 mr-2" /> Tambah Pelajaran
                        </Button>
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
          <ModuleForm courseId={course.id} module={editingModule} onFinished={handleFinished} />
        </DialogContent>
      </Dialog>
      
      {/* Lesson Dialog */}
      <Dialog open={isLessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingLesson ? 'Ubah Pelajaran' : 'Tambah Pelajaran Baru'}</DialogTitle>
          </DialogHeader>
          <LessonForm 
            courseId={course.id} 
            moduleId={editingLesson?.moduleId ?? addingLessonToModule!}
            lesson={editingLesson?.lesson}
            onFinished={handleFinished}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
