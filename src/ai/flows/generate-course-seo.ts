'use server';
/**
 * @fileOverview A flow for generating SEO-optimized content for a course.
 *
 * - generateCourseSeo - A function that handles the SEO content generation.
 * - GenerateCourseSeoInput - The input type for the function.
 * - GenerateCourseSeoOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateCourseSeoInputSchema = z.object({
  courseTitle: z.string().describe('The original title of the course.'),
  courseDescription: z.string().describe('The original description of the course.'),
});

const GenerateCourseSeoOutputSchema = z.object({
  seoTitle: z.string().describe('An SEO-optimized title for the course, under 60 characters, designed to rank high with low competition.'),
  seoDescription: z.string().describe('An SEO-optimized meta description, under 160 characters, designed to be compelling and increase click-through rates.'),
  seoKeywords: z.string().describe('A comma-separated string of 5-10 highly relevant and long-tail keywords for the course.'),
});

export type GenerateCourseSeoInput = z.infer<typeof GenerateCourseSeoInputSchema>;
export type GenerateCourseSeoOutput = z.infer<typeof GenerateCourseSeoOutputSchema>;

export async function generateCourseSeo(input: GenerateCourseSeoInput): Promise<GenerateCourseSeoOutput> {
  return generateCourseSeoFlow(input);
}

const generateCourseSeoFlow = ai.defineFlow(
  {
    name: 'generateCourseSeoFlow',
    inputSchema: GenerateCourseSeoInputSchema,
    outputSchema: GenerateCourseSeoOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'generateCourseSeoPrompt',
      input: { schema: GenerateCourseSeoInputSchema },
      output: { schema: GenerateCourseSeoOutputSchema },
      prompt: `
        You are an expert SEO specialist and digital marketing strategist. Your task is to generate highly optimized SEO content for an online course.
        Your goal is to maximize search engine rankings by finding a sweet spot of high search volume and low competition.

        **Course Information:**
        - Original Title: "{{{courseTitle}}}"
        - Original Description: "{{{courseDescription}}}"

        **CRITICAL INSTRUCTIONS:**

        1.  **Generate SEO Title**:
            -   Create a new title that is highly optimized for search engines. It MUST be under 60 characters.
            -   Think about user intent. What would a potential student search for?
            -   Incorporate long-tail keywords that are specific and less competitive.
            -   The title should be catchy, clear, and promise a direct benefit.
            -   Example: Instead of "React Course", suggest "Belajar React 2024: Proyek Nyata & Hooks".

        2.  **Generate SEO Meta Description**:
            -   Write a compelling meta description that is under 160 characters.
            -   This description should act as an "ad" on the search results page, encouraging users to click.
            -   It must summarize the course's key value proposition and include a call-to-action (e.g., "Mulai belajar sekarang!", "Daftar gratis!").
            -   Include one or two primary keywords naturally.

        3.  **Generate SEO Keywords**:
            -   Provide a comma-separated list of 5-10 keywords.
            -   Include a mix of short-tail (e.g., "kursus react") and long-tail (e.g., "cara membuat aplikasi dengan react untuk pemula") keywords.
            -   The keywords must be highly relevant to the course content.
            -   All output must be in Bahasa Indonesia.
      `,
    });

    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Gagal menghasilkan konten SEO.');
    }
    return output;
  }
);
