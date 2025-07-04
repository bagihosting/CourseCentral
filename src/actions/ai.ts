
'use server';

import { generateThumbnail as generateThumbnailFlow } from '@/ai/flows/generate-thumbnail';
import { generateDescription as generateDescriptionFlow } from '@/ai/flows/generate-description';
import { suggestCourses as suggestCoursesFlow, type CourseSuggestionInput, type CourseSuggestionOutput } from '@/ai/flows/suggest-courses';
import { generateBloggerTemplate as generateBloggerTemplateFlow, type GenerateBloggerTemplateInput, type GenerateBloggerTemplateOutput } from '@/ai/flows/generate-blogger-template';
import { editBloggerTemplate as editBloggerTemplateFlow, type EditBloggerTemplateInput, type EditBloggerTemplateOutput } from '@/ai/flows/edit-blogger-template';
import { generateSkripsiChapter as generateSkripsiChapterFlow, type GenerateSkripsiChapterInput, type GenerateSkripsiChapterOutput } from '@/ai/flows/generate-skripsi-chapter';
import { generateWordpressPluginBoilerplate as generateWordpressPluginBoilerplateFlow, type GenerateWordpressPluginBoilerplateInput, type GenerateWordpressPluginBoilerplateOutput } from '@/ai/flows/generate-wordpress-plugin-boilerplate';
import { generateGoogleAds as generateGoogleAdsFlow, type GenerateGoogleAdsInput, type GenerateGoogleAdsOutput } from '@/ai/flows/generate-google-ads';
import { generateDigitalInvitation as generateDigitalInvitationFlow, type GenerateDigitalInvitationInput, type GenerateDigitalInvitationOutput } from '@/ai/flows/generate-digital-invitation';
import { generateUmkmProfile as generateUmkmProfileFlow, type GenerateUmkmProfileInput, type GenerateUmkmProfileOutput } from '@/ai/flows/generate-umkm-profile';
import { generateSpssSyntax as generateSpssSyntaxFlow, type GenerateSpssSyntaxInput, type GenerateSpssSyntaxOutput } from '@/ai/flows/generate-spss-syntax';
import { generateImage as generateImageFlow, type GenerateImageInput, type GenerateImageOutput } from '@/ai/flows/generate-image';
import { generateAppPrototype as generateAppPrototypeFlow, type GenerateAppPrototypeInput, type GenerateAppPrototypeOutput } from '@/ai/flows/generate-app-prototype';
import { generateSoapFormula as generateSoapFormulaFlow, type GenerateSoapFormulaInput, type GenerateSoapFormulaOutput } from '@/ai/flows/generate-soap-formula';
import { generateWebApp as generateWebAppFlow, type GenerateWebAppInput, type GenerateWebAppOutput } from '@/ai/flows/generate-web-app';
import { editWebApp as editWebAppFlow, type EditWebAppInput, type EditWebAppOutput } from '@/ai/flows/edit-web-app';
import { generateCourseSeo as generateCourseSeoFlow, type GenerateCourseSeoInput, type GenerateCourseSeoOutput } from '@/ai/flows/generate-course-seo';
import { generateTitleSuffix as generateTitleSuffixFlow, type GenerateTitleSuffixInput, type GenerateTitleSuffixOutput } from '@/ai/flows/generate-title-suffix';
import { generateMetaDescription as generateMetaDescriptionFlow, type GenerateMetaDescriptionInput, type GenerateMetaDescriptionOutput } from '@/ai/flows/generate-meta-description';
import { generateMetaKeywords as generateMetaKeywordsFlow, type GenerateMetaKeywordsInput, type GenerateMetaKeywordsOutput } from '@/ai/flows/generate-meta-keywords';
import { generateCertificate as generateCertificateFlow, type GenerateCertificateInput, type GenerateCertificateOutput } from '@/ai/flows/generate-certificate';
import { approveCertificateRequest, getCertificateRequests, awardCertificateToUser, getSeoSettings, getLandingPageSettings } from '@/lib/data';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import DOMPurify from 'isomorphic-dompurify';

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

export async function generateWebAppAction(
  input: GenerateWebAppInput
): Promise<GenerateWebAppOutput | { error: string }> {
  if (!input.appName || (!input.appDescription && !input.cloneUrl)) {
    return { error: 'Nama aplikasi dan deskripsi atau URL klon tidak boleh kosong.' };
  }

  try {
    const result = await generateWebAppFlow(input);
    result.previewHtml = DOMPurify.sanitize(result.previewHtml, { WHOLE_DOCUMENT: true });
    return result;
  } catch (error) {
    console.error('Error generating web app:', error);
    return { error: 'Gagal membuat boilerplate aplikasi. Silakan coba lagi.' };
  }
}

export async function editWebAppAction(
  input: EditWebAppInput
): Promise<EditWebAppOutput | { error: string }> {
  if (!input.files || input.files.length === 0 || !input.editRequest) {
    return { error: 'File yang ada dan permintaan edit tidak boleh kosong.' };
  }

  try {
    const result = await editWebAppFlow(input);
    result.previewHtml = DOMPurify.sanitize(result.previewHtml, { WHOLE_DOCUMENT: true });
    return result;
  } catch (error) {
    console.error('Error editing web app:', error);
    return { error: 'Gagal mengedit boilerplate aplikasi. Silakan coba lagi.' };
  }
}

