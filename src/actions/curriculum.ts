'use server';

import { z } from 'zod';
import {
  addModule as dbAddModule,
  updateModule as dbUpdateModule,
  deleteModule as dbDeleteModule,
  addLesson as dbAddLesson,
  updateLesson as dbUpdateLesson,
  deleteLesson as dbDeleteLesson,
} from '@/lib/data';
import { revalidatePath } from 'next/cache';

// --- Schemas ---

const ModuleSchema = z.object({
  title: z.string().min(3, { message: 'Judul modul minimal 3 karakter.' }),
});

const LessonSchema = z.object({
  title: z.string().min(3, { message: 'Judul pelajaran minimal 3 karakter.' }),
  type: z.enum(['video', 'text', 'zip'], { required_error: 'Tipe pelajaran harus dipilih.' }),
  contentUrl: z.string().url({ message: 'URL konten tidak valid.' }).optional().or(z.literal('')),
});


// --- Types ---

export type ActionResponse = {
  message: string;
  errors?: {
    [key: string]: string[] | undefined;
  };
  resetKey?: string; // Used to reset form state on success
};

// --- Helper ---

function createResponse(success: boolean, message: string, errors?: any): ActionResponse {
    if (success) {
        return { message, resetKey: new Date().toISOString() };
    }
    return { message, errors: errors?.flatten().fieldErrors };
}

// --- Module Actions ---

export async function addModule(courseId: string, prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const validatedFields = ModuleSchema.safeParse({ title: formData.get('title') });
  if (!validatedFields.success) {
    return createResponse(false, 'Gagal menambah modul.', validatedFields.error);
  }
  try {
    await dbAddModule(courseId, validatedFields.data);
    revalidatePath(`/dashboard/courses/${courseId}/edit`);
    return createResponse(true, 'Modul berhasil ditambahkan.');
  } catch (error) {
    return createResponse(false, 'Kesalahan database: Gagal menambah modul.');
  }
}

export async function updateModule(courseId: string, moduleId: string, prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
    const validatedFields = ModuleSchema.safeParse({ title: formData.get('title') });
    if (!validatedFields.success) {
      return createResponse(false, 'Gagal memperbarui modul.', validatedFields.error);
    }
    try {
      await dbUpdateModule(courseId, moduleId, validatedFields.data);
      revalidatePath(`/dashboard/courses/${courseId}/edit`);
      return createResponse(true, 'Modul berhasil diperbarui.');
    } catch (error) {
      return createResponse(false, 'Kesalahan database: Gagal memperbarui modul.');
    }
}

export async function deleteModule(courseId: string, moduleId: string): Promise<{ error?: string }> {
    try {
        await dbDeleteModule(courseId, moduleId);
        revalidatePath(`/dashboard/courses/${courseId}/edit`);
        return {};
    } catch (error) {
        return { error: 'Kesalahan database: Gagal menghapus modul.' };
    }
}


// --- Lesson Actions ---

export async function addLesson(courseId: string, moduleId: string, prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
    const validatedFields = LessonSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return createResponse(false, 'Gagal menambah pelajaran.', validatedFields.error);
    }
    try {
        await dbAddLesson(courseId, moduleId, validatedFields.data);
        revalidatePath(`/dashboard/courses/${courseId}/edit`);
        return createResponse(true, 'Pelajaran berhasil ditambahkan.');
    } catch (error) {
        return createResponse(false, 'Kesalahan database: Gagal menambah pelajaran.');
    }
}

export async function updateLesson(courseId: string, moduleId: string, lessonId: string, prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
    const validatedFields = LessonSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return createResponse(false, 'Gagal memperbarui pelajaran.', validatedFields.error);
    }
    try {
        await dbUpdateLesson(courseId, moduleId, lessonId, validatedFields.data);
        revalidatePath(`/dashboard/courses/${courseId}/edit`);
        return createResponse(true, 'Pelajaran berhasil diperbarui.');
    } catch (error) {
        return createResponse(false, 'Kesalahan database: Gagal memperbarui pelajaran.');
    }
}

export async function deleteLesson(courseId: string, moduleId: string, lessonId: string): Promise<{ error?: string }> {
    try {
        await dbDeleteLesson(courseId, moduleId, lessonId);
        revalidatePath(`/dashboard/courses/${courseId}/edit`);
        return {};
    } catch (error) {
        return { error: 'Kesalahan database: Gagal menghapus pelajaran.' };
    }
}
