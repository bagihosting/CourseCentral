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

const GenerateTitleSuffixInputSchema = z.object({
  platformName: z.string().describe('The name of the online course platform.'),
  platformDescription: z.string().describe('The global meta description of the platform, providing context about its focus.'),
});

const GenerateTitleSuffixOutputSchema = z.object({
  titleSuffix: z.string().max(60).describe('An SEO-optimized title suffix, starting with a separator like " | " or " - ", with a maximum length of 60 characters, designed to rank high with low competition.'),
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
    You are a world-class SEO strategist and copywriter, renowned for crafting titles that achieve top search engine rankings by identifying high-volume, low-competition keywords.
    Your task is to generate a short, powerful, and unique SEO-optimized title suffix for a platform. This suffix will be appended to every page title.

    **Platform Information:**
    - Platform Name: "{{{platformName}}}"
    - Platform Description: "{{{platformDescription}}}"

    **CRITICAL INSTRUCTIONS - Follow this process:**

    1.  **Analyze Core Identity**: First, deeply analyze the platform's name and description to understand its primary topic, target audience, and unique value proposition.
    2.  **Keyword Brainstorming**: Based on the core identity, brainstorm a list of potential keywords. Include:
        -   **Broad Keywords**: General terms (e.g., "kursus online", "belajar coding").
        -   **Long-Tail Keywords**: Specific phrases that users are likely to search for (e.g., "kursus online sertifikat untuk profesional").
        -   **LSI Keywords**: Related terms that provide context (e.g., if the topic is "React", include "hooks", "state management", "Next.js").
    3.  **Strategic Selection**: From your brainstormed list, identify the keyword phrase that has the best balance of high search volume and low competition. This is the key to ranking success. Think like a user trying to solve a problem that the platform addresses.
    4.  **Craft the Suffix**: Construct the final suffix using the selected keyword phrase.
        -   It MUST start with a separator character, like " | " or " - ".
        -   It MUST include the platform name \`{{{platformName}}}\`.
        -   It MUST incorporate the high-potential keyword phrase you identified.
    5.  **Strict Constraints**:
        -   The entire output string (including the separator) MUST be no more than 60 characters long. This is a critical SEO requirement. Do not exceed this limit under any circumstances.
        -   The language MUST be Bahasa Indonesia.

    **Example Thinking Process:**
    -   *Platform*: "SkillUp" - "Platform belajar skill IT."
    -   *Keywords*: "belajar IT", "kursus IT online", "sertifikasi IT", "pelatihan IT untuk karir".
    -   *Analysis*: "sertifikasi IT" is competitive. "pelatihan IT untuk karir" is specific and implies a result, likely lower competition. It's a good target.
    -   *Crafting*: "| SkillUp - Pelatihan IT untuk Karir" (Length: 39, good.)
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
