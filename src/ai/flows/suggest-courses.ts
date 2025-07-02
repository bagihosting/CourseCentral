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
    .describe('A list of the user\u2019s current skills.'),
  courseProgress: z
    .record(z.number())
    .describe(
      'A map of course IDs to the user\u2019s progress in that course (0-100).' + 
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
  prompt: `You are a course recommendation expert. Based on the user's skills and course progress,
  suggest a list of course IDs that would be most relevant and interesting to them.

  User Skills:
  {{#if userSkills}}
  {{#each userSkills}} - {{{this}}}\n  {{/each}}
  {{else}}
  No skills listed.
  {{/if}}

  Course Progress:
  {{#each courseProgress}} - Course ID: {{{@key}}}, Progress: {{{this}}}%\n  {{/each}}

  Suggested Course IDs (as a JSON array of strings):`,
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

