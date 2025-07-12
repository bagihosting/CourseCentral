
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
      The image should be a visual representation of the course's topic, featuring a central character.

      **CRITICAL INSTRUCTIONS:**

      1.  **Character**:
          *   **Style**: Must be a friendly, engaging 3D animated character.
          *   **Identity**: The character must have distinct Indonesian features (e.g., Southeast Asian skin tone, facial structure).
          *   **Attire**: The character should wear modern, stylish attire relevant to the course topic (e.g., a modern batik shirt for a business course, a casual hoodie for a coding course).
      
      2.  **Concept & Background**:
          *   The character should be interacting with an object or concept related to the course title. For example, for "Belajar Animasi 3D", the character could be looking at a glowing 3D model. For "Manajemen Keuangan", they could be interacting with a floating chart.
          *   The background must be simple, clean, and professional, using soft, complementary colors that make the character and concept pop.
      
      3.  **ABSOLUTE RULE**: The image MUST NOT contain any text, words, or letters. The focus should be entirely on the visual storytelling. The final output must be a high-quality, polished 3D render suitable for a professional course platform.
    `;

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media) {
      throw new Error('Image generation failed. The model did not return any media, possibly due to safety filters. Try a different title.');
    }

    return { imageUrl: media.url };
  }
);
