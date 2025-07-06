
'use server';
/**
 * @fileOverview A flow for generating a global SEO meta description for a platform.
 *
 * - generateMetaDescription - A function that handles the meta description generation.
 * - GenerateMetaDescriptionInput - The input type for the function.
 * - GenerateMetaDescriptionOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateMetaDescriptionInputSchema = z.object({
  platformName: z.string().describe('The name of the online course platform.'),
  titleSuffix: z.string().describe('The SEO title suffix of the platform, providing context about its focus.'),
});
export type GenerateMetaDescriptionInput = z.infer<typeof GenerateMetaDescriptionInputSchema>;


const GenerateMetaDescriptionOutputSchema = z.object({
  metaDescription: z.string().describe('An SEO-optimized meta description, under 160 characters, designed to be compelling and increase click-through rates.'),
});
export type GenerateMetaDescriptionOutput = z.infer<typeof GenerateMetaDescriptionOutputSchema>;


export async function generateMetaDescription(input: GenerateMetaDescriptionInput): Promise<GenerateMetaDescriptionOutput> {
  return generateMetaDescriptionFlow(input);
}

const generateMetaDescriptionFlow = ai.defineFlow(
  {
    name: 'generateMetaDescriptionFlow',
    inputSchema: GenerateMetaDescriptionInputSchema,
    outputSchema: GenerateMetaDescriptionOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'generateMetaDescriptionPrompt',
      input: { schema: GenerateMetaDescriptionInputSchema },
      output: { schema: GenerateMetaDescriptionOutputSchema },
      prompt: `
        You are an expert SEO copywriter. Your task is to write a compelling global meta description for an online learning platform.
        The description must be under 160 characters and should integrate keywords naturally from the provided platform name and title suffix.

        **Platform Information:**
        - Platform Name: "{{{platformName}}}"
        - Title Suffix: "{{{titleSuffix}}}"

        **CRITICAL INSTRUCTIONS:**
        1.  **Character Limit**: The meta description MUST be under 160 characters.
        2.  **Keyword Integration**: Naturally weave in keywords from the platform name and title suffix.
        3.  **Compelling Copy**: Write a description that entices users on a search engine results page to click. It should clearly communicate the platform's value.
        4.  **Call-to-Action**: Include a subtle call-to-action, like "Mulai belajar hari ini!" or "Temukan kursus Anda."
        5.  **Language**: The output must be in Bahasa Indonesia.
      `,
    });

    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Gagal menghasilkan meta deskripsi.');
    }
    return output;
  }
);
