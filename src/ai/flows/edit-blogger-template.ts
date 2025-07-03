'use server';
/**
 * @fileOverview A flow for editing an existing Blogger template using AI.
 *
 * - editBloggerTemplate - A function that handles the template editing process.
 * - EditBloggerTemplateInput - The input type for the function.
 * - EditBloggerTemplateOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const EditBloggerTemplateInputSchema = z.object({
  templateCode: z.string().describe('The current, complete XML code for the Blogger template.'),
  editRequest: z.string().describe('The user\'s request for changes to the template (e.g., "change the primary color to blue", "add a two-column footer").'),
});

const EditBloggerTemplateOutputSchema = z.object({
  editedTemplateCode: z
    .string()
    .describe('The complete, valid XML code for the Blogger template after applying the requested edits.'),
});

export type EditBloggerTemplateInput = z.infer<
  typeof EditBloggerTemplateInputSchema
>;
export type EditBloggerTemplateOutput = z.infer<
  typeof EditBloggerTemplateOutputSchema
>;

export async function editBloggerTemplate(
  input: EditBloggerTemplateInput
): Promise<EditBloggerTemplateOutput> {
  return editBloggerTemplateFlow(input);
}

const editBloggerTemplateFlow = ai.defineFlow(
  {
    name: 'editBloggerTemplateFlow',
    inputSchema: EditBloggerTemplateInputSchema,
    outputSchema: EditBloggerTemplateOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'editBloggerTemplatePrompt',
      input: { schema: EditBloggerTemplateInputSchema },
      output: { schema: EditBloggerTemplateOutputSchema },
      prompt: `
        You are an expert Blogger theme developer with a keen eye for modern, smart UI design. Your task is to modify an existing Blogger template based on a user's request.
        You must carefully apply the changes while preserving the overall structure, responsiveness, and validity of the original template. The goal is to maintain or improve the clean, modern aesthetic.

        **User's Edit Request:**
        "{{{editRequest}}}"

        **CRITICAL INSTRUCTIONS:**
        1.  **Analyze the Request**: Understand what the user wants to change. This could be colors, fonts, layout, adding/removing sections, etc.
        2.  **Modify the Code**: Apply the requested changes directly to the provided XML code.
        3.  **Maintain Validity & Quality**: The final output MUST be a single, complete, and well-formed Blogger XML template. Do not break the XML structure. Preserve responsiveness and the clean, modern UI design.
        4.  **Preserve Core Features**: Do not remove the Blogger Theme Designer variables (\`<b:variable>\`), sections (\`<b:section>\`), or widgets (\`<b:widget>\`) unless the user specifically asks for it.
        5.  **Return Full Code**: Provide the entire, modified XML code. Do not provide only the changed snippets or a description of the changes. The output must be the complete file content.

        **Original Template Code to Modify:**
        \`\`\`xml
        {{{templateCode}}}
        \`\`\`
      `,
    });

    const { output } = await prompt(input);
    
    if (!output) {
      throw new Error('Template code editing failed.');
    }
    return output;
  }
);
