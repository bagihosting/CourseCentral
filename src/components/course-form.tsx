'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { saveCourse, type FormState } from '@/actions/courses';
import type { Course } from '@/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

type CourseFormProps = {
  course?: Course | null;
};

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah Kursus'}
    </Button>
  );
}

export function CourseForm({ course }: CourseFormProps) {
  const initialState: FormState = { message: '' };
  const [state, dispatch] = useFormState(saveCourse, initialState);
  const router = useRouter();
  const isEditing = !!course;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Ubah Kursus' : 'Tambah Kursus Baru'}</CardTitle>
        <CardDescription>
          {isEditing
            ? 'Perbarui detail kursus di bawah ini.'
            : 'Isi formulir untuk menambahkan kursus baru.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={dispatch} className="grid gap-6">
          {course?.id && <input type="hidden" name="id" value={course.id} />}
          <div className="grid gap-2">
            <Label htmlFor="title">Judul Kursus</Label>
            <Input id="title" name="title" defaultValue={course?.title} required />
            {state.errors?.title && <p className="text-sm text-destructive">{state.errors.title.join(', ')}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea id="description" name="description" defaultValue={course?.description} required rows={4} />
            {state.errors?.description && <p className="text-sm text-destructive">{state.errors.description.join(', ')}</p>}
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="instructor">Instruktur</Label>
              <Input id="instructor" name="instructor" defaultValue={course?.instructor} required />
              {state.errors?.instructor && <p className="text-sm text-destructive">{state.errors.instructor.join(', ')}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration">Durasi</Label>
              <Input id="duration" name="duration" defaultValue={course?.duration} required />
              {state.errors?.duration && <p className="text-sm text-destructive">{state.errors.duration.join(', ')}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="category">Kategori</Label>
              <Input id="category" name="category" defaultValue={course?.category} required />
              {state.errors?.category && <p className="text-sm text-destructive">{state.errors.category.join(', ')}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="imageUrl">URL Gambar</Label>
              <Input id="imageUrl" name="imageUrl" defaultValue={course?.imageUrl} type="url" required />
              {state.errors?.imageUrl && <p className="text-sm text-destructive">{state.errors.imageUrl.join(', ')}</p>}
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
              Batal
            </Button>
            <SubmitButton isEditing={isEditing} />
          </div>
          {state.message && !state.errors && <p className="text-sm text-destructive">{state.message}</p>}
        </form>
      </CardContent>
    </Card>
  );
}
