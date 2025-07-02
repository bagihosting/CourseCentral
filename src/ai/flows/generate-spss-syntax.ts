'use server';
/**
 * @fileOverview A flow for generating SPSS syntax from natural language.
 *
 * - generateSpssSyntax - A function that handles the syntax generation process.
 * - GenerateSpssSyntaxInput - The input type for the function.
 * - GenerateSpssSyntaxOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateSpssSyntaxInputSchema = z.object({
  analysisDescription: z.string().describe('A natural language description of the desired statistical analysis (e.g., "run a t-test to compare scores between group A and B").'),
});

const GenerateSpssSyntaxOutputSchema = z.object({
  spssSyntax: z
    .string()
    .describe('The generated, valid SPSS syntax code to perform the requested analysis.'),
  explanation: z
    .string()
    .describe('A clear, step-by-step explanation of what the generated syntax does, including the commands and subcommands used.'),
});

export type GenerateSpssSyntaxInput = z.infer<
  typeof GenerateSpssSyntaxInputSchema
>;
export type GenerateSpssSyntaxOutput = z.infer<
  typeof GenerateSpssSyntaxOutputSchema
>;

export async function generateSpssSyntax(
  input: GenerateSpssSyntaxInput
): Promise<GenerateSpssSyntaxOutput> {
  return generateSpssSyntaxFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSpssSyntaxPrompt',
  input: { schema: GenerateSpssSyntaxInputSchema },
  output: { schema: GenerateSpssSyntaxOutputSchema },
  prompt: `
    You are an expert statistician and a master of SPSS syntax. Your task is to generate valid SPSS syntax code based on a user's natural language request and provide a clear explanation of what the code does.

    **User's Analysis Request:**
    "{{{analysisDescription}}}"

    **CRITICAL INSTRUCTIONS:**
    1.  **Analyze the Request**: Identify the statistical test or procedure requested (e.g., T-Test, ANOVA, Regression, Frequencies, Descriptives). Identify the variables involved based on the user's description. Use placeholder variable names like 'group_variable', 'dependent_variable', 'independent_variable1' if specific names aren't provided.
    2.  **Generate SPSS Syntax**: Write the complete and correct SPSS syntax to perform the analysis. Use standard commands (e.g., \`T-TEST GROUPS\`, \`ONEWAY\`, \`REGRESSION\`, \`FREQUENCIES\`). End commands with a period (.).
    3.  **Generate Explanation**: Write a clear, concise, step-by-step explanation of the generated syntax. Explain each command and its main subcommands (e.g., what \`/VARIABLES=\`, \`/GROUP=\`, \`/MISSING=ANALYSIS\` do).
    4.  **Return Both**: Ensure your output contains both the \`spssSyntax\` and the \`explanation\` fields. Do not just return one or the other.
  `,
});

const generateSpssSyntaxFlow = ai.defineFlow(
  {
    name: 'generateSpssSyntaxFlow',
    inputSchema: GenerateSpssSyntaxInputSchema,
    outputSchema: GenerateSpssSyntaxOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    
    if (!output) {
      throw new Error('SPSS syntax generation failed.');
    }
    return output;
  }
);
