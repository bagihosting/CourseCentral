
'use server';
/**
 * @fileOverview A flow for generating affiliate promotional text.
 *
 * - generateAffiliatePromo - A function that handles the promo text generation.
 * - GenerateAffiliatePromoInput - The input type for the function.
 * - GenerateAffiliatePromoOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateAffiliatePromoInputSchema = z.object({
  referralLink: z.string().url().describe('The unique referral link for the affiliate.'),
});

const GenerateAffiliatePromoOutputSchema = z.object({
  promoTexts: z.array(z.string()).describe('An array of 3-5 catchy, clickbait-style marketing texts for social media.'),
});

export type GenerateAffiliatePromoInput = z.infer<typeof GenerateAffiliatePromoInputSchema>;
export type GenerateAffiliatePromoOutput = z.infer<typeof GenerateAffiliatePromoOutputSchema>;

export async function generateAffiliatePromo(
  input: GenerateAffiliatePromoInput
): Promise<GenerateAffiliatePromoOutput> {
  return generateAffiliatePromoFlow(input);
}

const generateAffiliatePromoFlow = ai.defineFlow(
  {
    name: 'generateAffiliatePromoFlow',
    inputSchema: GenerateAffiliatePromoInputSchema,
    outputSchema: GenerateAffiliatePromoOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'generateAffiliatePromoPrompt',
      input: { schema: GenerateAffiliatePromoInputSchema },
      output: { schema: GenerateAffiliatePromoOutputSchema },
      prompt: `
        You are an expert digital marketing copywriter specializing in creating high-converting, clickbait-style promotional content for social media.
        Your task is to generate 3-5 short, persuasive, and exciting promotional texts in Bahasa Indonesia for an affiliate program.
        The goal is to make people curious and encourage them to click the referral link to learn how to make money online quickly.

        **CRITICAL INSTRUCTIONS:**
        1.  **Clickbait Style**: Use attention-grabbing headlines and phrases. Use rhetorical questions, surprising statements, or promise a secret to be revealed. Examples: "BOCOR! Cara Dapat Cuan dari Internet Terungkap!", "Cuma Modal Klik, Bisa Dapat Jutaan? Kok Bisa?", "Stop Scrolling! Ini Rahasia Gaji Tambahan yang Disembunyikan Influencer!".
        2.  **Promise Value**: Hint at the promise of earning money easily or quickly from the internet.
        3.  **Call to Action**: Every text MUST end with a strong call to action that encourages clicking the link.
        4.  **Include the Link**: Every text MUST include the placeholder "{{{referralLink}}}" at the end.
        5.  **Language & Tone**: Use modern, engaging, and slightly informal Bahasa Indonesia, suitable for social media platforms like TikTok, Instagram, and Facebook. Use emojis to make it more appealing.
        6.  **Variety**: Provide 3 to 5 different variations of the text.

        **Referral Link to Include:**
        {{{referralLink}}}
      `,
    });

    const { output } = await prompt(input);

    if (!output || !output.promoTexts || output.promoTexts.length === 0) {
      throw new Error('Gagal membuat teks promosi. Model AI tidak mengembalikan konten yang valid.');
    }
    return output;
  }
);
