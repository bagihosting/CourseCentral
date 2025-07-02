'use server';

/**
 * @fileOverview AI-powered course suggestion flow.
 *
 * - suggestCourses - A function that suggests courses based on user skills and progress.
 * - SuggestCoursesInput - The input type for the suggestCourses function.
 * - SuggestCoursesOutput - The return type for the suggestCourses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCoursesInputSchema = z.object({
  userSkills: z
    .array(z.string())
    .describe('A list of the user’s current skills.'),
  courseProgress: z
    .record(z.number())
    .describe(
      'A map of course IDs to the user’s progress in that course (0-100).' + 
      'If the user has not started the course, it will not be in the map.'
    ),
});
export type SuggestCoursesInput = z.infer<typeof SuggestCoursesInputSchema>;

const SuggestCoursesOutputSchema = z.array(z.string()).describe('A list of suggested course IDs.');
export type SuggestCoursesOutput = z.infer<typeof SuggestCoursesOutputSchema>;

export async function suggestCourses(input: SuggestCoursesInput): Promise<SuggestCoursesOutput> {
  return suggestCoursesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCoursesPrompt',
  input: {schema: SuggestCoursesInputSchema},
  output: {schema: SuggestCoursesOutputSchema},
  prompt: `Anda adalah seorang ahli rekomendasi kursus. Berdasarkan keahlian dan kemajuan kursus pengguna, 
  sarankan daftar ID kursus yang paling relevan dan menarik bagi mereka.

  Keahlian Pengguna:
  {{#if userSkills}}
  {{#each userSkills}} - {{{this}}}\n  {{/each}}
  {{else}}
  Tidak ada keahlian yang terdaftar.
  {{/if}}

  Kemajuan Kursus:
  {{#each courseProgress}} - ID Kursus: {{{@key}}}, Kemajuan: {{{this}}}%\n  {{/each}}

  ID Kursus yang Disarankan (sebagai array JSON string):`,
});

const suggestCoursesFlow = ai.defineFlow(
  {
    name: 'suggestCoursesFlow',
    inputSchema: SuggestCoursesInputSchema,
    outputSchema: SuggestCoursesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
