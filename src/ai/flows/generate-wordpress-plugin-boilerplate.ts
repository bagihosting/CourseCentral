'use server';
/**
 * @fileOverview A flow for generating WordPress plugin boilerplate files.
 *
 * - generateWordpressPluginBoilerplate - A function that handles the boilerplate generation.
 * - GenerateWordpressPluginBoilerplateInput - The input type for the function.
 * - GenerateWordpressPluginBoilerplateOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateWordpressPluginBoilerplateInputSchema = z.object({
  pluginName: z.string().describe('The name of the WordPress plugin (e.g., "My Awesome Slider").'),
  description: z.string().describe('A short description of what the plugin does.'),
  authorName: z.string().describe('The name of the plugin author or company.'),
  pluginUri: z.string().optional().describe('The URL of the plugin\'s homepage.'),
  authorUri: z.string().optional().describe('The URL of the author\'s homepage.'),
});

const GenerateWordpressPluginBoilerplateOutputSchema = z.object({
  readmeTxtContent: z
    .string()
    .describe('The full, well-structured content for the plugin\'s readme.txt file, following WordPress.org standards.'),
  phpFileContent: z
    .string()
    .describe('The full content for the main plugin PHP file, including the standard header block and basic placeholder code.'),
});

export type GenerateWordpressPluginBoilerplateInput = z.infer<
  typeof GenerateWordpressPluginBoilerplateInputSchema
>;
export type GenerateWordpressPluginBoilerplateOutput = z.infer<
  typeof GenerateWordpressPluginBoilerplateOutputSchema
>;

export async function generateWordpressPluginBoilerplate(
  input: GenerateWordpressPluginBoilerplateInput
): Promise<GenerateWordpressPluginBoilerplateOutput> {
  return generateWordpressPluginBoilerplateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWpPluginBoilerplatePrompt',
  input: { schema: GenerateWordpressPluginBoilerplateInputSchema },
  output: { schema: GenerateWordpressPluginBoilerplateOutputSchema },
  prompt: `
    You are an expert WordPress developer assistant. Your task is to generate the standard boilerplate files for a new WordPress plugin based on the user's input.
    You will generate two separate file contents: 'readme.txt' and the main plugin PHP file.

    **Plugin Details:**
    - Plugin Name: {{{pluginName}}}
    - Description: {{{description}}}
    - Author: {{{authorName}}}
    - Plugin URI: {{{pluginUri}}}
    - Author URI: {{{authorUri}}}

    **CRITICAL INSTRUCTIONS:**

    1.  **Generate `readme.txt` Content**:
        -   Create a full `readme.txt` file content that is compliant with the WordPress.org plugin directory standards.
        -   The header section must include the plugin name, contributors (use "author" as a placeholder), "Requires at least", "Tested up to", "Stable tag", and "License" fields. Use sensible defaults.
        -   Include standard sections like "== Description ==", "== Installation ==", "== Frequently Asked Questions ==", and "== Changelog ==".
        -   Populate the Description section with the user-provided description.
        -   Fill the other sections with standard, helpful placeholder text.

    2.  **Generate Main PHP File Content**:
        -   The filename should be based on the plugin name (e.g., "my-awesome-slider.php").
        -   The file MUST start with a standard WordPress plugin header comment block. This block must include "Plugin Name", "Plugin URI", "Description", "Version" (default to 1.0.0), "Author", "Author URI", and "License" (default to GPLv2 or later).
        -   After the header, include a basic security check: \`if ( ! defined( 'ABSPATH' ) ) { exit; }\`
        -   Do NOT generate any complex PHP logic. Only include comments and placeholders to guide the user. For example, add comments like \`// Enqueue scripts and styles here\` or \`// Add plugin hooks here\`.
        -   This file should serve as a clean, professional starting point for a developer.

    Return the complete content for both files in the specified output format.
  `,
});

const generateWordpressPluginBoilerplateFlow = ai.defineFlow(
  {
    name: 'generateWordpressPluginBoilerplateFlow',
    inputSchema: GenerateWordpressPluginBoilerplateInputSchema,
    outputSchema: GenerateWordpressPluginBoilerplateOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    
    if (!output) {
      throw new Error('WordPress plugin boilerplate generation failed.');
    }
    return output;
  }
);
