
'use server';
/**
 * @fileOverview A flow for generating a technical topology for a new application idea.
 *
 * - generateAppTopology - A function that handles the topology generation process.
 * - GenerateAppTopologyInput - The input type for the function.
 * - GenerateAppTopologyOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { GenerateAppTopologyOutput } from '@/types';

const GenerateAppTopologyInputSchema = z.object({
  appKeywords: z.string().describe('Keywords or a brief description of the application idea.'),
});
export type GenerateAppTopologyInput = z.infer<typeof GenerateAppTopologyInputSchema>;

const GenerateAppTopologyOutputSchema = z.object({
  appNameSuggestion: z.string().describe('A suitable name for the application.'),
  taglineSuggestion: z.string().describe('A catchy tagline for the application.'),
  coreFeatures: z.array(z.object({
    feature: z.string().describe('The name of a core feature.'),
    description: z.string().describe('A brief description of what the feature does.'),
  })).describe('A list of 3-5 essential core features for the MVP.'),
  techStack: z.array(z.string()).describe('The recommended tech stack. Always include Next.js, React, TailwindCSS, ShadCN UI, Genkit.'),
  dataModel: z.array(z.object({
    modelName: z.string().describe('The name of the data model (e.g., "User", "Post").'),
    fields: z.array(z.string()).describe('A list of fields for the model (e.g., "id: string", "content: string").'),
  })).describe('A basic data model structure.'),
  userFlow: z.string().describe('A brief, high-level description of the primary user flow (e.g., "User registers, creates a new project, adds tasks, marks tasks as complete.").'),
});

// The exported function that calls the flow.
export async function generateAppTopology(
  input: GenerateAppTopologyInput
): Promise<GenerateAppTopologyOutput> {
  return generateAppTopologyFlow(input);
}

const generateAppTopologyFlow = ai.defineFlow(
  {
    name: 'generateAppTopologyFlow',
    inputSchema: GenerateAppTopologyInputSchema,
    outputSchema: GenerateAppTopologyOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'generateAppTopologyPrompt',
      input: { schema: GenerateAppTopologyInputSchema },
      output: { schema: GenerateAppTopologyOutputSchema },
      prompt: `
        You are a senior full-stack software architect. Your task is to take a user's app idea, described by keywords, and generate a technical topology and plan for building an MVP.
        The application will be built with Next.js, React, TailwindCSS, ShadCN UI, and Genkit. The output must be structured and practical.

        **User's App Idea Keywords:**
        "{{{appKeywords}}}"

        **CRITICAL INSTRUCTIONS:**
        1.  **Application Name and Tagline**: Brainstorm a suitable, professional name and a concise tagline for the app.
        2.  **Core Features**: Define 3-5 essential features for the MVP. Focus on what's absolutely necessary to launch.
        3.  **Tech Stack**: The tech stack is fixed. You MUST list "Next.js", "React", "TailwindCSS", "ShadCN UI", and "Genkit". You can add other relevant libraries if necessary (e.g., "Zod" for validation).
        4.  **Data Model**: Propose a simple but logical data model. Define 2-3 main models (like User, Project, Task, etc.) and list their essential fields with types.
        5.  **User Flow**: Describe the main user journey in one or two sentences. Keep it high-level.
        6.  **Language**: All output must be in Bahasa Indonesia.
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
      throw new Error('App topology generation failed.');
    }
    return output;
  }
);
