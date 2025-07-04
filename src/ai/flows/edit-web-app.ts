
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

const editWebAppFlow = ai.defineFlow(
  {
    name: 'editWebAppFlow',
    inputSchema: EditWebAppInputSchema,
    outputSchema: EditWebAppOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
        name: 'editWebAppPrompt',
        input: { schema: EditWebAppInputSchema },
        output: { schema: EditWebAppOutputSchema },
        prompt: `
            You are an expert full-stack developer specializing in Next.js, React, ShadCN, Genkit, and Tailwind CSS.
            Your task is to modify an existing web application boilerplate based on a user's request. You must adhere to best practices for modern web development.

            **User's Edit Request:**
            "{{{editRequest}}}"

            **Current Application Files:**
            \`\`\`json
            {{{json files}}}
            \`\`\`

            **CRITICAL INSTRUCTIONS:**
            1.  **Analyze the Request**: Understand the user's goal. This could involve UI changes, adding new state, handling user input, or integrating a new feature.
            2.  **Apply Changes Logically**: Modify the provided files to implement the request. You can change existing files, but do not add or remove files.
            3.  **Maintain Stack Integrity**: Ensure the code remains within the specified tech stack: Next.js (App Router), React (with Hooks), TypeScript, ShadCN UI components, Tailwind CSS, and Genkit for any AI-related tasks.
            4.  **Full File Content**: For each file you modify, you MUST return its ENTIRE, final content. Do not provide diffs or partial snippets. If a file is unchanged, return its original content.
            5.  **Generate New Preview**: Create an updated, self-contained HTML preview of the main page ('src/app/page.tsx'). This HTML must:
                -   Be a single file.
                -   Include Tailwind CSS via the CDN script: \`<script src="https://cdn.tailwindcss.com"></script>\`.
                -   Inject the CSS from 'src/app/globals.css' into a \`<style>\` tag in the \`<head>\`.
                -   Render the JSX from 'src/app/page.tsx' inside the \`<body>\`.
            6.  **Update Explanation**: Rewrite the 'explanation' to describe the changes you made, why you made them, and how the new code works. This should be in Markdown format.
        `,
        config: {
            safetySettings: [
              {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_NONE',
              },
            ],
        },
    });
    
    const { output } = await prompt(input);
    
    if (!output) {
      throw new Error('Gagal mengedit aplikasi. Model AI tidak mengembalikan output yang valid.');
    }
    return output;
  }
);
