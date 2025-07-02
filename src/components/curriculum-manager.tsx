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
import { Film, FileText, Package, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import { useState, useEffect, useOptimistic } from 'react';
import { useFormState } from 'react-dom';
import { useToast } from '@/hooks/use-toast';
import { addModule, updateModule, deleteModule, addLesson, updateLesson, deleteLesson } from '@/actions/curriculum';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

// --- Form State & Action Response ---
type ActionResponse = {
  message: string;
  errors?: { [key: string]: string[] | undefined };
  resetKey?: string;
};

// --- Module Form ---
function ModuleForm({ courseId, module, onFinished }: { courseId: string, module?: Module, onFinished: () => void }) {
  const action = module ? updateModule.bind(null, courseId, module.id) : addModule.bind(null, courseId);
  const [state, formAction] = useFormState<ActionResponse, FormData>(action, { message: '' });
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      toast({ title: state.errors ? "Gagal" : "Sukses", description: state.message, variant: state.errors ? "destructive" : "default" });
      if (!state.errors) onFinished();
    }
  }, [state, toast, onFinished]);

  return (
    <form action={formAction} key={state.resetKey}>
      <div className="space-y-4 p-1">
        <div className="space-y-2">
          <Label htmlFor="title">Judul Modul</Label>
          <Input id="title" name="title" defaultValue={module?.title} />
          {state.errors?.title && <p className="text-sm text-destructive">{state.errors.title}</p>}
        </div>
      </div>
      <DialogFooter className="mt-4">
        <DialogClose asChild><Button variant="ghost">Batal</Button></DialogClose>
        <Button type="submit">{module ? 'Simpan Perubahan' : 'Tambah Modul'}</Button>
      </DialogFooter>
    </form>
  );
}

// --- Lesson Form ---
function LessonForm({ courseId, moduleId, lesson, onFinished }: { courseId: string, moduleId: string, lesson?: Lesson, onFinished: () => void }) {
    const action = lesson ? updateLesson.bind(null, courseId, moduleId, lesson.id) : addLesson.bind(null, courseId, moduleId);
    const [state, formAction] = useFormState<ActionResponse, FormData>(action, { message: '' });
    const { toast } = useToast();
  
    useEffect(() => {
      if (state.message) {
        toast({ title: state.errors ? "Gagal" : "Sukses", description: state.message, variant: state.errors ? "destructive" : "default" });
        if (!state.errors) onFinished();
      }
    }, [state, toast, onFinished]);

  return (
    <form action={formAction} key={state.resetKey}>
      <div className="space-y-4 p-1">
        <div className="space-y-2">
          <Label htmlFor="title">Judul Pelajaran</Label>
          <Input id="title" name="title" defaultValue={lesson?.title} />
          {state.errors?.title && <p className="text-sm text-destructive">{state.errors.title}</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="type">Tipe Pelajaran</Label>
            <Select name="type" defaultValue={lesson?.type ?? "video"}>
                <SelectTrigger id="type">
                    <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="text">Teks</SelectItem>
                    <SelectItem value="zip">ZIP (Unduhan)</SelectItem>
                </SelectContent>
            </Select>
            {state.errors?.type && <p className="text-sm text-destructive">{state.errors.type}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="contentUrl">URL Konten (untuk Video/ZIP)</Label>
          <Input id="contentUrl" name="contentUrl" defaultValue={lesson?.contentUrl} placeholder="https://..." />
          {state.errors?.contentUrl && <p className="text-sm text-destructive">{state.errors.contentUrl}</p>}
        </div>
      </div>
      <DialogFooter className="mt-4">
        <DialogClose asChild><Button variant="ghost">Batal</Button></DialogClose>
        <Button type="submit">{lesson ? 'Simpan Perubahan' : 'Tambah Pelajaran'}</Button>
      </DialogFooter>
    </form>
  );
}


// --- Main Curriculum Manager ---
export function CurriculumManager({ course: initialCourse }: { course: Course }) {
  const [course, setCourse] = useState(initialCourse);
  const [optimisticModules, setOptimisticModules] = useOptimistic(course.modules, 
    (state, {action, module, lesson, moduleId, lessonId}: {action: string, module?: Module, lesson?: Lesson, moduleId?: string, lessonId?: string}) => {
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

  const handleDeleteModule = async (moduleId: string) => {
    setOptimisticModules({action: 'delete_module', moduleId});
    const result = await deleteModule(course.id, moduleId);
    if (result?.error) {
        toast({ title: "Gagal", description: result.error, variant: "destructive" });
    } else {
        toast({ title: "Sukses", description: "Modul berhasil dihapus." });
    }
  };

  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
    setOptimisticModules({action: 'delete_lesson', moduleId, lessonId});
    const result = await deleteLesson(course.id, moduleId, lessonId);
    if (result?.error) {
        toast({ title: "Gagal", description: result.error, variant: "destructive" });
    } else {
        toast({ title: "Sukses", description: "Pelajaran berhasil dihapus." });
    }
  };

  const getLessonIcon = (type: Lesson['type']) => {
    switch (type) {
        case 'video': return <Film className="h-4 w-4 text-muted-foreground" />;
        case 'text': return <FileText className="h-4 w-4 text-muted-foreground" />;
        case 'zip': return <Package className="h-4 w-4 text-muted-foreground" />;
    }
  }

  useEffect(() => setCourse(initialCourse), [initialCourse]);
  useEffect(() => {
    setOptimisticModules({ action: 'noop' });
  }, [course.modules, setOptimisticModules]);


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
          <Accordion type="multiple" className="w-full">
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
          <ModuleForm courseId={course.id} module={editingModule} onFinished={() => setModuleDialogOpen(false)} />
        </DialogContent>
      </Dialog>
      
      {/* Lesson Dialog */}
      <Dialog open={isLessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLesson ? 'Ubah Pelajaran' : 'Tambah Pelajaran Baru'}</DialogTitle>
          </DialogHeader>
          <LessonForm 
            courseId={course.id} 
            moduleId={editingLesson?.moduleId ?? addingLessonToModule!}
            lesson={editingLesson?.lesson}
            onFinished={() => setLessonDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
