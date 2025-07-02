'use server';
/**
 * @fileOverview A flow for generating responsive Blogger templates using AI.
 *
 * - generateBloggerTemplate - A function that handles the template generation process.
 * - GenerateBloggerTemplateInput - The input type for the function.
 * - GenerateBloggerTemplateOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateBloggerTemplateInputSchema = z.object({
  niche: z.string().describe('The niche or topic of the blog (e.g., "Tech", "Culinary", "Fashion", "Travel").'),
  style: z.string().describe('The desired visual style (e.g., "Minimalist", "Modern", "Vintage", "Bold").'),
});

const GenerateBloggerTemplateOutputSchema = z.object({
  templateCode: z
    .string()
    .describe('The complete, valid XML code for the responsive Blogger template.'),
});

export type GenerateBloggerTemplateInput = z.infer<
  typeof GenerateBloggerTemplateInputSchema
>;
export type GenerateBloggerTemplateOutput = z.infer<
  typeof GenerateBloggerTemplateOutputSchema
>;

export async function generateBloggerTemplate(
  input: GenerateBloggerTemplateInput
): Promise<GenerateBloggerTemplateOutput> {
  return generateBloggerTemplateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBloggerTemplatePrompt',
  input: { schema: GenerateBloggerTemplateInputSchema },
  output: { schema: GenerateBloggerTemplateOutputSchema },
  prompt: `
    You are an expert Blogger theme developer. Your task is to generate a complete, valid, and responsive Blogger template in XML format.
    The template must be modern, clean, and follow best practices for SEO and performance.

    The user has specified the following requirements:
    - Blog Niche: {{{niche}}}
    - Visual Style: {{{style}}}

    **CRITICAL REQUIREMENTS:**

    1.  **Valid XML Structure**: The output MUST be a single, well-formed XML file starting with \`<?xml version="1.0" encoding="UTF-8" ?>\` and enclosed in \`<!DOCTYPE html><html>...\` tags. It must use Blogger's specific tags like \`<b:skin>\`, \`<b:template-skin>\`, \`<b:section>\`, and \`<b:widget>\`.
    2.  **Responsiveness**: The CSS inside the \`<b:skin>\` tag must use media queries to ensure the layout is fully responsive and looks great on mobile, tablet, and desktop screens. Use a mobile-first approach.
    3.  **Theme Designer Control Panel**: You MUST include a control panel using Blogger's Theme Designer variables. Create a \`<b:Group description="Theme Colors" selector="body">\` and \`<b:Group description="Fonts" selector="body">\` inside a \`<b:template-skin>\` tag.
        -   Inside the "Theme Colors" group, define variables for primary color, background color, text color, and link color. Example: \`<b:variable name="primary.color" description="Primary Color" type="color" default="#673ab7" value="#673ab7"/>\`.
        -   Inside the "Fonts" group, define variables for the body font and headings font. Example: \`<b:variable name="body.font" description="Body Font" type="font" default="normal 400 16px Roboto, sans-serif" value="normal 400 16px Roboto, sans-serif"/>\`.
        -   Use these variables within the CSS in your \`<b:skin>\` tag (e.g., \`background-color: $primary.color;\`).
    4.  **Layout Structure**: The layout should be clean and logical.
        -   Create a main content area with a 'main' section: \`<b:section class='main' id='main' showaddelement='yes'>\`.
        -   Create a sidebar section: \`<b:section class='sidebar' id='sidebar' showaddelement='yes'>\`.
        -   Create a header and footer section.
        -   Use CSS Grid or Flexbox for the main layout structure (e.g., content area and sidebar).
    5.  **Clean Code**: The generated HTML and CSS should be clean, well-commented (inside the CSS, not XML comments), and easy to understand. Do not include any external JavaScript libraries unless absolutely necessary.
    6.  **Full Code**: Provide the entire, complete XML code for the template. Do not provide snippets.
  `,
});


const generateBloggerTemplateFlow = ai.defineFlow(
  {
    name: 'generateBloggerTemplateFlow',
    inputSchema: GenerateBloggerTemplateInputSchema,
    outputSchema: GenerateBloggerTemplateOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    
    if (!output) {
      throw new Error('Template code generation failed.');
    }
    return output;
  }
);
