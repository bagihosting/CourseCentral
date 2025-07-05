'use server';
/**
 * @fileOverview A flow for suggesting a new module title for a course.
 *
 * - suggestModuleTitle - A function that handles the title suggestion process.
 * - SuggestModuleTitleInput - The input type for the function.
 * - SuggestModuleTitleOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SuggestModuleTitleInputSchema = z.object({
  courseTitle: z.string().describe('The main title of the course.'),
  existingModuleTitles: z.array(z.string()).describe('A list of titles of the modules that already exist in the course.'),
});

const SuggestModuleTitleOutputSchema = z.object({
  suggestedTitle: z.string().describe('A new, relevant, and concise module title suggestion in Bahasa Indonesia.'),
});

export type SuggestModuleTitleInput = z.infer<typeof SuggestModuleTitleInputSchema>;
export type SuggestModuleTitleOutput = z.infer<typeof SuggestModuleTitleOutputSchema>;

export async function suggestModuleTitle(
  input: SuggestModuleTitleInput
): Promise<SuggestModuleTitleOutput> {
  return suggestModuleTitleFlow(input);
}

const suggestModuleTitleFlow = ai.defineFlow(
  {
    name: 'suggestModuleTitleFlow',
    inputSchema: SuggestModuleTitleInputSchema,
    outputSchema: SuggestModuleTitleOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'suggestModuleTitlePrompt',
      input: { schema: SuggestModuleTitleInputSchema },
      output: { schema: SuggestModuleTitleOutputSchema },
      prompt: `
        You are an expert curriculum designer for online courses. Your task is to suggest a title for the next module in a course.
        The title should be logical, follow the sequence of the existing modules, and be in formal Bahasa Indonesia.

        **Course Title:**
        "{{{courseTitle}}}"

        **Existing Module Titles (in order):**
        {{#if existingModuleTitles}}
        {{#each existingModuleTitles}}
        - {{{this}}}
        {{/each}}
        {{else}}
        (This is the first module)
        {{/if}}

        **CRITICAL INSTRUCTIONS:**
        1.  Analyze the course title and the list of existing modules to understand the topic and progression.
        2.  If it's the first module, suggest an introductory title like "Pendahuluan" or "Mulai dari Sini".
        3.  If there are existing modules, suggest a title for the *next logical step* in the learning path. For example, if the last module was "Pengenalan HTML", a good next module might be "Dasar-Dasar CSS".
        4.  The title must be concise (2-5 words) and clear.
        5.  The output must be only the suggested title.
      `,
    });

    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Module title suggestion failed.');
    }
    return output;
  }
);