export async function generateCourseSeoAction(
  input: GenerateCourseSeoInput
): Promise<GenerateCourseSeoOutput | { error: string }> {
  if (!input.courseTitle || !input.courseDescription) {
    return { error: 'Judul dan deskripsi kursus tidak boleh kosong.' };
  }

  try {
    const result = await generateCourseSeoFlow(input);
    return result;
  } catch (error) {
    console.error('Error generating course SEO:', error);
    return { error: 'Gagal membuat optimasi SEO. Silakan coba lagi.' };
  }
}

export async function generateTitleSuffixAction(
  input: GenerateTitleSuffixInput
): Promise<GenerateTitleSuffixOutput | { error: string }> {
  if (!input.platformName || !input.platformDescription) {
    return { error: 'Nama platform dan deskripsi tidak boleh kosong.' };
  }

  try {
    const result = await generateTitleSuffixFlow(input);
    return result;
  } catch (error) {
    console.error('Error generating title suffix:', error);
    return { error: 'Gagal membuat akhiran judul SEO. Silakan coba lagi.' };
  }
}

export async function generateMetaDescriptionAction(
  input: GenerateMetaDescriptionInput
): Promise<GenerateMetaDescriptionOutput | { error: string }> {
  if (!input.platformName || !input.titleSuffix) {
    return { error: 'Nama platform dan akhiran judul tidak boleh kosong.' };
  }

  try {
    const result = await generateMetaDescriptionFlow(input);
    return result;
  } catch (error) {
    console.error('Error generating meta description:', error);
    return { error: 'Gagal membuat deskripsi meta. Silakan coba lagi.' };
  }
}

export async function generateMetaKeywordsAction(
  input: GenerateMetaKeywordsInput
): Promise<GenerateMetaKeywordsOutput | { error: string }> {
  if (!input.platformName || !input.platformDescription) {
    return { error: 'Nama platform dan deskripsi tidak boleh kosong.' };
  }

  try {
    const result = await generateMetaKeywordsFlow(input);
    return result;
  } catch (error) {
    console.error('Error generating meta keywords:', error);
    return { error: 'Gagal membuat kata kunci meta. Silakan coba lagi.' };
  }
}

export async function generateCertificateAction(
  input: GenerateCertificateInput
): Promise<GenerateCertificateOutput | { error: string }> {
  if (!input.participantName || !input.courseName || !input.completionDate || !input.organizerName) {
    return { error: 'Semua kolom wajib diisi untuk membuat sertifikat.' };
  }

  try {
    const result = await generateCertificateFlow(input);
    // Sanitize the generated HTML before returning it to the client
    result.certificateHtml = DOMPurify.sanitize(result.certificateHtml, { WHOLE_DOCUMENT: true });
    return result;
  } catch (error) {
    console.error('Error generating certificate:', error);
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
    return { error: `Gagal membuat sertifikat: ${errorMessage}` };
  }
}

export async function generateAndApproveCertificateAction(
    requestId: string
): Promise<{ success: boolean } | { error: string }> {
    const allRequests = getCertificateRequests();
    const request = allRequests.find(r => r.id === requestId);

    if (!request) {
        return { error: 'Permintaan tidak ditemukan.' };
    }
    if (request.status !== 'pending') {
        return { error: 'Permintaan ini sudah diproses.'}
    }

    const seoSettings = getSeoSettings();
    const landingSettings = getLandingPageSettings();

    const generationInput: GenerateCertificateInput = {
        participantName: request.userName,
        courseName: request.courseTitle,
        completionDate: format(new Date(), 'dd MMMM yyyy', { locale: id }),
        organizerName: seoSettings.platformName || 'Scriptify',
        logoUrl: landingSettings.logoUrl || 'https://placehold.co/200x80.png',
        courseId: request.courseId,
    };
    
    try {
        const generationResult = await generateCertificateFlow(generationInput);
        // Sanitize the generated HTML before saving it
        const cleanHtml = DOMPurify.sanitize(generationResult.certificateHtml, { WHOLE_DOCUMENT: true });
        approveCertificateRequest(requestId, cleanHtml);
        return { success: true };
    } catch (error) {
        console.error('Error approving certificate:', error);
        const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
        return { error: `Gagal menyetujui sertifikat: ${errorMessage}` };
    }
}

export async function awardCertificateAction(
    userId: string,
    courseId: string,
    certificateHtml: string
): Promise<{ success: boolean } | { error: string }> {
    try {
        // Sanitize the HTML before saving it
        const cleanHtml = DOMPurify.sanitize(certificateHtml, { WHOLE_DOCUMENT: true });
        awardCertificateToUser(userId, courseId, cleanHtml);
        return { success: true };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
        return { error: `Gagal menyimpan sertifikat: ${errorMessage}` };
    }
}

    
