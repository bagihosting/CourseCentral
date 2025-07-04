
'use server';
/**
 * @fileOverview A flow for generating a complete backend web application boilerplate.
 *
 * - generateWebApp - A function that handles the web app generation process.
 * - GenerateWebAppInput - The input type for the function.
 * - GenerateWebAppOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateWebAppInputSchema = z.object({
  appName: z.string().describe('The name of the application, used for package.json (e.g., "my-awesome-app").'),
  appDescription: z.string().optional().describe('A detailed description of what the application should do.'),
  cloneUrl: z.string().url().optional().describe('The URL of a website to visually clone for the UI.'),
});

const GenerateWebAppOutputSchema = z.object({
  files: z.array(z.object({
    fileName: z.string().describe('The name of the file (e.g., "page.tsx").'),
    filePath: z.string().describe('The full path of the file within the project (e.g., "src/app/page.tsx").'),
    fileContent: z.string().describe('The complete source code or content for the file.'),
  })).describe('An array of files representing the generated web application structure.'),
  previewHtml: z.string().describe('A simple, self-contained HTML representation of the main page for previewing purposes. It should include styles from globals.css inside a <style> tag and a Tailwind CDN script.'),
  explanation: z.string().describe('A detailed, step-by-step explanation of how the generated files work together, written like a mini-course in Markdown format. It should explain the purpose of each file and how they connect, starting from a blank canvas to a full application.'),
});

export type GenerateWebAppInput = z.infer<typeof GenerateWebAppInputSchema>;
export type GenerateWebAppOutput = z.infer<typeof GenerateWebAppOutputSchema>;

export async function generateWebApp(input: GenerateWebAppInput): Promise<GenerateWebAppOutput> {
  return generateWebAppFlow(input);
}

const generateWebAppFlow = ai.defineFlow(
  {
    name: 'generateWebAppFlow',
    inputSchema: GenerateWebAppInputSchema,
    outputSchema: GenerateWebAppOutputSchema,
  },
  async (input) => {
    // This feature is temporarily disabled for security reasons.
    throw new Error('Fitur "AI Web App Generator" dinonaktifkan sementara untuk alasan keamanan.');
  }
);
