
'use server';
/**
 * @fileOverview A flow for generating promotional text for affiliates.
 *
 * - generateAffiliatePromo - A function that handles the text generation process.
 * - GenerateAffiliatePromoInput - The input type for the function.
 * - GenerateAffiliatePromoOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateAffiliatePromoInputSchema = z.object({
  referralLink: z.string().url().describe('The affiliate\'s unique referral link.'),
});

const GenerateAffiliatePromoOutputSchema = z.object({
  promoTexts: z.array(z.string()).describe('An array of 3-5 engaging and clickbait-style promotional texts for social media.'),
});

export type GenerateAffiliatePromoInput = z.infer<
  typeof GenerateAffiliatePromoInputSchema
>;
export type GenerateAffiliatePromoOutput = z.infer<
  typeof GenerateAffiliatePromoOutputSchema
>;

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
    const prompt = `
      You are an expert social media marketer and copywriter specializing in creating viral, high-converting promotional content for online courses.
      Your task is to generate 3 to 5 short, engaging, and "clickbait"-style promotional texts in Bahasa Indonesia.
      These texts will be used by affiliates to post on social media like Facebook, Twitter, and Instagram.
      
      The goal is to pique curiosity and encourage clicks on the referral link. The referral link itself should NOT be included in the generated texts; it will be appended later.

      **CRITICAL INSTRUCTIONS:**
      1.  **Generate 3-5 Variations**: Create a list of 3 to 5 unique promotional texts.
      2.  **Use a "Clickbait" but Professional Style**: The tone should be exciting and create a sense of urgency or exclusivity, but remain trustworthy. Use questions, surprising statements, and highlight strong benefits.
      3.  **Focus on Benefits**: Emphasize what users can achieve, e.g., "dapat kerjaan baru", "naik gaji", "skill paling dicari 2024".
      4.  **Keep it Short & Punchy**: Texts should be ideal for social media feeds, easily scannable.
      5.  **Use Emojis**: Sparingly use relevant emojis to make the text more visually appealing.
      6.  **DO NOT Include the URL**: Do not include the referral link "{{{referralLink}}}" in your response. The application will add it automatically.

      **Example Ideas to Inspire You:**
      - "Baru tahu ada cara gampang belajar coding sampai dapet kerja? 😱 Skill ini yang dicari perusahaan besar sekarang!"
      - "Bosen gaji segitu-gitu aja? 😩 3 dari 5 orang yang ikut kursus ini karirnya langsung melejit. Kamu kapan?"
      - "Jangan sampai ketinggalan! Ini dia skill digital paling wajib dikuasai tahun ini kalau mau aman. 💡 Klik buat cari tahu!"
    `;

    const { output } = await ai.generate({
      prompt: prompt,
      output: {
        schema: GenerateAffiliatePromoOutputSchema,
      },
    });

    if (!output || !output.promoTexts || output.promoTexts.length === 0) {
      throw new Error('Gagal menghasilkan teks promosi.');
    }

    return output;
  }
);
