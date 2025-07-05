
'use server';
/**
 * @fileOverview A flow for suggesting a new lesson title for a module.
 *
 * - suggestLessonTitle - A function that handles the title suggestion process.
 * - SuggestLessonTitleInput - The input type for the function.
 * - SuggestLessonTitleOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SuggestLessonTitleInputSchema = z.object({
  courseTitle: z.string().describe('The main title of the course.'),
  moduleTitle: z.string().describe('The title of the module this lesson belongs to.'),
  existingLessonTitles: z.array(z.string()).describe('A list of titles of the lessons that already exist in the module.'),
});

const SuggestLessonTitleOutputSchema = z.object({
  suggestedTitle: z.string().describe('A new, relevant, and concise lesson title suggestion in Bahasa Indonesia.'),
});

export type SuggestLessonTitleInput = z.infer<typeof SuggestLessonTitleInputSchema>;
export type SuggestLessonTitleOutput = z.infer<typeof SuggestLessonTitleOutputSchema>;

export async function suggestLessonTitle(
  input: SuggestLessonTitleInput
): Promise<SuggestLessonTitleOutput> {
  return suggestLessonTitleFlow(input);
}

const suggestLessonTitleFlow = ai.defineFlow(
  {
    name: 'suggestLessonTitleFlow',
    inputSchema: SuggestLessonTitleInputSchema,
    outputSchema: SuggestLessonTitleOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'suggestLessonTitlePrompt',
      input: { schema: SuggestLessonTitleInputSchema },
      output: { schema: SuggestLessonTitleOutputSchema },
      prompt: `
        You are an expert curriculum designer for online courses. Your task is to suggest a title for the next lesson within a specific module.
        The lesson title should be a logical next step based on the course and module context, and the existing lessons. It must be in formal Bahasa Indonesia.

        **Course Title:**
        "{{{courseTitle}}}"

        **Module Title:**
        "{{{moduleTitle}}}"

        **Existing Lessons in this Module (in order):**
        {{#if existingLessonTitles}}
        {{#each existingLessonTitles}}
        - {{{this}}}
        {{/each}}
        {{else}}
        (This is the first lesson in this module)
        {{/if}}

        **CRITICAL INSTRUCTIONS:**
        1.  Analyze the course and module titles to understand the learning objectives.
        2.  If it's the first lesson, suggest an introductory topic for that module (e.g., if module is "Dasar CSS", suggest "Pengenalan Selector CSS").
        3.  If there are existing lessons, suggest a title for the *next logical topic*. For example, if the last lesson was "HTML Tags", a good next lesson might be "HTML Attributes".
        4.  The title must be concise (3-7 words) and clear.
        5.  The output must be only the suggested title.
      `,
    });

    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Lesson title suggestion failed.');
    }
    return output;
  }
);
