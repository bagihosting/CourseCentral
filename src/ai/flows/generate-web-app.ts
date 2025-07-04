
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
    const prompt = ai.definePrompt({
      name: 'generateWebAppPrompt',
      input: { schema: GenerateWebAppInputSchema },
      output: { schema: GenerateWebAppOutputSchema },
      prompt: `
        You are an expert full-stack developer tasked with generating a complete, production-ready web application boilerplate.
        The application must be built using the following modern tech stack:
        -   **Framework**: Next.js (App Router)
        -   **Language**: TypeScript
        -   **UI**: React, ShadCN UI Components
        -   **Styling**: Tailwind CSS
        -   **AI Integration**: Genkit
        -   **Validation**: Zod
        -   **Data Persistence**: Client-side localStorage

        **User's Request:**
        -   App Name: {{{appName}}}
        {{#if appDescription}}-   App Description: "{{{appDescription}}}"{{/if}}
        {{#if cloneUrl}}-   Clone UI from: {{{cloneUrl}}}{{/if}}

        **CRITICAL INSTRUCTIONS:**

        1.  **Generate Core Files**: You MUST generate the following files with complete, valid code:
            -   \`package.json\`: Include dependencies for next, react, react-dom, tailwindcss, shadcn components (e.g., @radix-ui/react-slot, class-variance-authority, clsx, tailwind-merge, lucide-react), genkit, @genkit-ai/googleai, zod.
            -   \`tailwind.config.ts\`: A standard Tailwind config for Next.js.
            -   \`src/app/globals.css\`: The standard ShadCN UI global stylesheet with CSS variables for a theme.
            -   \`src/app/page.tsx\`: The main application page. This should be a client component (\`'use client'\`) to handle state and localStorage. It should implement the core logic of the user's request. Use React Hooks (useState, useEffect) for state management.
            -   \`src/lib/utils.ts\`: The standard \`cn\` utility function for Tailwind CSS class merging.
            -   \`src/hooks/use-local-storage.ts\`: A custom hook for abstracting localStorage logic.
            -   (Optional) If AI is needed based on the description: \`src/ai/flows/example-flow.ts\`. This should be a Genkit flow using Zod for schemas.

        2.  **Code Quality**: All code must be clean, well-structured, and follow modern best practices. Use functional components and hooks. Ensure TypeScript types are used correctly.

        3.  **UI/UX**: Design a clean, modern, and intuitive user interface using ShadCN UI components (e.g., \`Card\`, \`Button\`, \`Input\`, \`Label\`, \`Textarea\`).

        4.  **Generate Preview HTML**: Create a single, self-contained HTML file that represents the main page (\`src/app/page.tsx\`). This HTML must:
            -   Include a Tailwind CSS CDN script: \`<script src="https://cdn.tailwindcss.com"></script>\`.
            -   Inject the full CSS from your generated \`src/app/globals.css\` into a \`<style>\` tag in the \`<head>\`.
            -   Render the JSX from \`src/app/page.tsx\` inside the \`<body>\`.

        5.  **Generate Explanation**: Write a detailed, step-by-step explanation in Markdown. Explain the purpose of each generated file, how they are connected, and provide a guide on how the user can run and extend the application.
      `,
    });
    
    const { output } = await prompt(input);
    
    if (!output) {
      throw new Error('Gagal membuat aplikasi. Model AI tidak mengembalikan output yang valid.');
    }
    return output;
  }
);
