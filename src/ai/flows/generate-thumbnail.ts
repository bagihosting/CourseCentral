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
      Generate a high-impact thumbnail image for an online course titled "${input.title}".

      The image must integrate two key elements seamlessly: a 3D character and compelling marketing text.

      1.  **The Character**:
          *   **Style**: Must be a friendly, engaging 3D animated character.
          *   **Identity**: The character must have distinct Indonesian features (e.g., Southeast Asian skin tone, facial structure).
          *   **Attire**: The character should wear a modern, stylish batik shirt or dress with vibrant, intricate patterns, and one subtle traditional Indonesian accessory (e.g., a blangkon, an udeng, or a Dayak ornament).
      
      2.  **The Text**:
          *   **Content**: Based on the course title, create a short, catchy, clickbait-style headline. For example, if the title is "Belajar Animasi 3D", the headline could be "Master 3D dalam 30 Hari!" or "Animasi Profesional Terungkap!". The text must be in Bahasa Indonesia.
          *   **Style**: The text must be rendered directly into the image using a bold, dynamic, and high-contrast font. The typography should be professional, eye-catching, and follow modern digital marketing design principles. It must be easily readable.
      
      3.  **Composition**:
          *   The character and the text should be the main focus. The text should be integrated cleverly with the character, perhaps overlapping slightly or positioned to draw the eye.
          *   The background must be simple, clean, and professional, using soft, complementary colors that make the character and text pop.
          *   The overall style must be high-quality, polished, and suitable for a leading course platform like Udemy.
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
