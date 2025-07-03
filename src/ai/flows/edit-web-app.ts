'use server';
/**
 * @fileOverview A flow for editing a generated web application boilerplate.
 *
 * - editWebApp - A function that handles the web app editing process.
 * - EditWebAppInput - The input type for the function.
 * - EditWebAppOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { GenerateWebAppOutput } from './generate-web-app'; // Reuse the output schema

const EditWebAppInputSchema = z.object({
  files: z.array(z.object({
    fileName: z.string(),
    filePath: z.string(),
    fileContent: z.string(),
  })).describe('An array of the current files of the web application.'),
  editRequest: z.string().describe('The user\'s request for changes to the application (e.g., "change the primary color to blue", "add a contact form").'),
});

// The output is the same as the generation output
const EditWebAppOutputSchema = z.object({
  files: z.array(z.object({
    fileName: z.string().describe('The name of the file (e.g., "page.tsx").'),
    filePath: z.string().describe('The full path of the file within the project (e.g., "src/app/page.tsx").'),
    fileContent: z.string().describe('The complete source code or content for the file.'),
  })).describe('The updated array of files representing the web application structure.'),
  previewHtml: z.string().describe('A simple, self-contained HTML representation of the main page for previewing purposes, reflecting the new changes.'),
});

export type EditWebAppInput = z.infer<typeof EditWebAppInputSchema>;
export type EditWebAppOutput = GenerateWebAppOutput; // It's the same shape

export async function editWebApp(input: EditWebAppInput): Promise<EditWebAppOutput> {
  return editWebAppFlow(input);
}

const prompt = ai.definePrompt({
  name: 'editWebAppPrompt',
  input: { schema: EditWebAppInputSchema },
  output: { schema: EditWebAppOutputSchema },
  prompt: `
    You are an expert full-stack web developer specializing in the Next.js ecosystem. Your task is to modify an existing web application boilerplate based on a user's request.
    The application uses a 'use-local-storage.ts' hook for client-side state management.

    **User's Edit Request:**
    "{{{editRequest}}}"

    **CRITICAL INSTRUCTIONS:**
    1.  **Analyze the Request**: Understand what the user wants to change. This could be colors in \`globals.css\`, layout or functionality in \`page.tsx\`, logic in the \`use-local-storage.ts\` hook, or dependencies in \`package.json\`.
    2.  **Modify the Code**: Apply the requested changes to the provided file contents. You may need to modify multiple files to fulfill one request. For example, adding a "due date" field might require changing the data structure in \`page.tsx\` and updating the form in the UI.
    3.  **Return All Files**: You MUST return the complete content for ALL original files, even if you didn't modify them. The output \`files\` array must contain all the original files, including \`.env\` and \`src/hooks/use-local-storage.ts\`.
    4.  **Update Preview**: After modifying the files, generate a new \`previewHtml\`. This should be a single, self-contained HTML document that visually represents the updated \`src/app/page.tsx\` and includes the styles from \`src/app/globals.css\` in a \`<style>\` tag, plus a CDN link to Tailwind CSS for utility classes. This is crucial for the user to see the result of their edit.

    **Original Files to Modify (in JSON format):**
    {{{files}}}
  `,
});

const editWebAppFlow = ai.defineFlow(
  {
    name: 'editWebAppFlow',
    inputSchema: EditWebAppInputSchema,
    outputSchema: EditWebAppOutputSchema,
  },
  async (input) => {
    // Pass the input object directly.
    // The {{{files}}} syntax in the prompt template will automatically convert
    // the files array into a JSON string for the LLM.
    const { output } = await prompt(input);
    
    if (!output) {
      throw new Error('Web application editing failed.');
    }
    return output;
  }
);
