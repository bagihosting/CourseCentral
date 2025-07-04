'use server';
/**
 * @fileOverview A flow for generating a complete, portable Next.js + Genkit application boilerplate.
 *
 * - generateGenkitApp - A function that handles the app generation process.
 * - GenerateGenkitAppInput - The input type for the function.
 * - GenerateGenkitAppOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateGenkitAppInputSchema = z.object({
  appName: z.string().describe('The name of the application, used for package.json (e.g., "my-ai-app").'),
  appDescription: z.string().describe('A detailed description of what the application should do.'),
});

const FileSchema = z.object({
    filePath: z.string().describe('The full path of the file within the project (e.g., "src/app/page.tsx").'),
    fileContent: z.string().describe('The complete source code or content for the file.'),
});

const GenerateGenkitAppOutputSchema = z.object({
  files: z.array(FileSchema).describe('An array of files representing the generated web application structure.'),
});

export type GenerateGenkitAppInput = z.infer<typeof GenerateGenkitAppInputSchema>;
export type GenerateGenkitAppOutput = z.infer<typeof GenerateGenkitAppOutputSchema>;

export async function generateGenkitApp(input: GenerateGenkitAppInput): Promise<GenerateGenkitAppOutput> {
  return generateGenkitAppFlow(input);
}

const generateGenkitAppFlow = ai.defineFlow(
  {
    name: 'generateGenkitAppFlow',
    inputSchema: GenerateGenkitAppInputSchema,
    outputSchema: GenerateGenkitAppOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
        name: 'generateGenkitAppPrompt',
        input: { schema: GenerateGenkitAppInputSchema },
        output: { schema: GenerateGenkitAppOutputSchema },
        prompt: `
            You are an expert full-stack developer specializing in Next.js, React, TailwindCSS, ShadCN UI, and Google's Genkit.
            Your task is to generate a complete, downloadable boilerplate for a new AI-powered web application based on the user's request.
            You must generate all the necessary files. The application must be fully functional and ready to run after 'npm install'.

            **User's Request:**
            - App Name: "{{appName}}"
            - App Description: "{{appDescription}}"

            **CRITICAL INSTRUCTIONS - YOU MUST GENERATE ALL THE FOLLOWING FILES:**

            1.  **package.json**:
                - Create a valid package.json file.
                - Use "{{appName}}" as the name.
                - Include these exact dependencies: "next", "react", "react-dom", "genkit", "@genkit-ai/googleai", "zod", "lucide-react", "clsx", "tailwind-merge", "tailwindcss-animate", "@radix-ui/react-slot".
                - Include these exact devDependencies: "typescript", "@types/node", "@types/react", "@types/react-dom", "postcss", "tailwindcss", "eslint", "eslint-config-next", "genkit-cli".
                - Include "dev", "build", "start", and "lint" scripts.

            2.  **tailwind.config.ts** and **postcss.config.js**:
                - Generate standard configuration files for Tailwind CSS.

            3.  **tsconfig.json**:
                - Generate a standard Next.js tsconfig.json file with a path alias for "@/*".

            4.  **src/app/globals.css**:
                - Generate a standard globals.css file for a ShadCN UI project with default light and dark themes.

            5.  **src/lib/utils.ts**:
                - Generate the standard 'cn' utility function for merging Tailwind classes.

            6.  **src/ai/genkit.ts**:
                - Generate the Genkit initialization file.
                - It must import 'genkit' and 'googleAI'.
                - It must initialize the 'ai' object using the Google AI plugin and process.env.GEMINI_API_KEY.
                - It must set a default model, e.g., 'googleai/gemini-1.5-flash-latest'.

            7.  **.env.local**:
                - Generate a .env.local file containing only: GEMINI_API_KEY="PASTE_YOUR_API_KEY_HERE".

            8.  **src/ai/flows/mainFlow.ts**:
                - This is the core AI logic.
                - Generate a Genkit flow based on the user's "{{appDescription}}".
                - It must be a server component ('use server').
                - It must define input and output Zod schemas.
                - It must use 'ai.defineFlow' and 'ai.definePrompt'.
                - The prompt should be creative and solve the user's described problem.
                - Export an async wrapper function for the flow, and the input/output types.

            9.  **src/actions/ai.ts**:
                - Generate a server actions file ('use server').
                - Import the wrapper function from 'mainFlow.ts'.
                - Create and export an async function that validates input and calls the flow. This function will be called by the frontend.

            10. **src/app/layout.tsx**:
                - Generate a standard root layout file.
                - It should include basic HTML structure and include the Inter font from 'next/font/google'.

            11. **src/app/page.tsx**:
                - This is the main frontend of the application.
                - It must be a client component ('use client').
                - It must use React hooks (useState, useEffect).
                - It must contain a form with inputs corresponding to the Zod schema in 'mainFlow.ts'.
                - It must call the server action from 'src/actions/ai.ts' on form submission.
                - It must display the results from the AI flow in a user-friendly way.
                - Use simple ShadCN UI components like Card, Button, Input, Label, and Textarea for the UI.
                - Show a loading state when the AI is processing.

            **FINAL CHECK:**
            - Ensure every file has the correct and complete content. Do not use placeholders unless specified (like for the API key).
            - The final output MUST be a JSON object containing an array of file objects, where each object has 'filePath' and 'fileContent'.
        `,
        config: {
            safetySettings: [
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
            ],
        },
    });

    const { output } = await prompt(input);
    
    if (!output || !output.files || output.files.length === 0) {
      throw new Error('Gagal membuat boilerplate aplikasi. Model AI tidak mengembalikan output yang valid.');
    }

    return output;
  }
);
