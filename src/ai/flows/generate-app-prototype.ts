'use server';
/**
 * @fileOverview A flow for generating a basic prototype plan for a new application.
 *
 * - generateAppPrototype - A function that handles the prototype plan generation process.
 * - GenerateAppPrototypeInput - The input type for the function.
 * - GenerateAppPrototypeOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateAppPrototypeInputSchema = z.object({
  appIdea: z.string().describe('A description of the user\'s application idea.'),
});

const GenerateAppPrototypeOutputSchema = z.object({
  nameSuggestions: z.array(z.string()).describe('An array of 3-5 creative and suitable names for the application.'),
  taglineSuggestions: z.array(z.string()).describe('An array of 3-5 catchy and memorable taglines or slogans for the application.'),
  coreFeatures: z.array(z.object({
    feature: z.string().describe('The name of the core feature.'),
    description: z.string().describe('A brief description of what the feature does.'),
  })).describe('A list of 3-5 essential core features for the MVP (Minimum Viable Product).'),
  targetAudience: z.string().describe('A description of the primary target audience for the app.'),
  monetizationIdeas: z.array(z.string()).describe('A list of 2-3 potential monetization strategies (e.g., "Freemium model", "One-time purchase", "Subscription").'),
});

export type GenerateAppPrototypeInput = z.infer<
  typeof GenerateAppPrototypeInputSchema
>;
export type GenerateAppPrototypeOutput = z.infer<
  typeof GenerateAppPrototypeOutputSchema
>;

export async function generateAppPrototype(
  input: GenerateAppPrototypeInput
): Promise<GenerateAppPrototypeOutput> {
  return generateAppPrototypeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAppPrototypePrompt',
  input: { schema: GenerateAppPrototypeInputSchema },
  output: { schema: GenerateAppPrototypeOutputSchema },
  prompt: `
    You are an expert product manager and startup consultant. Your task is to take a user's raw app idea and flesh it out into a structured, actionable prototype plan.
    The plan should be concise, creative, and focused on building a successful Minimum Viable Product (MVP).

    **User's App Idea:**
    "{{{appIdea}}}"

    **CRITICAL INSTRUCTIONS:**
    1.  **App Names**: Brainstorm 3-5 unique, brandable, and relevant names for the app.
    2.  **Taglines**: Create 3-5 short, compelling taglines that clearly communicate the app's value proposition.
    3.  **Core Features**: Define 3-5 essential features that are critical for the app's initial launch (MVP). For each feature, provide a name and a one-sentence description.
    4.  **Target Audience**: Clearly describe the ideal initial user for this application. Be specific.
    5.  **Monetization**: Suggest 2-3 realistic ways the app could generate revenue.
    6.  **Language**: All output must be in Bahasa Indonesia, but keep technical terms like "MVP" or "Freemium" in English if appropriate.
  `,
});

const generateAppPrototypeFlow = ai.defineFlow(
  {
    name: 'generateAppPrototypeFlow',
    inputSchema: GenerateAppPrototypeInputSchema,
    outputSchema: GenerateAppPrototypeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    
    if (!output) {
      throw new Error('App prototype plan generation failed.');
    }
    return output;
  }
);
