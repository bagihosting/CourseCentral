
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

// Define the simpler schema for what the AI will actually generate.
const AiGeneratedContentSchema = z.object({
    pageTsxContent: z.string().describe('The complete source code for `src/app/page.tsx`. This must be a client component that uses the `useLocalStorage` hook and ShadCN UI components.'),
    explanation: z.string().describe('A detailed explanation of how `page.tsx` works, especially its state management with `useLocalStorage`.'),
});


const generateWebAppFlow = ai.defineFlow(
  {
    name: 'generateWebAppFlow',
    inputSchema: GenerateWebAppInputSchema,
    outputSchema: GenerateWebAppOutputSchema,
  },
  async (input) => {
    // 1. Define the prompt for the AI to generate only the dynamic content.
    const prompt = ai.definePrompt({
        name: 'generateWebAppDynamicContentPrompt',
        input: { schema: GenerateWebAppInputSchema },
        output: { schema: AiGeneratedContentSchema },
        prompt: `
            You are an expert Next.js developer. Your task is to generate the main page component (\`page.tsx\`) for a simple web application based on the user's request.

            **Tech Stack to use:**
            - Next.js (App Router, **Client Component for \`page.tsx\`**)
            - React (with Hooks)
            - TypeScript
            - ShadCN UI Components (like Card, Button, Input, Label, etc.)
            - A pre-existing custom hook called \`useLocalStorage\` for state persistence.

            **User's Request:**
            - App Description: "{{{appDescription}}}"
            {{#if cloneUrl}}- Visually clone the UI from: {{{cloneUrl}}}{{/if}}

            **CRITICAL INSTRUCTIONS:**

            1.  **Generate \`page.tsx\` Content**:
                - The file MUST start with \`'use client'\`.
                - It must implement the core logic from the user's \`appDescription\`. For example, for a "todo list", create an input field, an "Add" button, and a list to display todos.
                - It MUST use the \`useLocalStorage\` hook to persist the application's state. For example: \`const [todos, setTodos] = useLocalStorage('todos', []);\`.
                - The UI MUST be built using ShadCN UI components.
                - Return the **ENTIRE, final content** for the \`src/app/page.tsx\` file.

            2.  **Generate Explanation**:
                - Write a clear, step-by-step explanation of how the \`page.tsx\` file works.
                - Focus on how state is managed with the \`useLocalStorage\` hook.
                - Explain the purpose of the main UI components used.
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
    
    // 2. Call the AI to get the dynamic content.
    const { output: aiOutput } = await prompt(input);
    
    if (!aiOutput) {
      throw new Error('Gagal membuat konten aplikasi. Model AI tidak mengembalikan output yang valid.');
    }

    // 3. Define the static boilerplate file contents.
    const globalsCssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;
 
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }
 
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}
 
@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}`;
    const packageJsonContent = `{
  "name": "${input.appName}",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "react": "^18",
    "react-dom": "^18",
    "next": "14.2.3",
    "@radix-ui/react-slot": "^1.0.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "lucide-react": "^0.372.0",
    "tailwind-merge": "^2.2.2",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.23.0",
    "genkit": "^0.4.0",
    "@genkit-ai/googleai": "^0.4.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "eslint": "^8",
    "eslint-config-next": "14.2.3"
  }
}`;
    const utilsTsContent = `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`;
    const tailwindConfigContent = `import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
export default config`;
    const useLocalStorageContent = `'use client';
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
      const valueToStore = storedValue instanceof Function ? storedValue(storedValue) : storedValue;
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}`;

    // 4. Combine AI-generated and static content into the final file list.
    const allFiles = [
        { fileName: 'package.json', filePath: 'package.json', fileContent: packageJsonContent },
        { fileName: 'tailwind.config.ts', filePath: 'tailwind.config.ts', fileContent: tailwindConfigContent },
        { fileName: 'globals.css', filePath: 'src/app/globals.css', fileContent: globalsCssContent },
        { fileName: 'page.tsx', filePath: 'src/app/page.tsx', fileContent: aiOutput.pageTsxContent },
        { fileName: 'utils.ts', filePath: 'src/lib/utils.ts', fileContent: utilsTsContent },
        { fileName: 'use-local-storage.ts', filePath: 'src/hooks/use-local-storage.ts', fileContent: useLocalStorageContent },
    ];

    // 5. Generate the preview HTML.
    const finalPreviewHtml = `
        <!DOCTYPE html>
        <html>
            <head>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>${globalsCssContent}</style>
            </head>
            <body>
                <div class="p-4">
                    <h1 class="text-xl font-bold mb-4">Preview Not Available</h1>
                    <p class="text-sm text-gray-600">Live preview generation is complex. Please refer to the generated code files, especially <code>src/app/page.tsx</code>, and run the project locally to see the full result.</p>
                </div>
            </body>
        </html>
    `;

    return {
        files: allFiles,
        previewHtml: finalPreviewHtml,
        explanation: aiOutput.explanation,
    };
  }
);
