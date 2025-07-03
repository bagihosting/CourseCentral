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
  appDescription: z.string().describe('A detailed description of what the application should do.'),
});

const GenerateWebAppOutputSchema = z.object({
  files: z.array(z.object({
    fileName: z.string().describe('The name of the file (e.g., "page.tsx").'),
    filePath: z.string().describe('The full path of the file within the project (e.g., "src/app/page.tsx").'),
    fileContent: z.string().describe('The complete source code or content for the file.'),
  })).describe('An array of files representing the generated web application structure.'),
  previewHtml: z.string().describe('A simple, self-contained HTML representation of the main page for previewing purposes. It should include styles from globals.css inside a <style> tag.'),
});

export type GenerateWebAppInput = z.infer<typeof GenerateWebAppInputSchema>;
export type GenerateWebAppOutput = z.infer<typeof GenerateWebAppOutputSchema>;

export async function generateWebApp(input: GenerateWebAppInput): Promise<GenerateWebAppOutput> {
  return generateWebAppFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWebAppPrompt',
  input: { schema: GenerateWebAppInputSchema },
  output: { schema: GenerateWebAppOutputSchema },
  prompt: `
    You are an expert full-stack web developer specializing in the Next.js ecosystem. Your task is to generate a complete, production-ready, and interactive boilerplate for a web application based on a user's description.
    The stack is strictly defined: Next.js (App Router), React, TypeScript, Tailwind CSS, ShadCN UI, and Genkit for AI features. The application must use a custom hook for client-side persistence with localStorage.

    **User's Request:**
    - App Name: {{{appName}}}
    - App Description: "{{{appDescription}}}"

    **CRITICAL INSTRUCTIONS:**

    Generate the file content for the full application structure below. The generated code must be high-quality, clean, and follow modern best practices.

    **FILE STRUCTURE TO GENERATE (8 FILES):**

    1.  **\\\`.env\\\`**:
        -   Generate an empty \\\`.env\\\` file. This is a placeholder for future environment variables.

    2.  **\\\`package.json\\\`**:
        -   Use the provided \\\`{{{appName}}}\\\` for the "name" field.
        -   Include these exact dependencies: "next", "react", "react-dom", "tailwindcss", "@genkit-ai/googleai", "genkit", "zod", "lucide-react", "clsx", "tailwind-merge", "tailwindcss-animate", "uuid", and ShadCN UI component packages like "@radix-ui/react-slot", "@radix-ui/react-dialog".
        -   Include dev dependencies: "typescript", "@types/react", "@types/node", "postcss", "@types/uuid".

    3.  **\\\`tailwind.config.ts\\\`**:
        -   Generate a standard Tailwind CSS configuration file for a Next.js project. Ensure it includes the content path for \\\`src/**/*.{ts,tsx}\\\` and the \\\`tailwindcss-animate\\\` plugin.

    4.  **\\\`src/app/globals.css\\\`**:
        -   Generate the standard CSS file used by ShadCN UI.
        -   It MUST define a professional, vibrant, and colorful palette for the HSL CSS variables for both light (\\\`:root\\\`) and dark (\\\`.dark\\\`) themes. Make it look good.

    5.  **\\\`src/app/layout.tsx\\\`**:
        -   Create the root layout component using TypeScript. Import and apply a standard font like 'Inter' from \\\`next/font/google\\\`.

    6.  **\\\`src/hooks/use-local-storage.ts\\\`**:
        -   Create a custom React hook named \\\`useLocalStorage\\\`. The file path MUST be \\\`src/hooks/use-local-storage.ts\\\`.
        -   It MUST be a client component ('use client').
        -   It must handle reading from and writing to localStorage, including JSON serialization/deserialization.
        -   It must be robust and handle the server-side rendering case where \\\`window\\\` is not available.
        -   Use this exact implementation:
            \\\`\\\`\\\`typescript
            'use client';
            import { useState, useEffect } from 'react';
            export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
              const [storedValue, setStoredValue] = useState<T>(() => {
                if (typeof window === 'undefined') {
                  return initialValue;
                }
                try {
                  const item = window.localStorage.getItem(key);
                  return item ? JSON.parse(item) : initialValue;
                } catch (error) {
                  console.error(error);
                  return initialValue;
                }
              });
              useEffect(() => {
                if (typeof window === 'undefined') return;
                try {
                  const valueToStore = value instanceof Function ? value(storedValue) : storedValue;
                  window.localStorage.setItem(key, JSON.stringify(valueToStore));
                } catch (error) {
                  console.log(error);
                }
              }, [key, storedValue]);
              return [storedValue, setStoredValue];
            }
            \\\`\\\`\\\`

    7.  **\\\`src/app/page.tsx\\\`**:
        -   This is the main interactive page. It MUST be a client component (\\\`'use client'\\\`).
        -   Generate a React component that implements a **complete, functional mini-application** based on the user's \\\`{{{appDescription}}}\\\`.
        -   It MUST import and use the \\\`useLocalStorage\\\` hook from \\\`src/hooks/use-local-storage.ts\\\` to manage its primary state (e.g., a list of todos, recipes, notes).
        -   The UI must be interactive. Implement features to **ADD and DELETE** items from the list stored in \\\`localStorage\\\`. Use the \\\`uuid\\\` package for generating unique IDs for new items.
        -   Use a variety of ShadCN UI components like \\\`<Card>\\\`, \\\`<Button>\\\`, \\\`<Input>\\\`, and \\\`<Dialog>\\\` (for adding new items) to build a rich user interface.
        -   The design must be colorful, clean, and modern, using the theme defined in \\\`globals.css\\\`.

    8.  **\\\`src/ai.ts\\\`**:
        -   Create a simple Genkit flow file related to the \\\`{{{appDescription}}}\\\`. For example, if the app is a "recipe generator", the flow could take ingredients as input and return a recipe idea.
        -   DO NOT integrate this flow into the \\\`page.tsx\\\`. This file is for boilerplate demonstration only.

    **ADDITIONAL CRITICAL INSTRUCTION:**

    9.  **Generate \\\`previewHtml\\\`**: After generating all the files, create one additional piece of data: \\\`previewHtml\\\`. This must be a single, self-contained HTML string representing a static preview of \\\`src/app/page.tsx\\\`. Include the CSS from \\\`globals.css\\\` inside a \\\`<style>\\\` tag and add a Tailwind CDN link. Convert the JSX into plain HTML to create a reasonable visual preview.

    **OUTPUT FORMAT:**
    Return a single JSON object matching the output schema. The \\\`files\\\` array must contain an object for each of the 8 files listed above. The \\\`previewHtml\\\` field must also be populated.
  `,
});

const generateWebAppFlow = ai.defineFlow(
  {
    name: 'generateWebAppFlow',
    inputSchema: GenerateWebAppInputSchema,
    outputSchema: GenerateWebAppOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Web application generation failed.');
    }
    return output;
  }
);
