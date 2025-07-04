
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
import { generateCourseSeo as generateCourseSeoFlow, type GenerateCourseSeoInput, type GenerateCourseSeoOutput } from '@/ai/flows/generate-course-seo';
import { generateTitleSuffix as generateTitleSuffixFlow, type GenerateTitleSuffixInput, type GenerateTitleSuffixOutput } from '@/ai/flows/generate-title-suffix';
import { generateMetaDescription as generateMetaDescriptionFlow, type GenerateMetaDescriptionInput, type GenerateMetaDescriptionOutput } from '@/ai/flows/generate-meta-description';
import { generateMetaKeywords as generateMetaKeywordsFlow, type GenerateMetaKeywordsInput, type GenerateMetaKeywordsOutput } from '@/ai/flows/generate-meta-keywords';
import { generateCertificate as generateCertificateFlow, type GenerateCertificateInput, type GenerateCertificateOutput } from '@/ai/flows/generate-certificate';
import { generateHeroImage as generateHeroImageFlow, type GenerateHeroImageInput, type GenerateHeroImageOutput } from '@/ai/flows/generate-hero-image';
import { suggestMakalahTitles as suggestMakalahTitlesFlow, type SuggestMakalahTitlesInput, type SuggestMakalahTitlesOutput } from '@/ai/flows/suggest-makalah-titles';
import { generateMakalah as generateMakalahFlow, type GenerateMakalahInput, type GenerateMakalahOutput } from '@/ai/flows/generate-makalah';
import { editMakalah as editMakalahFlow, type EditMakalahInput, type EditMakalahOutput } from '@/ai/flows/edit-makalah';
import { generatePromoThumbnail as generatePromoThumbnailFlow, type GeneratePromoThumbnailOutput } from '@/ai/flows/generate-promo-thumbnail';
import { generateAffiliatePromo as generateAffiliatePromoFlow, type GenerateAffiliatePromoInput, type GenerateAffiliatePromoOutput } from '@/ai/flows/generate-affiliate-promo';
import { generateAppTopology as generateAppTopologyFlow, type GenerateAppTopologyInput, type GenerateAppTopologyOutput } from '@/ai/flows/generate-app-topology';
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

export async function generateHeroImageAction(
  input: GenerateHeroImageInput
): Promise<GenerateHeroImageOutput | { error: string }> {
  if (!input.headline) {
    return { error: 'Judul utama tidak boleh kosong untuk membuat gambar.' };
  }

  try {
    const result = await generateHeroImageFlow(input);
    return result;
  } catch (error) {
    console.error('Error generating hero image:', error);
    return { error: 'Gagal membuat gambar hero. Silakan coba lagi.' };
  }
}

export async function suggestMakalahTitlesAction(
  input: SuggestMakalahTitlesInput
): Promise<SuggestMakalahTitlesOutput | { error: string }> {
  if (!input.major) {
    return { error: 'Jurusan tidak boleh kosong.' };
  }
  try {
    const result = await suggestMakalahTitlesFlow(input);
    return result;
  } catch (error) {
    console.error('Error suggesting paper titles:', error);
    return { error: 'Gagal memberikan saran judul makalah.' };
  }
}

export async function generateMakalahAction(
  input: GenerateMakalahInput
): Promise<GenerateMakalahOutput | { error: string }> {
  if (!input.title || !input.major || !input.pageCount) {
    return { error: 'Judul, jurusan, dan jumlah halaman harus diisi.' };
  }
  try {
    const result = await generateMakalahFlow(input);
    return result;
  } catch (error) {
    console.error('Error generating paper:', error);
    return { error: 'Gagal membuat draf makalah.' };
  }
}

export async function editMakalahAction(
  input: EditMakalahInput
): Promise<EditMakalahOutput | { error: string }> {
  if (!input.currentContent || !input.editRequest) {
    return { error: 'Konten makalah dan permintaan edit tidak boleh kosong.' };
  }
  try {
    const result = await editMakalahFlow(input);
    return result;
  } catch (error) {
    console.error('Error editing paper:', error);
    return { error: 'Gagal mengedit makalah.' };
  }
}

export async function generatePromoThumbnailAction(): Promise<GeneratePromoThumbnailOutput | { error: string }> {
  try {
    const result = await generatePromoThumbnailFlow();
    return { imageUrl: result.imageUrl };
  } catch (error) {
    console.error('Error generating promo thumbnail:', error);
    return { error: 'Gagal membuat thumbnail promosi. Silakan coba lagi.' };
  }
}

export async function generateAffiliatePromoAction(
  input: GenerateAffiliatePromoInput
): Promise<GenerateAffiliatePromoOutput | { error: string }> {
  if (!input.referralLink) {
    return { error: 'Link referral tidak boleh kosong.' };
  }
  try {
    const result = await generateAffiliatePromoFlow(input);
    return result;
  } catch (error) {
    console.error('Error generating affiliate promo text:', error);
    return { error: 'Gagal membuat teks promosi afiliasi.' };
  }
}

export async function generateAppTopologyAction(
  input: GenerateAppTopologyInput
): Promise<GenerateAppTopologyOutput | { error: string }> {
  if (!input.appKeywords) {
    return { error: 'Kata kunci ide aplikasi tidak boleh kosong.' };
  }

  try {
    const result = await generateAppTopologyFlow(input);
    return result;
  } catch (error) {
    console.error('Error generating app topology:', error);
    return { error: 'Gagal membuat topologi aplikasi. Silakan coba lagi.' };
  }
}
