
'use server';
/**
 * @fileOverview A flow for generating promotional thumbnails for affiliates.
 *
 * - generatePromoThumbnail - A function that handles the image generation process.
 * - GeneratePromoThumbnailOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GeneratePromoThumbnailOutputSchema = z.object({
  imageUrl: z
    .string()
    .describe('The data URI of the generated promotional thumbnail image.'),
});

export type GeneratePromoThumbnailOutput = z.infer<
  typeof GeneratePromoThumbnailOutputSchema
>;

export async function generatePromoThumbnail(): Promise<GeneratePromoThumbnailOutput> {
  return generatePromoThumbnailFlow();
}

const generatePromoThumbnailFlow = ai.defineFlow(
  {
    name: 'generatePromoThumbnailFlow',
    outputSchema: GeneratePromoThumbnailOutputSchema,
  },
  async () => {
    const prompt = `
      Create a high-impact, professional promotional image for an online course platform, designed to be used by affiliates on social media.
      The image should be vibrant, attention-grabbing, and communicate success and learning.

      **Image Requirements:**

      1.  **Central Character**: Feature a 3D animated character with distinct Indonesian features, expressing joy and success (e.g., smiling, holding a graduation cap or a certificate). The character should be dressed in modern, smart-casual attire.
      
      2.  **Dynamic Text**: Integrate bold, dynamic, 3D-style text directly into the image. The text should be a powerful call-to-action in Bahasa Indonesia, such as "Upgrade Skill Kamu!", "Mulai Karir Impianmu!", or "Daftar & Raih Sukses!". The text must be a core part of the composition, not just an overlay.
      
      3.  **Background & Elements**:
          - The background should be abstract and professional, with a modern color palette (e.g., gradients of blue, purple, and orange).
          - Include floating abstract shapes and icons related to learning and technology, such as graduation caps, code brackets (<>), or lightbulbs, to create a sense of dynamism.

      4.  **Overall Style**: The final image must be a high-quality, polished 3D render, suitable for a leading online brand. It should look trustworthy and aspirational.
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
