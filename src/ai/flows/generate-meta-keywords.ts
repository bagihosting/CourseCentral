'use server';
/**
 * @fileOverview A flow for generating global SEO keywords for a platform.
 *
 * - generateMetaKeywords - A function that handles the keyword generation.
 * - GenerateMetaKeywordsInput - The input type for the function.
 * - GenerateMetaKeywordsOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateMetaKeywordsInputSchema = z.object({
  platformName: z.string().describe('The name of the online course platform.'),
  platformDescription: z.string().describe('The global meta description of the platform, providing context about its focus.'),
});
export type GenerateMetaKeywordsInput = z.infer<typeof GenerateMetaKeywordsInputSchema>;


const GenerateMetaKeywordsOutputSchema = z.object({
  metaKeywords: z.string().describe('A comma-separated string of 10-15 highly relevant, high-volume, low-competition keywords, including a mix of short-tail and long-tail keywords.'),
});
export type GenerateMetaKeywordsOutput = z.infer<typeof GenerateMetaKeywordsOutputSchema>;


export async function generateMetaKeywords(input: GenerateMetaKeywordsInput): Promise<GenerateMetaKeywordsOutput> {
  return generateMetaKeywordsFlow(input);
}

const generateMetaKeywordsFlow = ai.defineFlow(
  {
    name: 'generateMetaKeywordsFlow',
    inputSchema: GenerateMetaKeywordsInputSchema,
    outputSchema: GenerateMetaKeywordsOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'generateMetaKeywordsPrompt',
      input: { schema: GenerateMetaKeywordsInputSchema },
      output: { schema: GenerateMetaKeywordsOutputSchema },
      prompt: `
        You are a world-class SEO strategist with a deep understanding of keyword research. Your task is to generate a highly effective list of SEO keywords for an online course platform.
        Your goal is to identify keywords that will attract high-quality traffic by targeting terms with high search volume but low competition.

        **Platform Information:**
        - Platform Name: "{{{platformName}}}"
        - Platform Description: "{{{platformDescription}}}"

        **CRITICAL INSTRUCTIONS:**
        1.  **Analyze Context**: Deeply analyze the platform's name and description to understand its niche and target audience.
        2.  **Keyword Strategy**: Generate a list of 10-15 keywords. This list MUST include:
            -   **Short-tail keywords**: Broad terms that capture the main topic (e.g., "kursus online", "belajar coding").
            -   **Long-tail keywords**: More specific, multi-word phrases that target user intent with less competition (e.g., "kursus online web development untuk pemula", "belajar membuat aplikasi android dari nol").
            -   **LSI (Latent Semantic Indexing) keywords**: Related terms and synonyms that search engines use to understand context (e.g., if the topic is "React", include "hooks", "state management", "Next.js").
        3.  **Low Competition Focus**: Prioritize keywords that are less saturated by major competitors but still have significant search interest.
        4.  **Format**: The output must be a single, comma-separated string.
        5.  **Language**: The output must be in Bahasa Indonesia.
      `,
    });

    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Gagal menghasilkan kata kunci SEO.');
    }
    return output;
  }
);
