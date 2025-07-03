'use server';
/**
 * @fileOverview A flow for generating basic soap and shampoo formulas.
 *
 * - generateSoapFormula - A function that handles the formula generation process.
 * - GenerateSoapFormulaInput - The input type for the function.
 * - GenerateSoapFormulaOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateSoapFormulaInputSchema = z.object({
  productType: z.enum([
      'dish-soap', 
      'face-wash', 
      'laundry-detergent', 
      'anti-dandruff-shampoo'
    ])
    .describe('The type of product formula to generate.'),
});

const GenerateSoapFormulaOutputSchema = z.object({
  productName: z.string().describe('A suitable name for the product.'),
  description: z.string().describe('A brief description of the formula and its purpose.'),
  ingredients: z.array(z.object({
    name: z.string().describe('The name of the ingredient (e.g., "Texapon", "Sodium Chloride").'),
    quantity: z.string().describe('The amount of the ingredient (e.g., "100", "10-15").'),
    unit: z.string().describe('The unit of measurement (e.g., "ml", "gram", "%").'),
  })).describe('A list of ingredients with their quantities and units.'),
  instructions: z.array(z.string()).describe('A list of step-by-step instructions for mixing the ingredients.'),
  safetyWarning: z.string().describe('A critical safety warning regarding the handling of chemicals and the need for professional verification.'),
});

export type GenerateSoapFormulaInput = z.infer<
  typeof GenerateSoapFormulaInputSchema
>;
export type GenerateSoapFormulaOutput = z.infer<
  typeof GenerateSoapFormulaOutputSchema
>;

export async function generateSoapFormula(
  input: GenerateSoapFormulaInput
): Promise<GenerateSoapFormulaOutput> {
  return generateSoapFormulaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSoapFormulaPrompt',
  input: { schema: GenerateSoapFormulaInputSchema },
  output: { schema: GenerateSoapFormulaOutputSchema },
  prompt: `
    You are an expert chemist specializing in formulating home and personal care products. Your task is to generate a basic, beginner-friendly formula for a specified product type.
    Use common, widely available ingredients in Indonesia (like Texapon, SLS, EDTA, NaCl, etc.). The formula should be simple and suitable for small-scale, educational production.

    **Product to Formulate:** {{{productType}}}

    **CRITICAL INSTRUCTIONS:**
    1.  **Generate a Complete Formula**: Provide a product name, description, a list of ingredients with quantities and units, and step-by-step instructions.
    2.  **Use Common Ingredients**: Stick to ingredients that are generally accessible for small-scale producers.
    3.  **Beginner-Friendly Instructions**: Write the instructions clearly, step-by-step, assuming the user is a beginner.
    4.  **MANDATORY SAFETY WARNING**: This is the most important part. The 'safetyWarning' field MUST contain a strong, clear warning. It must state that these are chemical substances, require protective gear (gloves, goggles), proper ventilation, and that the formula is for educational/prototyping purposes ONLY. It MUST strongly advise the user to have the final formula tested and verified by a professional chemist before any commercial use or distribution. DO NOT generate a weak warning.
    5.  **Language**: All output must be in Bahasa Indonesia.
  `,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      }
    ]
  }
});

const generateSoapFormulaFlow = ai.defineFlow(
  {
    name: 'generateSoapFormulaFlow',
    inputSchema: GenerateSoapFormulaInputSchema,
    outputSchema: GenerateSoapFormulaOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    
    if (!output) {
      throw new Error('Formula generation failed. The model did not return a valid output.');
    }
    // Ensure the safety warning is not empty
    if (!output.safetyWarning || output.safetyWarning.trim().length < 20) {
        output.safetyWarning = 'PERINGATAN KERAS: Anda bekerja dengan bahan kimia. Selalu gunakan alat pelindung diri (sarung tangan, kacamata pengaman) dan bekerja di area dengan ventilasi yang baik. Formula ini hanya untuk tujuan edukasi dan prototipe. Jangan digunakan atau dijual sebelum diuji dan diverifikasi oleh ahli kimia profesional. Produsen tidak bertanggung jawab atas penyalahgunaan formula ini.';
    }

    return output;
  }
);
