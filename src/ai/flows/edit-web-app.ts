
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
    // This feature is temporarily disabled for security reasons.
    throw new Error('Fitur "AI Web App Generator" dinonaktifkan sementara untuk alasan keamanan.');
  }
);
