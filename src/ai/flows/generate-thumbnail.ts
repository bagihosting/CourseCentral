'use server';
/**
 * @fileOverview A flow for generating course thumbnails using AI.
 *
 * - generateThumbnail - A function that handles the image generation process.
 * - GenerateThumbnailInput - The input type for the generateThumbnail function.
 * - GenerateThumbnailOutput - The return type for the generateThumbnail function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateThumbnailInputSchema = z.object({
  title: z.string().describe('The title of the course.'),
});

const GenerateThumbnailOutputSchema = z.object({
  imageUrl: z
    .string()
    .describe('The data URI of the generated thumbnail image.'),
});

export type GenerateThumbnailInput = z.infer<
  typeof GenerateThumbnailInputSchema
>;
export type GenerateThumbnailOutput = z.infer<
  typeof GenerateThumbnailOutputSchema
>;

export async function generateThumbnail(
  input: GenerateThumbnailInput
): Promise<GenerateThumbnailOutput> {
  return generateThumbnailFlow(input);
}

const generateThumbnailFlow = ai.defineFlow(
  {
    name: 'generateThumbnailFlow',
    inputSchema: GenerateThumbnailInputSchema,
    outputSchema: GenerateThumbnailOutputSchema,
  },
  async (input) => {
    const prompt = `
      Generate a thumbnail image for an online course titled "${input.title}".
      The image must be in a 3D animation style, focusing on a single character.
      The main focus should be a friendly, engaging animated character with distinct Indonesian features (e.g., Southeast Asian skin tone, facial structure).
      The character should be wearing a modern, stylish batik shirt or dress with vibrant, intricate patterns.
      Include one subtle traditional accessory from a well-known Indonesian region (e.g., a blangkon from Java, an udeng from Bali, or a single element of Dayak ear ornamentation).
      The background should be simple, clean, and professional, using soft, complementary colors that make the character stand out.
      The overall style should be appealing, high-quality, and suitable for a course platform like Udemy.
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
