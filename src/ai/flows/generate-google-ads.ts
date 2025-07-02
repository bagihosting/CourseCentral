'use server';
/**
 * @fileOverview A flow for generating Google Ads copy.
 *
 * - generateGoogleAds - A function that handles the ad copy generation process.
 * - GenerateGoogleAdsInput - The input type for the function.
 * - GenerateGoogleAdsOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateGoogleAdsInputSchema = z.object({
  productName: z.string().describe('The name of the product or service being advertised.'),
  targetAudience: z.string().describe('The target audience for the ads.'),
  keyFeatures: z.string().describe('Key features or selling points of the product/service.'),
});

const GenerateGoogleAdsOutputSchema = z.object({
  headlines: z
    .array(z.string())
    .describe('An array of 3 to 5 compelling headlines. Each headline must be 30 characters or less.'),
  descriptions: z
    .array(z.string())
    .describe('An array of 2 to 3 persuasive descriptions. Each description must be 90 characters or less.'),
  keywords: z
    .array(z.string())
    .describe('A list of relevant keywords for the ad group.'),
});

export type GenerateGoogleAdsInput = z.infer<
  typeof GenerateGoogleAdsInputSchema
>;
export type GenerateGoogleAdsOutput = z.infer<
  typeof GenerateGoogleAdsOutputSchema
>;

export async function generateGoogleAds(
  input: GenerateGoogleAdsInput
): Promise<GenerateGoogleAdsOutput> {
  return generateGoogleAdsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateGoogleAdsPrompt',
  input: { schema: GenerateGoogleAdsInputSchema },
  output: { schema: GenerateGoogleAdsOutputSchema },
  prompt: `
    You are a Google Ads expert and a professional copywriter. Your task is to generate high-converting ad copy based on the provided product information.
    You must adhere to Google Ads character limits strictly.

    **Product Information:**
    - Product/Service Name: {{{productName}}}
    - Target Audience: {{{targetAudience}}}
    - Key Features/Selling Points: {{{keyFeatures}}}

    **CRITICAL INSTRUCTIONS:**
    1.  **Headlines**: Generate 3-5 unique, attention-grabbing headlines. Each headline MUST be 30 characters or less.
    2.  **Descriptions**: Generate 2-3 compelling descriptions that highlight the benefits and include a call-to-action. Each description MUST be 90 characters or less.
    3.  **Keywords**: Generate a list of 10-15 relevant keywords, including a mix of broad match, phrase match, and long-tail keywords.
    4.  **Language**: Write all copy in Bahasa Indonesia.
    5.  **Format**: Return the output in the specified JSON format.
  `,
});

const generateGoogleAdsFlow = ai.defineFlow(
  {
    name: 'generateGoogleAdsFlow',
    inputSchema: GenerateGoogleAdsInputSchema,
    outputSchema: GenerateGoogleAdsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    
    if (!output) {
      throw new Error('Google Ads copy generation failed.');
    }
    return output;
  }
);
