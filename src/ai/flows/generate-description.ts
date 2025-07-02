'use server';
/**
 * @fileOverview A flow for generating course descriptions using AI.
 *
 * - generateDescription - A function that handles the description generation process.
 * - GenerateDescriptionInput - The input type for the generateDescription function.
 * - GenerateDescriptionOutput - The return type for the generateDescription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateDescriptionInputSchema = z.object({
  title: z.string().describe('The title of the course.'),
});

const GenerateDescriptionOutputSchema = z.object({
  description: z
    .string()
    .describe('The generated course description.'),
});

export type GenerateDescriptionInput = z.infer<
  typeof GenerateDescriptionInputSchema
>;
export type GenerateDescriptionOutput = z.infer<
  typeof GenerateDescriptionOutputSchema
>;

export async function generateDescription(
  input: GenerateDescriptionInput
): Promise<GenerateDescriptionOutput> {
  return generateDescriptionFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateDescriptionPrompt',
    input: { schema: GenerateDescriptionInputSchema },
    output: { schema: GenerateDescriptionOutputSchema },
    prompt: `
        You are an expert copywriter specializing in creating compelling online course descriptions.
        Based on the provided course title, generate a detailed, engaging, and persuasive description in Bahasa Indonesia.

        The description should:
        1.  Start with a strong opening sentence that grabs the reader's attention.
        2.  Clearly explain what the student will learn and what skills they will acquire.
        3.  Highlight the key benefits of taking the course.
        4.  Mention the target audience (e.g., "for beginners," "for experienced developers").
        5.  End with a strong call to action.
        6.  Be well-structured, using paragraphs for readability.
        7.  The entire description should be at least 3-4 sentences long.

        Course Title: "{{{title}}}"
    `,
});


const generateDescriptionFlow = ai.defineFlow(
  {
    name: 'generateDescriptionFlow',
    inputSchema: GenerateDescriptionInputSchema,
    outputSchema: GenerateDescriptionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Description generation failed.');
    }
    return output;
  }
);
