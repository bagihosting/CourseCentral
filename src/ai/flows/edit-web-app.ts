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

const EditWebAppInputSchema = z.object({
  files: z.array(z.object({
    fileName: z.string(),
    filePath: z.string(),
    fileContent: z.string(),
  })).describe('An array of the current files of the web application.'),
  editRequest: z.string().describe('The user\'s request for changes to the application (e.g., "change the primary color to blue", "add a contact form").'),
});

const EditWebAppOutputSchema = z.object({
  files: z.array(z.object({
    fileName: z.string().describe('The name of the file (e.g., "page.tsx").'),
    filePath: z.string().describe('The full path of the file within the project (e.g., "src/app/page.tsx").'),
    fileContent: z.string().describe('The complete source code or content for the file.'),
  })).describe('The updated array of files representing the web application structure.'),
  previewHtml: z.string().describe('A simple, self-contained HTML representation of the main page for previewing purposes, reflecting the new changes, including styles from globals.css and a Tailwind CDN script.'),
  explanation: z.string().describe('An updated, step-by-step explanation that reflects the recent changes made to the application. It should explain what was modified and how the new code works in Markdown format.'),
});

export type EditWebAppInput = z.infer<typeof EditWebAppInputSchema>;
export type EditWebAppOutput = z.infer<typeof EditWebAppOutputSchema>;

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
    1.  **Analyze the Request**: Understand what the user wants to change. This could be colors in \\\`globals.css\\\`, layout or functionality in \\\`page.tsx\\\`, logic in the \\\`use-local-storage.ts\\\` hook, or dependencies in \\\`package.json\\\`.
    2.  **Modify the Code**: Apply the requested changes to the provided file contents. You may need to modify multiple files to fulfill one request. For example, adding a "due date" field might require changing the data structure in \\\`page.tsx\\\` and updating the form in the UI.
    3.  **Return All Files**: You MUST return the complete content for ALL original files, even if you didn't modify them. The output \\\`files\\\` array must contain all the original files, including \\\`.env\\\` and \\\`src/hooks/use-local-storage.ts\\\`.
    4.  **Update Preview**: After modifying the files, generate a new \`previewHtml\`. This must be a single, self-contained HTML document that visually represents the updated \`src/app/page.tsx\` as a **production-like static preview**. To make it realistic, you MUST:
        a.  Create a full HTML structure (\`<html><head>...</head><body>...</body></html>\`).
        b.  In the \`<head>\`, add \`<script src="https://cdn.tailwindcss.com"></script>\` to enable Tailwind utility classes.
        c.  In the \`<head>\`, copy the **entire content** of the updated \`globals.css\` file and place it inside a \`<style>\` tag.
        d.  In the \`<body>\`, convert the JSX from the updated \`page.tsx\` into plain HTML.
        e.  **IMPORTANT FOR REALISM**: If the page is supposed to display a list of items, you MUST **hardcode 2-3 realistic example items** directly into the HTML to make the preview look populated and real. Do not render an empty state.
        This is crucial for the user to see the result of their edit.
    5.  **Update Explanation**: After modifying the files and the preview, update the \\\`explanation\` field. Explain what changes you made based on the user's request and how the new or modified code works within the application's structure. The explanation should be clear and in Markdown format.

    **Original Files to Modify (in JSON format):**
    {{{json files}}}
  `,
});

const editWebAppFlow = ai.defineFlow(
  {
    name: 'editWebAppFlow',
    inputSchema: EditWebAppInputSchema,
    outputSchema: EditWebAppOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    
    if (!output) {
      throw new Error('Web application editing failed.');
    }
    return output;
  }
);
