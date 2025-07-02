'use server';

import { generateThumbnail as generateThumbnailFlow } from '@/ai/flows/generate-thumbnail';
import { generateDescription as generateDescriptionFlow } from '@/ai/flows/generate-description';
import { suggestCourses as suggestCoursesFlow, CourseSuggestionInput, CourseSuggestionOutput } from '@/ai/flows/suggest-courses';

export async function generateThumbnailAction(
  title: string
): Promise<{ imageUrl: string } | { error: string }> {
  if (!title) {
    return { error: 'Judul kursus tidak boleh kosong.' };
  }

  try {
    const result = await generateThumbnailFlow({ title });
    return { imageUrl: result.imageUrl };
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return { error: 'Gagal membuat thumbnail. Silakan coba lagi.' };
  }
}

export async function generateDescriptionAction(
  title: string
): Promise<{ description: string } | { error: string }> {
  if (!title) {
    return { error: 'Judul kursus tidak boleh kosong.' };
  }

  try {
    const result = await generateDescriptionFlow({ title });
    return { description: result.description };
  } catch (error) {
    console.error('Error generating description:', error);
    return { error: 'Gagal membuat deskripsi. Silakan coba lagi.' };
  }
}


export async function suggestCoursesAction(
  input: CourseSuggestionInput
): Promise<CourseSuggestionOutput> {
  try {
    return await suggestCoursesFlow(input);
  } catch (error) {
    console.error('Error suggesting courses:', error);
    return { suggestions: [] };
  }
}
