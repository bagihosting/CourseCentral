'use client';

import { useActionState, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { createCourse, updateCourse } from '@/actions/courses';
import type { Course } from '@/types';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Loader2, Wand2 } from 'lucide-react';
import { generateThumbnailAction } from '@/actions/ai';

interface CourseFormProps {
  course?: Course;
}

export function CourseForm({ course }: CourseFormProps) {
  const action = course ? updateCourse.bind(null, course.id) : createCourse;
  const [state, formAction] = useActionState(action, { message: '', errors: {} });
  const { toast } = useToast();

  const [title, setTitle] = useState(course?.title || '');
  const [imageUrl, setImageUrl] = useState(course?.imageUrl || '');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (state.message && state.errors) {
      toast({
        title: 'Gagal',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  const handleGenerateThumbnail = async () => {
    setIsGenerating(true);
    const result = await generateThumbnailAction(title);
    setIsGenerating(false);

    if ('imageUrl' in result && result.imageUrl) {
      setImageUrl(result.imageUrl);
      toast({
        title: 'Sukses',
        description: 'Thumbnail berhasil dibuat dengan AI.',
      });
    } else {
      const errorMessage = 'error' in result ? result.error : 'Terjadi kesalahan tidak diketahui.';
      toast({
        title: 'Gagal',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };


  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Judul Kursus</Label>
        <div className="flex items-center gap-2">
          <Input
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-describedby="title-error"
            className="flex-grow"
            placeholder="Contoh: Belajar Animasi 3D dengan Blender"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleGenerateThumbnail}
            disabled={isGenerating || !title}
            className="shrink-0"
          >
            {isGenerating ? <Loader2 className="animate-spin" /> : <Wand2 />}
            <span className="ml-2 hidden sm:inline">Buat AI</span>
          </Button>
        </div>
        {state.errors?.title && <p id="title-error" className="text-sm text-destructive">{state.errors.title}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea id="description" name="description" defaultValue={course?.description} aria-describedby="description-error" />
        {state.errors?.description && <p id="description-error" className="text-sm text-destructive">{state.errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="instructor">Nama Instruktur</Label>
          <Input id="instructor" name="instructor" defaultValue={course?.instructor} aria-describedby="instructor-error" />
          {state.errors?.instructor && <p id="instructor-error" className="text-sm text-destructive">{state.errors.instructor}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Harga (Rp)</Label>
          <Input id="price" name="price" type="number" defaultValue={course?.price} aria-describedby="price-error" />
          {state.errors?.price && <p id="price-error" className="text-sm text-destructive">{state.errors.price}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Gambar Thumbnail</Label>
        {imageUrl ? (
          <div className="relative w-full sm:w-60 aspect-video rounded-md overflow-hidden bg-muted border">
            <Image src={imageUrl} alt="Pratinjau Thumbnail" fill className="object-cover" />
          </div>
        ) : (
          <div className="w-full sm:w-60 aspect-video rounded-md bg-muted/50 border-2 border-dashed flex items-center justify-center">
            <p className="text-sm text-muted-foreground text-center p-2">
              Isi judul dan klik "Buat AI" untuk membuat thumbnail.
            </p>
          </div>
        )}
        <input type="hidden" name="imageUrl" value={imageUrl} />
        {state.errors?.imageUrl && <p id="imageUrl-error" className="text-sm text-destructive">{state.errors.imageUrl}</p>}
      </div>

      <Button type="submit">{course ? 'Simpan Perubahan' : 'Buat Kursus'}</Button>
    </form>
  );
}
