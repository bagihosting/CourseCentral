'use server';

import { generateThumbnail as generateThumbnailFlow } from '@/ai/flows/generate-thumbnail';
import { generateDescription as generateDescriptionFlow } from '@/ai/flows/generate-description';
import { suggestCourses as suggestCoursesFlow, CourseSuggestionInput, CourseSuggestionOutput } from '@/ai/flows/suggest-courses';
import { generateBloggerTemplate as generateBloggerTemplateFlow, GenerateBloggerTemplateInput, GenerateBloggerTemplateOutput } from '@/ai/flows/generate-blogger-template';


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

export async function generateBloggerTemplateAction(
  input: GenerateBloggerTemplateInput
): Promise<GenerateBloggerTemplateOutput | { error: string }> {
  if (!input.niche || !input.style || !input.creatorName) {
    return { error: 'Niche, gaya visual, dan nama pembuat tidak boleh kosong.' };
  }

  try {
    const result = await generateBloggerTemplateFlow(input);
    return { templateCode: result.templateCode };
  } catch (error) {
    console.error('Error generating Blogger template:', error);
    return { error: 'Gagal membuat template. Silakan coba lagi.' };
  }
}
