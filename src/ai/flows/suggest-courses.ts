'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SimpleCourseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
});

const CourseSuggestionInputSchema = z.object({
  interest: z.string().describe('Minat atau topik yang dicari pengguna.'),
  courses: z.array(SimpleCourseSchema).describe("Daftar kursus yang tersedia untuk dipertimbangkan."),
});

const CourseSuggestionOutputSchema = z.object({
  suggestions: z.array(
    z.object({
      id: z.string().describe('ID kursus yang disarankan.'),
      title: z.string().describe('Judul kursus yang disarankan.'),
      reason: z.string().describe('Alasan mengapa kursus ini direkomendasikan.'),
    })
  ).describe('Daftar kursus yang direkomendasikan.'),
});

export type CourseSuggestionInput = z.infer<typeof CourseSuggestionInputSchema>;
export type CourseSuggestionOutput = z.infer<typeof CourseSuggestionOutputSchema>;

export async function suggestCourses(input: CourseSuggestionInput): Promise<CourseSuggestionOutput> {
  return suggestCoursesFlow(input);
}

const suggestCoursesFlow = ai.defineFlow(
  {
    name: 'suggestCoursesFlow',
    inputSchema: CourseSuggestionInputSchema,
    outputSchema: CourseSuggestionOutputSchema,
  },
  async (input) => {
    // If there are no courses, don't call the AI.
    if (input.courses.length === 0) {
      return { suggestions: [] };
    }

    const courseList = input.courses.map(c => `ID: ${c.id}, Judul: ${c.title}, Deskripsi: ${c.description}`).join('\n');

    const prompt = `
      Anda adalah seorang penasihat karir ahli. Berdasarkan minat pengguna dan daftar kursus yang tersedia, rekomendasikan hingga 3 kursus yang paling cocok.
      Untuk setiap rekomendasi, berikan alasan singkat mengapa kursus tersebut relevan dengan minat pengguna.

      Minat Pengguna: "${input.interest}"

      Daftar Kursus Tersedia:
      ${courseList}

      Format output Anda harus dalam bentuk JSON yang valid sesuai dengan skema yang diberikan.
      Pastikan ID kursus yang Anda rekomendasikan ada di daftar yang disediakan.
    `;

    const llmResponse = await ai.generate({
      prompt: prompt,
      output: {
        schema: CourseSuggestionOutputSchema
      }
    });

    const output = llmResponse.output;

    if (!output) {
      return { suggestions: [] };
    }
    
    // Filter suggestions to ensure they exist in our database and are not hallucinations
    const validSuggestions = output.suggestions.filter(suggestion => 
      input.courses.some(course => course.id === suggestion.id)
    );

    return { suggestions: validSuggestions };
  }
);
