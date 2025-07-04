'use server';
/**
 * @fileOverview A flow for generating hero images for a website.
 *
 * - generateHeroImage - A function that handles the image generation process.
 * - GenerateHeroImageInput - The input type for the function.
 * - GenerateHeroImageOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateHeroImageInputSchema = z.object({
  headline: z.string().describe('The main headline of the website, to inspire the image theme.'),
});

const GenerateHeroImageOutputSchema = z.object({
  imageUrl: z
    .string()
    .describe('The data URI of the generated hero image.'),
});

export type GenerateHeroImageInput = z.infer<
  typeof GenerateHeroImageInputSchema
>;
export type GenerateHeroImageOutput = z.infer<
  typeof GenerateHeroImageOutputSchema
>;

export async function generateHeroImage(
  input: GenerateHeroImageInput
): Promise<GenerateHeroImageOutput> {
  return generateHeroImageFlow(input);
}

const generateHeroImageFlow = ai.defineFlow(
  {
    name: 'generateHeroImageFlow',
    inputSchema: GenerateHeroImageInputSchema,
    outputSchema: GenerateHeroImageOutputSchema,
  },
  async (input) => {
    const prompt = `
      Generate a professional and inspiring hero image for an online learning platform's main landing page.
      The image should be visually appealing, modern, high-quality, and suitable for a website's main banner.
      The theme of the image should reflect the platform's headline: "${input.headline}".
      Depict concepts like learning, technology, personal growth, collaboration, and success.
      The image should be abstract or conceptual, and feature a vibrant, professional color palette.
      **Crucially, do NOT add any text, words, or letters to the image.**
      The style should be a clean, 3D render.
    `;

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media) {
      throw new Error('Image generation failed.');
    }

    return { imageUrl: media.url };
  }
);
