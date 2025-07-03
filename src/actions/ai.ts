'use server';

import { generateThumbnail as generateThumbnailFlow } from '@/ai/flows/generate-thumbnail';
import { generateDescription as generateDescriptionFlow } from '@/ai/flows/generate-description';
import { suggestCourses as suggestCoursesFlow, CourseSuggestionInput, CourseSuggestionOutput } from '@/ai/flows/suggest-courses';
import { generateBloggerTemplate as generateBloggerTemplateFlow, GenerateBloggerTemplateInput, GenerateBloggerTemplateOutput } from '@/ai/flows/generate-blogger-template';
import { editBloggerTemplate as editBloggerTemplateFlow, EditBloggerTemplateInput, EditBloggerTemplateOutput } from '@/ai/flows/edit-blogger-template';
import { generateSkripsiChapter as generateSkripsiChapterFlow, GenerateSkripsiChapterInput, GenerateSkripsiChapterOutput } from '@/ai/flows/generate-skripsi-chapter';
import { generateWordpressPluginBoilerplate as generateWordpressPluginBoilerplateFlow, GenerateWordpressPluginBoilerplateInput, GenerateWordpressPluginBoilerplateOutput } from '@/ai/flows/generate-wordpress-plugin-boilerplate';
import { generateGoogleAds as generateGoogleAdsFlow, GenerateGoogleAdsInput, GenerateGoogleAdsOutput } from '@/ai/flows/generate-google-ads';
import { generateDigitalInvitation as generateDigitalInvitationFlow, GenerateDigitalInvitationInput, GenerateDigitalInvitationOutput } from '@/ai/flows/generate-digital-invitation';
import { generateUmkmProfile as generateUmkmProfileFlow, GenerateUmkmProfileInput, GenerateUmkmProfileOutput } from '@/ai/flows/generate-umkm-profile';
import { generateSpssSyntax as generateSpssSyntaxFlow, GenerateSpssSyntaxInput, GenerateSpssSyntaxOutput } from '@/ai/flows/generate-spss-syntax';
import { generateImage as generateImageFlow, GenerateImageInput, GenerateImageOutput } from '@/ai/flows/generate-image';
import { generateAppPrototype as generateAppPrototypeFlow, GenerateAppPrototypeInput, GenerateAppPrototypeOutput } from '@/ai/flows/generate-app-prototype';
import { generateSoapFormula as generateSoapFormulaFlow, GenerateSoapFormulaInput, GenerateSoapFormulaOutput } from '@/ai/flows/generate-soap-formula';


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

export async function editBloggerTemplateAction(
  input: EditBloggerTemplateInput
): Promise<EditBloggerTemplateOutput | { error: string }> {
  if (!input.templateCode || !input.editRequest) {
    return { error: 'Kode templat dan permintaan edit tidak boleh kosong.' };
  }

  try {
    const result = await editBloggerTemplateFlow(input);
    return { editedTemplateCode: result.editedTemplateCode };
  } catch (error) {
    console.error('Error editing Blogger template:', error);
    return { error: 'Gagal mengedit templat. Silakan coba lagi.' };
  }
}

export async function generateSkripsiChapterAction(
  input: GenerateSkripsiChapterInput
): Promise<GenerateSkripsiChapterOutput | { error: string }> {
  if (!input.topic || !input.chapterTitle) {
    return { error: 'Topik skripsi dan judul bab tidak boleh kosong.' };
  }

  try {
    const result = await generateSkripsiChapterFlow(input);
    return { content: result.content };
  } catch (error) {
    console.error('Error generating skripsi chapter:', error);
    return { error: 'Gagal membuat draf bab skripsi. Silakan coba lagi.' };
  }
}

