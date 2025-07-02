'use server';

import { z } from 'zod';
import { createCourse as dbCreateCourse, updateCourse as dbUpdateCourse, deleteCourse as dbDeleteCourse } from '@/lib/data';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const CourseSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter'),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter'),
  instructor: z.string().min(3, 'Nama instruktur minimal 3 karakter'),
  price: z.coerce.number().min(0, 'Harga tidak boleh negatif'),
  imageUrl: z.string().min(1, 'Gambar thumbnail harus dibuat.'),
});

export type FormState = {
  message: string;
  errors?: {
    [key: string]: string[] | undefined;
  };
};

export async function createCourse(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = CourseSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      message: 'Gagal membuat kursus. Harap periksa kembali isian Anda.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  let newCourse;
  try {
    newCourse = await dbCreateCourse(validatedFields.data);
  } catch (error) {
    return {
      message: 'Kesalahan database: Gagal membuat kursus.',
    };
  }

  revalidatePath('/dashboard/courses');
  revalidatePath('/dashboard/admin/courses');
  redirect(`/dashboard/courses/${newCourse.id}/edit`);
}

export async function updateCourse(id: string, prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = CourseSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      message: 'Gagal memperbarui kursus. Harap periksa kembali isian Anda.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await dbUpdateCourse(id, validatedFields.data);
  } catch (error) {
    return {
      message: 'Kesalahan database: Gagal memperbarui kursus.',
    };
  }

  revalidatePath('/dashboard/courses');
  revalidatePath('/dashboard/admin/courses');
  revalidatePath(`/dashboard/courses/${id}/edit`);
  redirect('/dashboard/admin/courses');
}


export async function deleteCourse(id: string) {
  try {
    await dbDeleteCourse(id);
    revalidatePath('/dashboard/courses');
    revalidatePath('/dashboard/admin/courses');
  } catch (error) {
    throw new Error('Gagal menghapus kursus.');
  }
}
