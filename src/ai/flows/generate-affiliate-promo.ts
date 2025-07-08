
'use server';
/**
 * @fileOverview A flow for generating affiliate promotional texts.
 *
 * - generateAffiliatePromo - A function that handles the promo text generation process.
 * - GenerateAffiliatePromoInput - The input type for the function.
 * - GenerateAffiliatePromoOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateAffiliatePromoInputSchema = z.object({
  referralLink: z.string().url().describe('The user\'s unique affiliate referral link.'),
});

const GenerateAffiliatePromoOutputSchema = z.object({
  promoTexts: z
    .array(z.string())
    .describe('An array of 3-5 creative and clickbait-style promotional texts. Each text MUST include the placeholder "{{{referralLink}}}" where the referral link should be inserted.'),
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
    const prompt = ai.definePrompt({
      name: 'generateAffiliatePromoPrompt',
      input: { schema: GenerateAffiliatePromoInputSchema },
      output: { schema: GenerateAffiliatePromoOutputSchema },
      prompt: `
        You are a highly skilled digital marketer and copywriter, specializing in creating viral, high-converting social media posts.
        Your task is to generate 3-5 short, punchy, and clickbait-style promotional texts for an online learning platform.
        The goal is to entice people to click the referral link and sign up.

        **Referral Link to Use:**
        {{{referralLink}}}

        **CRITICAL INSTRUCTIONS:**
        1.  **Generate 3-5 Texts**: Create a diverse set of promotional texts.
        2.  **Clickbait Style**: Use techniques like asking intriguing questions, highlighting massive benefits, creating urgency, or sparking curiosity. The tone should be exciting and shareable.
        3.  **Include the Link**: Each promotional text MUST include the exact placeholder "{{{referralLink}}}". This is where the user's actual link will be injected.
        4.  **Language**: All texts must be in Bahasa Indonesia.
        5.  **Be Creative**: Think about what would make you stop scrolling and click.

        **Examples of Good Clickbait Style (for inspiration):**
        - "Baru tau ternyata ada cara gampang belajar coding, hasilnya langsung keliatan! 🤯 Penasaran? Cek di sini: {{{referralLink}}}"
        - "Skill ini yang bikin gaji saya naik 2x lipat tahun lalu. Pelajari rahasianya di platform ini! 🔥 {{{referralLink}}}"
        - "Jangan sampai ketinggalan! Ribuan orang sudah upgrade karir mereka di sini. Kamu kapan? Daftar gratis: {{{referralLink}}}"
      `,
    });
    
    // The model will automatically substitute the placeholder in the final output.
    const { output } = await prompt(input);
    
    if (!output || !output.promoTexts) {
      throw new Error('Promo text generation failed.');
    }

    // Post-process to ensure the link is actually in the text.
    const finalTexts = output.promoTexts.map(text => 
        text.includes(input.referralLink) ? text : `${text} ${input.referralLink}`
    );

    return { promoTexts: finalTexts };
  }
);
