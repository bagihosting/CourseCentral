'use server';

import { z } from 'zod';
import { addCourse, updateCourse, deleteCourse, getCourseById } from '@/lib/data';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const courseSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, 'Judul minimal 3 karakter'),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter'),
  instructor: z.string().min(3, 'Nama instruktur minimal 3 karakter'),
  duration: z.string().min(1, 'Durasi harus diisi'),
  imageUrl: z.string().url('URL gambar tidak valid'),
  category: z.string().min(3, 'Kategori minimal 3 karakter'),
});

export type FormState = {
  message: string;
  errors?: {
    [key: string]: string[] | undefined;
  };
};

export async function saveCourse(prevState: FormState, formData: FormData) {
  const validatedFields = courseSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      message: 'Gagal memvalidasi data kursus.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, ...courseData } = validatedFields.data;

  try {
    if (id) {
      const existingCourse = await getCourseById(id);
      if (existingCourse) {
        await updateCourse({ ...existingCourse, ...courseData });
      }
    } else {
      await addCourse(courseData);
    }
  } catch (error) {
    return { message: 'Terjadi kesalahan pada server, silakan coba lagi.' };
  }
  
  revalidatePath('/dashboard/courses');
  redirect('/dashboard/courses');
}


export async function deleteCourseAction(id: string) {
    try {
        await deleteCourse(id);
        revalidatePath('/dashboard/courses');
        return { success: true, message: "Kursus berhasil dihapus." };
    } catch (error) {
        return { success: false, message: "Gagal menghapus kursus." };
    }
}
