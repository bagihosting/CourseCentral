'use server';
/**
 * @fileOverview A flow for generating a basic business profile for a new UMKM.
 *
 * - generateUmkmProfile - A function that handles the profile generation process.
 * - GenerateUmkmProfileInput - The input type for the function.
 * - GenerateUmkmProfileOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateUmkmProfileInputSchema = z.object({
  businessType: z.string().describe('The type of business (e.g., "Kedai Kopi", "Toko Baju Online", "Jasa Cuci Sepatu").'),
  targetMarket: z.string().describe('The target market for the business (e.g., "Mahasiswa", "Keluarga muda", "Pecinta hewan").'),
  uniqueSellingPoint: z.string().describe('The unique strength or feature of the business (e.g., "Menggunakan biji kopi lokal", "Desain unik dan terbatas", "Pembersihan ramah lingkungan").'),
});

const GenerateUmkmProfileOutputSchema = z.object({
  businessName: z.string().describe('A creative and suitable name for the business.'),
  tagline: z.string().describe('A catchy and memorable tagline or slogan for the business.'),
  shortDescription: z.string().describe('A brief, engaging description of the business, its products/services, and its target audience.'),
  socialMediaPostIdea: z.string().describe('A short, ready-to-use social media post to announce the new business.'),
});

export type GenerateUmkmProfileInput = z.infer<
  typeof GenerateUmkmProfileInputSchema
>;
export type GenerateUmkmProfileOutput = z.infer<
  typeof GenerateUmkmProfileOutputSchema
>;

export async function generateUmkmProfile(
  input: GenerateUmkmProfileInput
): Promise<GenerateUmkmProfileOutput> {
  return generateUmkmProfileFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateUmkmProfilePrompt',
  input: { schema: GenerateUmkmProfileInputSchema },
  output: { schema: GenerateUmkmProfileOutputSchema },
  prompt: `
    You are a branding and marketing consultant specializing in helping new Micro, Small, and Medium Enterprises (UMKM) in Indonesia.
    Your task is to generate a basic but compelling business identity based on the user's provided details. The tone should be creative, modern, and encouraging.

    **Business Details:**
    - Business Type: {{{businessType}}}
    - Target Market: {{{targetMarket}}}
    - Unique Selling Point: {{{uniqueSellingPoint}}}

    **CRITICAL INSTRUCTIONS:**
    1.  **Business Name**: Generate 3-5 creative, catchy, and easy-to-remember business name suggestions. Pick the best one for the final output. The name should be suitable for the Indonesian market.
    2.  **Tagline**: Create a short, punchy tagline that captures the essence of the unique selling point.
    3.  **Short Description**: Write a concise, one-paragraph description of the business. It should explain what the business does, who it's for, and what makes it special.
    4.  **Social Media Post Idea**: Write a complete, engaging text for a first social media post (e.g., for Instagram or Facebook). The post should introduce the new business, its main product/service, and include a call-to-action and relevant hashtags.
    5.  **Language**: All output must be in Bahasa Indonesia.
  `,
});

const generateUmkmProfileFlow = ai.defineFlow(
  {
    name: 'generateUmkmProfileFlow',
    inputSchema: GenerateUmkmProfileInputSchema,
    outputSchema: GenerateUmkmProfileOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    
    if (!output) {
      throw new Error('UMKM profile generation failed.');
    }
    return output;
  }
);
