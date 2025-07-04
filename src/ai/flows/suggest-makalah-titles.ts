'use server';
/**
 * @fileOverview A flow for suggesting academic paper titles.
 *
 * - suggestMakalahTitles - A function that handles the title suggestion process.
 * - SuggestMakalahTitlesInput - The input type for the function.
 * - SuggestMakalahTitlesOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SuggestMakalahTitlesInputSchema = z.object({
  major: z.string().describe('The academic major or field of study.'),
});

const SuggestMakalahTitlesOutputSchema = z.object({
  titles: z
    .array(z.string())
    .describe('An array of 5 to 7 creative and academic paper titles.'),
});

export type SuggestMakalahTitlesInput = z.infer<typeof SuggestMakalahTitlesInputSchema>;
export type SuggestMakalahTitlesOutput = z.infer<typeof SuggestMakalahTitlesOutputSchema>;

export async function suggestMakalahTitles(
  input: SuggestMakalahTitlesInput
): Promise<SuggestMakalahTitlesOutput> {
  return suggestMakalahTitlesFlow(input);
}

const suggestMakalahTitlesFlow = ai.defineFlow(
  {
    name: 'suggestMakalahTitlesFlow',
    inputSchema: SuggestMakalahTitlesInputSchema,
    outputSchema: SuggestMakalahTitlesOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'suggestMakalahTitlesPrompt',
      input: { schema: SuggestMakalahTitlesInputSchema },
      output: { schema: SuggestMakalahTitlesOutputSchema },
      prompt: `
        You are an expert academic advisor. Your task is to brainstorm interesting and relevant paper titles for a university student.
        The titles should be suitable for the specified academic major and written in formal Indonesian.

        **Academic Major:**
        "{{{major}}}"

        **CRITICAL INSTRUCTIONS:**
        1.  **Generate 5-7 Titles**: Create a list of 5 to 7 unique paper titles.
        2.  **Be Relevant**: The titles must be directly relevant to the academic major provided.
        3.  **Be Academic**: The titles should sound formal and suitable for a university paper.
        4.  **Be Creative**: The titles should be engaging and suggest an interesting area of research or discussion.
      `,
    });

    const { output } = await prompt(input);
    
    if (!output || !output.titles || output.titles.length === 0) {
      throw new Error('Title suggestion failed. The model did not return any titles.');
    }
    return output;
  }
);
