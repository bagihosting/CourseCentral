
'use server';
/**
 * @fileOverview A flow for generating a single-page web application.
 *
 * - generateInstantApp - A function that handles the app generation process.
 * - GenerateInstantAppInput - The input type for the function.
 * - GenerateInstantAppOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateInstantAppInputSchema = z.object({
  appDescription: z.string().describe('A detailed description of what the single-page application should do.'),
});

const GenerateInstantAppOutputSchema = z.object({
  pageTsxContent: z.string().describe('The complete source code for `src/app/page.tsx`. This must be a client component that uses the `useLocalStorage` hook and ShadCN UI components.'),
  explanation: z.string().describe('A detailed explanation of how `page.tsx` works, focusing on state management and component usage.'),
  previewHtml: z.string().describe('A simple, self-contained HTML representation of the page for previewing purposes. It must include a Tailwind CDN script for styling.'),
});

export type GenerateInstantAppInput = z.infer<typeof GenerateInstantAppInputSchema>;
export type GenerateInstantAppOutput = z.infer<typeof GenerateInstantAppOutputSchema>;

export async function generateInstantApp(input: GenerateInstantAppInput): Promise<GenerateInstantAppOutput> {
  return generateInstantAppFlow(input);
}

const generateInstantAppFlow = ai.defineFlow(
  {
    name: 'generateInstantAppFlow',
    inputSchema: GenerateInstantAppInputSchema,
    outputSchema: GenerateInstantAppOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
        name: 'generateInstantAppPrompt',
        input: { schema: GenerateInstantAppInputSchema },
        output: { schema: GenerateInstantAppOutputSchema },
        prompt: `
            You are an expert Next.js developer specializing in creating single-page applications using ShadCN UI and Tailwind CSS.
            Your task is to generate the complete code for a single file, \`src/app/page.tsx\`, based on a user's description. You will also provide a self-contained HTML preview and an explanation.

            **User's App Description:**
            "{{{appDescription}}}"

            **CRITICAL INSTRUCTIONS:**

            1.  **Generate \`page.tsx\` Content**:
                - The file MUST start with \`'use client';\`. This is mandatory.
                - The application logic must be fully contained within this single component.
                - It MUST use the custom hook \`useLocalStorage\` for all state that needs to be persisted. The hook must be imported from \`@/hooks/use-local-storage\`.
                  Example: \`import { useLocalStorage } from '@/hooks/use-local-storage';\` followed by \`const [tasks, setTasks] = useLocalStorage('tasks', []);\`.
                - The UI MUST be built exclusively using ShadCN UI components (e.g., Card, Button, Input, Label, Checkbox, etc.) imported from \`@/components/ui/...\`.
                - The entire component must be wrapped in a single root element, like a \`<main>\` or \`<div>\`.
                - Provide the **ENTIRE, final content** for the \`src/app/page.tsx\` file. Do not include explanations or markdown formatting around the code.

            2.  **Generate HTML Preview**:
                - Create a single, self-contained HTML file string.
                - This HTML MUST include the Tailwind CSS CDN script in the \`<head>\`: \`<script src="https://cdn.tailwindcss.com"></script>\`.
                - The \`<body>\` should contain the JSX from the generated \`page.tsx\`. You can simplify or use placeholders for the state logic, but the UI structure must be identical.
                - Do NOT include any JavaScript logic in the preview. It is for visual representation only.

            3.  **Generate Explanation**:
                - Write a clear, step-by-step explanation of how the generated \`page.tsx\` file works.
                - Specifically explain how state is managed using the \`useLocalStorage\` hook.
                - Describe the role of the main ShadCN UI components used in the application.
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
    
    if (!output || !output.pageTsxContent || !output.previewHtml) {
      throw new Error('Gagal membuat boilerplate. Model AI tidak mengembalikan output yang valid.');
    }
    return output;
  }
);
