
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
        You are an expert Next.js developer. Your task is to generate a complete boilerplate for a simple web application based on the user's request.
        You MUST adhere strictly to the provided tech stack and file structure.

        **Tech Stack:**
        - Next.js (App Router, Client Component for \`page.tsx\`)
        - React (with Hooks)
        - TypeScript
        - ShadCN UI Components
        - Tailwind CSS
        - Client-side \`localStorage\` for state persistence.

        **User's Request:**
        - App Name: \`{{{appName}}}\`
        - App Description: "{{{appDescription}}}"
        {{#if cloneUrl}}- Visually clone the UI from: {{{cloneUrl}}}{{/if}}

        **Boilerplate Files to Generate:**

        You MUST generate the content for the following files. Do NOT add, remove, or rename any files from this list.

        1.  **\`package.json\`**:
            -   Set the "name" to \`{{{appName}}}\`.
            -   Include these exact dependencies: \`next\`, \`react\`, \`react-dom\`, \`tailwindcss\`, \`class-variance-authority\`, \`clsx\`, \`tailwind-merge\`, \`lucide-react\`, \`zod\`, \`genkit\`, \`@genkit-ai/googleai\`.
            -   Use standard \`dev\`, \`build\`, \`start\` scripts.
        2.  **\`tailwind.config.ts\`**:
            -   A standard Tailwind config for a Next.js App Router project.
        3.  **\`src/app/globals.css\`**:
            -   The standard ShadCN UI global stylesheet with CSS variables for a theme. Use a professional, modern theme.
        4.  **\`src/lib/utils.ts\`**:
            -   The standard \`cn\` utility function for Tailwind CSS class merging.
        5.  **\`src/hooks/use-local-storage.ts\`**:
            -   A generic React hook \`useLocalStorage\` to manage state with \`localStorage\`. It should handle getting/setting values and parsing JSON.
        6.  **\`src/app/page.tsx\`**:
            -   This MUST be a client component (\`'use client'\`).
            -   It must implement the core logic from the user's \`appDescription\`. If the description is simple, create a basic interactive UI. For example, for a "todo list", create an input field, an "Add" button, and a list to display todos.
            -   Use the \`useLocalStorage\` hook to persist the application's state.
            -   Use ShadCN UI components (\`Card\`, \`Button\`, \`Input\`, \`Label\`) for the UI.

        **Output Requirements:**

        -   **\`files\`**: An array of objects, each containing \`fileName\`, \`filePath\`, and the complete \`fileContent\`. Ensure you provide the full content for ALL files listed above.
        -   **\`previewHtml\`**: A self-contained HTML preview of \`src/app/page.tsx\`. It MUST include Tailwind via CDN (\`<script src="https://cdn.tailwindcss.com"></script>\`) and the CSS from \`globals.css\` in a \`<style>\` tag.
        -   **\`explanation\`**: A Markdown explanation of the generated code, focusing on how \`page.tsx\` uses \`useLocalStorage\` to manage state.
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
      throw new Error('Gagal membuat aplikasi. Model AI tidak mengembalikan output yang valid.');
    }
    return output;
  }
);
