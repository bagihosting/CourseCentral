'use server';
/**
 * @fileOverview A flow for generating an SEO-optimized title suffix for a platform.
 *
 * - generateTitleSuffix - A function that handles the title suffix generation.
 * - GenerateTitleSuffixInput - The input type for the function.
 * - GenerateTitleSuffixOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const GenerateTitleSuffixInputSchema = z.object({
  platformName: z.string().describe('The name of the online course platform.'),
  platformDescription: z.string().describe('The global meta description of the platform, providing context about its focus.'),
});

export const GenerateTitleSuffixOutputSchema = z.object({
  titleSuffix: z.string().describe('An SEO-optimized title suffix, starting with a separator like " | " or " - ", under 60 characters total, designed to rank high with low competition.'),
});

export type GenerateTitleSuffixInput = z.infer<typeof GenerateTitleSuffixInputSchema>;
export type GenerateTitleSuffixOutput = z.infer<typeof GenerateTitleSuffixOutputSchema>;

export async function generateTitleSuffix(input: GenerateTitleSuffixInput): Promise<GenerateTitleSuffixOutput> {
  return generateTitleSuffixFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTitleSuffixPrompt',
  input: { schema: GenerateTitleSuffixInputSchema },
  output: { schema: GenerateTitleSuffixOutputSchema },
  prompt: `
    You are an SEO expert specializing in branding for online platforms.
    Your task is to create a short, powerful, and unique SEO-optimized title suffix.
    This suffix will be appended to the page title across an entire website.

    **Platform Information:**
    - Platform Name: "{{{platformName}}}"
    - Platform Description: "{{{platformDescription}}}"

    **CRITICAL INSTRUCTIONS:**
    1.  **High-Volume, Low-Competition**: Analyze the platform's context to find a niche. Brainstorm keywords that have high search interest but are not overly saturated by competitors. Think about long-tail keywords or unique value propositions.
    2.  **Format**: The suffix MUST start with a separator character, like " | " or " - ", followed by the brand name and a very short, impactful keyword-rich phrase.
    3.  **Character Limit**: The entire output string (including the separator) MUST be under 60 characters. Shorter is often better.
    4.  **Goal**: The suffix should clearly communicate the platform's core identity and value in a way that is attractive to both users and search engines.
    5.  **Language**: All output must be in Bahasa Indonesia.

    **Example:**
    - Input Name: "CourseCentral"
    - Input Description: "Platform kursus online untuk belajar skill digital."
    - Bad Output: "| CourseCentral" (too generic)
    - Good Output: "| CourseCentral: Skill Digital Terapan" (specific, includes keywords)
  `,
});

const generateTitleSuffixFlow = ai.defineFlow(
  {
    name: 'generateTitleSuffixFlow',
    inputSchema: GenerateTitleSuffixInputSchema,
    outputSchema: GenerateTitleSuffixOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Gagal menghasilkan akhiran judul SEO.');
    }
    return output;
  }
);
