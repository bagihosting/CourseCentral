'use server';
/**
 * @fileOverview A flow for generating thesis/dissertation chapters.
 *
 * - generateSkripsiChapter - A function that handles the chapter generation process.
 * - GenerateSkripsiChapterInput - The input type for the function.
 * - GenerateSkripsiChapterOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateSkripsiChapterInputSchema = z.object({
  topic: z.string().describe('The main topic or title of the thesis.'),
  chapterTitle: z.string().describe('The title of the chapter to be generated (e.g., "BAB I: PENDAHULUAN", "BAB II: TINJAUAN PUSTAKA").'),
});

const GenerateSkripsiChapterOutputSchema = z.object({
  content: z
    .string()
    .describe('The generated content for the chapter, written in formal academic Indonesian. It should be well-structured with paragraphs and appropriate headings.'),
});

export type GenerateSkripsiChapterInput = z.infer<
  typeof GenerateSkripsiChapterInputSchema
>;
export type GenerateSkripsiChapterOutput = z.infer<
  typeof GenerateSkripsiChapterOutputSchema
>;

export async function generateSkripsiChapter(
  input: GenerateSkripsiChapterInput
): Promise<GenerateSkripsiChapterOutput> {
  return generateSkripsiChapterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSkripsiChapterPrompt',
  input: { schema: GenerateSkripsiChapterInputSchema },
  output: { schema: GenerateSkripsiChapterOutputSchema },
  prompt: `
    Anda adalah seorang asisten akademik ahli yang berspesialisasi dalam penulisan skripsi dan tesis. Tugas Anda adalah membantu mahasiswa dengan membuat draf konten untuk bab-bab skripsi mereka.
    Gunakan gaya penulisan yang formal, akademis, dan terstruktur dengan baik dalam Bahasa Indonesia.

    Topik Utama Skripsi: "{{{topic}}}"
    Judul Bab yang Diminta: "{{{chapterTitle}}}"

    **INSTRUKSI PENTING:**
    1.  **Analisis Permintaan**: Pahami topik utama dan judul bab yang diminta. Hasilkan konten yang relevan dan mendalam sesuai dengan konteks bab tersebut.
    2.  **Struktur Konten**:
        -   Jika bab tersebut adalah "BAB I: PENDAHULUAN", konten harus mencakup sub-bagian seperti Latar Belakang, Rumusan Masalah, Tujuan Penelitian, dan Manfaat Penelitian.
        -   Jika bab tersebut adalah "BAB II: TINJAUAN PUSTAKA", konten harus membahas teori-teori relevan, penelitian terdahulu, dan kerangka berpikir.
        -   Untuk bab lain, sesuaikan strukturnya dengan standar penulisan ilmiah yang umum.
    3.  **Gaya Bahasa**: Gunakan Bahasa Indonesia yang baku, formal, dan objektif. Hindari bahasa sehari-hari atau opini pribadi.
    4.  **Kualitas**: Pastikan teks yang dihasilkan koheren, logis, dan kaya informasi. Buatlah paragraf-paragraf yang terstruktur dengan baik.
    5.  **Output**: Hasilkan hanya konten untuk bab yang diminta. Jangan menambahkan bab lain atau kesimpulan yang tidak relevan.
  `,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      }
    ]
  }
});

const generateSkripsiChapterFlow = ai.defineFlow(
  {
    name: 'generateSkripsiChapterFlow',
    inputSchema: GenerateSkripsiChapterInputSchema,
    outputSchema: GenerateSkripsiChapterOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    
    if (!output) {
      throw new Error('Gagal menghasilkan draf bab skripsi.');
    }
    return output;
  }
);
