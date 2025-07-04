'use server';
/**
 * @fileOverview A flow for generating a complete academic paper.
 *
 * - generateMakalah - A function that handles the paper generation process.
 * - GenerateMakalahInput - The input type for the function.
 * - GenerateMakalahOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateMakalahInputSchema = z.object({
  title: z.string().describe('The title of the academic paper.'),
  major: z.string().describe('The academic major or field of study for the paper.'),
  pageCount: z.number().int().positive().describe('The desired number of pages for the paper.'),
});

const GenerateMakalahOutputSchema = z.object({
  paperContent: z.string().describe('The main content of the paper, formatted in Markdown. This should include sections like Introduction, Discussion, and Conclusion.'),
  bibliography: z.string().describe('A separate bibliography or reference list in a standard academic format, also in Markdown.'),
});

export type GenerateMakalahInput = z.infer<typeof GenerateMakalahInputSchema>;
export type GenerateMakalahOutput = z.infer<typeof GenerateMakalahOutputSchema>;

export async function generateMakalah(
  input: GenerateMakalahInput
): Promise<GenerateMakalahOutput> {
  return generateMakalahFlow(input);
}

const generateMakalahFlow = ai.defineFlow(
  {
    name: 'generateMakalahFlow',
    inputSchema: GenerateMakalahInputSchema,
    outputSchema: GenerateMakalahOutputSchema,
  },
  async (input) => {
    // A standard academic page has approximately 250 words.
    const wordCount = input.pageCount * 250;

    const prompt = ai.definePrompt({
      name: 'generateMakalahPrompt',
      input: { schema: GenerateMakalahInputSchema.extend({ wordCount: z.number() }) },
      output: { schema: GenerateMakalahOutputSchema },
      prompt: `
        You are an expert academic assistant. Your task is to write a complete, well-structured academic paper based on the provided details.
        The paper must be written in formal academic Indonesian.

        **Paper Details:**
        - Title: "{{{title}}}"
        - Major/Field: "{{{major}}}"
        - Estimated Word Count: {{{wordCount}}} words (approximately {{{pageCount}}} pages)

        **CRITICAL INSTRUCTIONS:**

        1.  **Structure the Paper**: The paper must be clearly structured. Generate content for the following sections:
            -   **Pendahuluan (Introduction)**: Provide background, state the problem, and outline the paper's objectives.
            -   **Pembahasan (Discussion)**: This should be the main body of the paper. Create logical sub-headings (e.g., using '##' or '###' in Markdown) to organize the content. Discuss the topic in depth, drawing on established theories and concepts relevant to the major.
            -   **Kesimpulan (Conclusion)**: Summarize the key findings and provide a concluding statement.

        2.  **Generate a Bibliography**: Create a separate, relevant bibliography section ('Daftar Pustaka'). The references should be plausible and appropriate for the topic and major. Format it as a Markdown list.

        3.  **Content Quality**: The content must be coherent, logical, and written in a formal, academic style suitable for university-level work.

        4.  **Word Count**: Adhere as closely as possible to the estimated word count of {{{wordCount}}} words for the main content (excluding the bibliography).

        5.  **Output Format**: You must provide the output as two distinct fields: 'paperContent' (containing the Introduction, Discussion, and Conclusion) and 'bibliography' (containing only the reference list). Both should be in Markdown format.
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
    
    const { output } = await prompt({ ...input, wordCount });
    
    if (!output || !output.paperContent || !output.bibliography) {
      throw new Error('Paper generation failed. The model did not return valid content.');
    }
    return output;
  }
);