export async function generateWordpressPluginBoilerplateAction(
  input: GenerateWordpressPluginBoilerplateInput
): Promise<GenerateWordpressPluginBoilerplateOutput | { error: string }> {
    if (!input.pluginName || !input.description || !input.authorName) {
        return { error: 'Nama plugin, deskripsi, dan nama pembuat tidak boleh kosong.' };
    }

    try {
        const result = await generateWordpressPluginBoilerplateFlow(input);
        return { readmeTxtContent: result.readmeTxtContent, phpFileContent: result.phpFileContent };
    } catch (error) {
        console.error('Error generating WordPress plugin boilerplate:', error);
        return { error: 'Gagal membuat kerangka plugin. Silakan coba lagi.' };
    }
}

export async function generateGoogleAdsAction(
  input: GenerateGoogleAdsInput
): Promise<GenerateGoogleAdsOutput | { error: string }> {
  if (!input.productName || !input.targetAudience || !input.keyFeatures) {
    return { error: 'Semua kolom wajib diisi.' };
  }

  try {
    const result = await generateGoogleAdsFlow(input);
    return result;
  } catch (error) {
    console.error('Error generating Google Ads copy:', error);
    return { error: 'Gagal membuat teks iklan. Silakan coba lagi.' };
  }
}

export async function generateDigitalInvitationAction(
  input: GenerateDigitalInvitationInput
): Promise<GenerateDigitalInvitationOutput | { error: string }> {
  if (!input.eventType || !input.personOneName || !input.eventDate || !input.eventVenue) {
    return { error: 'Jenis acara, nama, tanggal, dan lokasi tidak boleh kosong.' };
  }

  try {
    const result = await generateDigitalInvitationFlow(input);
    return result;
  } catch (error) {
    console.error('Error generating digital invitation:', error);
    return { error: 'Gagal membuat konten undangan. Silakan coba lagi.' };
  }
}

export async function generateUmkmProfileAction(
  input: GenerateUmkmProfileInput
): Promise<GenerateUmkmProfileOutput | { error: string }> {
  if (!input.businessType || !input.targetMarket || !input.uniqueSellingPoint) {
    return { error: 'Semua kolom wajib diisi.' };
  }

  try {
    const result = await generateUmkmProfileFlow(input);
    return result;
  } catch (error) {
    console.error('Error generating UMKM profile:', error);
    return { error: 'Gagal membuat profil UMKM. Silakan coba lagi.' };
  }
}

export async function generateSpssSyntaxAction(
  input: GenerateSpssSyntaxInput
): Promise<GenerateSpssSyntaxOutput | { error: string }> {
  if (!input.analysisDescription) {
    return { error: 'Deskripsi analisis tidak boleh kosong.' };
  }

  try {
    const result = await generateSpssSyntaxFlow(input);
    return result;
  } catch (error) {
    console.error('Error generating SPSS syntax:', error);
    return { error: 'Gagal membuat sintaks SPSS. Silakan coba lagi.' };
  }
}

export async function generateImageAction(
  input: GenerateImageInput
): Promise<GenerateImageOutput | { error: string }> {
  if (!input.prompt) {
    return { error: 'Deskripsi gambar tidak boleh kosong.' };
  }

  try {
    const result = await generateImageFlow(input);
    return result;
  } catch (error) {
    console.error('Error generating image:', error);
    return { error: 'Gagal membuat gambar. Silakan coba lagi.' };
  }
}

export async function generateAppPrototypeAction(
  input: GenerateAppPrototypeInput
): Promise<GenerateAppPrototypeOutput | { error: string }> {
  if (!input.appIdea) {
    return { error: 'Ide aplikasi tidak boleh kosong.' };
  }

  try {
    const result = await generateAppPrototypeFlow(input);
    return result;
  } catch (error) {
    console.error('Error generating app prototype:', error);
    return { error: 'Gagal membuat prototipe aplikasi. Silakan coba lagi.' };
  }
}

export async function generateSoapFormulaAction(
  input: GenerateSoapFormulaInput
): Promise<GenerateSoapFormulaOutput | { error: string }> {
  if (!input.productType) {
    return { error: 'Jenis produk tidak boleh kosong.' };
  }

  try {
    const result = await generateSoapFormulaFlow(input);
    return result;
  } catch (error) {
    console.error('Error generating soap formula:', error);
    return { error: 'Gagal membuat formula. Silakan coba lagi.' };
  }
}
