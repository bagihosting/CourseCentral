'use server';
/**
 * @fileOverview A flow for editing an academic paper using AI.
 *
 * - editMakalah - A function that handles the paper editing process.
 * - EditMakalahInput - The input type for the function.
 * - EditMakalahOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const EditMakalahInputSchema = z.object({
  currentContent: z.string().describe('The current, complete content of the paper, including the bibliography.'),
  editRequest: z.string().describe('The user\'s request for changes to the paper (e.g., "add more detail to the introduction", "expand the conclusion").'),
});

const EditMakalahOutputSchema = z.object({
  editedContent: z
    .string()
    .describe('The complete, edited content of the paper in Markdown format, after applying the requested changes.'),
});

export type EditMakalahInput = z.infer<typeof EditMakalahInputSchema>;
export type EditMakalahOutput = z.infer<typeof EditMakalahOutputSchema>;

export async function editMakalah(
  input: EditMakalahInput
): Promise<EditMakalahOutput> {
  return editMakalahFlow(input);
}

const editMakalahFlow = ai.defineFlow(
  {
    name: 'editMakalahFlow',
    inputSchema: EditMakalahInputSchema,
    outputSchema: EditMakalahOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'editMakalahPrompt',
      input: { schema: EditMakalahInputSchema },
      output: { schema: EditMakalahOutputSchema },
      prompt: `
        You are an expert academic editor. Your task is to modify an existing academic paper based on a user's request.
        You must carefully apply the changes while preserving the academic tone, structure, and integrity of the original paper. The language must remain formal Indonesian.

        **User's Edit Request:**
        "{{{editRequest}}}"

        **CRITICAL INSTRUCTIONS:**
        1.  **Analyze the Request**: Understand what the user wants to change. This could involve adding content, rephrasing sections, expanding on points, or correcting information.
        2.  **Modify the Content**: Apply the requested changes directly to the provided paper content.
        3.  **Maintain Quality**: The final output must be a single, complete, and well-structured paper in Markdown format. Preserve the formal academic tone.
        4.  **Preserve Structure**: Do not remove core sections like Introduction, Discussion, Conclusion, or Bibliography unless specifically requested.
        5.  **Return Full Content**: Provide the entire, modified paper content as a single Markdown string. Do not provide only the changed snippets.

        **Original Paper Content to Modify:**
        \`\`\`markdown
        {{{currentContent}}}
        \`\`\`
      `,
    });

    const { output } = await prompt(input);
    
    if (!output) {
      throw new Error('Paper editing failed.');
    }
    return output;
  }
);
