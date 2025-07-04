
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
      You are a creative director and 3D artist specializing in creating culturally rich and inviting brand imagery.
      Your task is to generate a stunning hero image for the main landing page of an online learning platform.
      The image should reflect the platform's headline: "${input.headline}".

      **Image Requirements:**
      
      1.  **Character**:
          *   **Style**: Must be a friendly and engaging 3D animated character with distinct Indonesian features.
          *   **Attire**: The character should wear stylish, modern Indonesian traditional attire (e.g., a modern batik shirt, a sleek kebaya) and one or two subtle but recognizable accessories from a specific Indonesian region (e.g., a Dayak beaded necklace, a Balinese udeng, a Javanese blangkon).
          *   **Pose**: The character should have an inviting pose, looking towards the viewer as if to welcome them to start their learning journey.

      2.  **Background & Composition**:
          *   The background must be clean, abstract, and professional. It should use a vibrant yet soft color palette that would complement a modern website design, evoking a sense of learning and technology.
          *   The overall composition should be visually appealing, modern, and suitable for a website's main banner.

      3.  **CRITICAL RULE**:
          *   The image MUST NOT contain any text, words, or letters.
          *   The final output should be a high-quality, polished 3D render.
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
