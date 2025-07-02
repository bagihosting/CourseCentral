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

interface CourseFormProps {
  course?: Course;
}

export function CourseForm({ course }: CourseFormProps) {
  const action = course ? updateCourse.bind(null, course.id) : createCourse;
  const [state, formAction] = useActionState(action, { message: '', errors: {} });
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState(course?.imageUrl || '');

  useEffect(() => {
    if (state.message && state.errors) {
      toast({
        title: 'Gagal',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Judul Kursus</Label>
        <Input id="title" name="title" defaultValue={course?.title} aria-describedby="title-error" />
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
        <Label htmlFor="imageUrl">URL Gambar Thumbnail</Label>
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <Input 
            id="imageUrl" 
            name="imageUrl" 
            value={imageUrl} 
            onChange={(e) => setImageUrl(e.target.value)} 
            aria-describedby="imageUrl-error" 
            placeholder="https://placehold.co/600x400.png" 
            className="flex-grow"
          />
          {imageUrl && (
            <div className="relative w-full sm:w-40 aspect-video rounded-md overflow-hidden bg-muted">
                <Image src={imageUrl} alt="Pratinjau Thumbnail" fill className="object-cover" data-ai-hint="course topic" />
            </div>
          )}
        </div>
        {state.errors?.imageUrl && <p id="imageUrl-error" className="text-sm text-destructive">{state.errors.imageUrl}</p>}
      </div>
      <Button type="submit">{course ? 'Simpan Perubahan' : 'Buat Kursus'}</Button>
    </form>
  );
}
