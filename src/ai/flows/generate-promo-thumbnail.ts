
'use server';
/**
 * @fileOverview A flow for generating promotional thumbnails for Scriptify.
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
      Generate a high-impact promotional thumbnail image for a brand called "Scriptify", an online certified course platform.

      The image must be extremely eye-catching and persuasive, designed to make people want to join.

      1.  **The Character**:
          *   **Style**: Must be a friendly, powerful, and engaging 3D animated superhero character.
          *   **Identity**: The character MUST have distinct Indonesian features (e.g., Southeast Asian skin tone, facial features visible through the mask's mouth/eye openings).
          *   **Attire**: The character must wear a full, modern superhero uniform, complete with a mask. The costume's color scheme should be professional and striking, perhaps incorporating the primary colors of the brand (purple and teal). The costume should feature a subtle "S" logo for Scriptify on the chest.
          *   **Pose**: The character should have a dynamic and inviting pose, confidently presenting or pointing towards the "Scriptify" brand name or the call-to-action text, as if revealing a secret to success.

      2.  **The Text**:
          *   **Content**: The image MUST include compelling, clickbait-style text. The main elements to include are "Scriptify" and "Kursus Online Bersertifikat". Combine these with a strong call-to-action. Examples: "SKILL DEWA TERUNGKAP! Klik di Sini!", "RAHASIA KARIER MELESAT!", or "Sertifikasi Instan, Gaji Meroket!".
          *   **Style**: The text must be rendered directly into the image using a bold, dynamic, and high-contrast font. The typography should be professional, layered, and follow modern digital marketing design principles. It must be very easy to read at a glance.

      3.  **Composition**:
          *   The character and the text must be the primary focus.
          *   The background should be abstract, dynamic, and professional, with glowing elements or speed lines that enhance the superhero theme and draw attention to the character and text.
          *   The overall style must be high-quality, polished, and suitable for a major online advertising campaign.
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
    