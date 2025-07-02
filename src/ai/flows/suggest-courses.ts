'use server';

import { ai } from '@/ai/genkit';
import { getAllCourses } from '@/lib/data';
import { z } from 'zod';

const CourseSuggestionInputSchema = z.object({
  interest: z.string().describe('Minat atau topik yang dicari pengguna.'),
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
    const courses = await getAllCourses();

    // If there are no courses, don't call the AI.
    if (courses.length === 0) {
      return { suggestions: [] };
    }

    const courseList = courses.map(c => `ID: ${c.id}, Judul: ${c.title}, Deskripsi: ${c.description}`).join('\n');

    const prompt = `
      Anda adalah seorang penasihat karir ahli. Berdasarkan minat pengguna dan daftar kursus yang tersedia, rekomendasikan hingga 3 kursus yang paling cocok.
      Untuk setiap rekomendasi, berikan alasan singkat mengapa kursus tersebut relevan dengan minat pengguna.

      Minat Pengguna: "${input.interest}"

      Daftar Kursus Tersedia:
      ${courseList}

      Format output Anda harus dalam bentuk JSON yang valid sesuai dengan skema yang diberikan.
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
      courses.some(course => course.id === suggestion.id)
    );

    return { suggestions: validSuggestions };
  }
);
