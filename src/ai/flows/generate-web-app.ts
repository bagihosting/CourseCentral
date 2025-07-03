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
    You are an expert full-stack web developer specializing in the Next.js ecosystem. Your task is to generate a complete, production-ready boilerplate for a web application based on a user's description.
    The stack is strictly defined: Next.js (App Router), React, TypeScript, Tailwind CSS, ShadCN UI, and Genkit for AI features.

    **User's Request:**
    - App Name: {{{appName}}}
    - App Description: "{{{appDescription}}}"

    **CRITICAL INSTRUCTIONS:**

    Generate the file content for the following file structure. The generated code must be high-quality, clean, and follow modern best practices.

    **FILE STRUCTURE TO GENERATE:**

    1.  **package.json**:
        -   Use the provided \`{{{appName}}}\` for the "name" field.
        -   Include these exact dependencies: "next", "react", "react-dom", "tailwindcss", "@genkit-ai/googleai", "genkit", "zod", "lucide-react", "clsx", "tailwind-merge", "tailwindcss-animate", and ShadCN UI component packages like "@radix-ui/react-slot".
        -   Include dev dependencies: "typescript", "@types/react", "@types/node", "postcss", "autoprefixer".
        -   Include standard scripts for "dev", "build", "start", "lint".

    2.  **tailwind.config.ts**:
        -   Generate a standard Tailwind CSS configuration file for a Next.js project.
        -   Ensure it includes the content path for \`src/**/*.{ts,tsx}\`.
        -   Include the \`tailwindcss-animate\` plugin.
        -   Define basic theme extensions for colors and border-radius using CSS variables (e.g., \`background: 'hsl(var(--background))'\`).

    3.  **src/app/globals.css**:
        -   Generate the standard CSS file used by ShadCN UI.
        -   It MUST include \`@tailwind base;\`, \`@tailwind components;\`, \`@tailwind utilities;\`.
        -   It MUST define the HSL color variables for both light (\`:root\`) and dark (\`.dark\`) themes for: background, foreground, primary, secondary, destructive, muted, accent, card, popover, border, input, and ring. Choose a modern and professional color palette.

    4.  **src/app/layout.tsx**:
        -   Create the root layout component using TypeScript.
        -   It must include the \`<html>\` and \`<body>\` tags.
        -   Import and apply a standard font like 'Inter' from \`next/font/google\`.
        -   The body should have basic Tailwind classes for background and text color.

    5.  **src/app/page.tsx**:
        -   This is the main landing page.
        -   Generate a React Server Component that implements a visually appealing landing page based on the user's \`{{{appDescription}}}\`.
        -   Use ShadCN UI components (like \`<Card>\`, \`<Button>\`, \`<Input>\`) and Tailwind CSS for styling.
        -   Make the design professional, clean, and modern. Include a header, a hero section with a call-to-action, and a features section that reflects the app's purpose.

    6.  **src/app/ai.ts**:
        -   Create a Genkit flow file.
        -   Define a simple Genkit flow related to the \`{{{appDescription}}}\`.
        -   For example, if the app is a "recipe generator", the flow should take ingredients as input and return a recipe.
        -   Use Zod for input and output schemas.
        -   Include the Genkit initialization code: \`import { genkit } from 'genkit'; import { googleAI } from '@genkit-ai/googleai'; ...\`

    **OUTPUT FORMAT:**
    Return a single JSON object matching the output schema. The \`files\` array must contain an object for each of the 6 files listed above, with the correct \`fileName\`, \`filePath\`, and the complete \`fileContent\` as a string. The code inside \`fileContent\` MUST be properly escaped for a JSON string.
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
