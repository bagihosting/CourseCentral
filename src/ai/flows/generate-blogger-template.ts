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
  creatorName: z.string().describe('The name of the template creator.'),
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
    You are an expert Blogger theme developer with a keen eye for modern, smart UI design. Your task is to generate a complete, valid, and responsive Blogger template in XML format.
    The template must be aesthetically pleasing, professional, clean, and follow best practices for SEO, performance, and user experience.

    The user has specified the following requirements:
    - Blog Niche: {{{niche}}}
    - Visual Style: {{{style}}}
    - Creator Name: {{{creatorName}}}

    **CRITICAL REQUIREMENTS:**

    1.  **Valid XML Structure**: The output MUST be a single, well-formed XML file starting with \`<?xml version="1.0" encoding="UTF-8" ?>\` and enclosed in \`<!DOCTYPE html><html>...\` tags. It must use Blogger's specific tags like \`<b:skin>\`, \`<b:template-skin>\`, \`<b:section>\`, and \`<b:widget>\`.
    2.  **Smart & Responsive UI**:
        -   The CSS inside the \`<b:skin>\` tag must use a mobile-first approach with media queries to ensure the layout is fully responsive and looks excellent on all screen sizes.
        -   The design should be clean and modern, with ample whitespace, a clear visual hierarchy, and readable typography. Use a standard sans-serif font like 'Roboto', 'Lato', or 'Inter' from Google Fonts.
        -   Implement a smart layout. For example, a two-column layout with a main content area and a sidebar on larger screens, which collapses to a single column on mobile. Use CSS Grid or Flexbox for this.
    3.  **Theme Designer Control Panel**: You MUST include a control panel using Blogger's Theme Designer variables. Create a \`<b:Group description="Theme Colors" selector="body">\` and \`<b:Group description="Fonts" selector="body">\` inside a \`<b:template-skin>\` tag.
        -   Inside "Theme Colors", define variables for primary color, secondary color, background color, text color, and link color. Example: \`<b:variable name="primary.color" description="Primary Color" type="color" default="#3498db" value="#3498db"/>\`.
        -   Inside "Fonts", define variables for the body font and headings font. Example: \`<b:variable name="body.font" description="Body Font" type="font" default="normal 400 16px Roboto, sans-serif" value="normal 400 16px Roboto, sans-serif"/>\`.
        -   Use these variables within the CSS in your \`<b:skin>\` tag (e.g., \`background-color: $primary.color;\`).
    4.  **SEO-Friendly Structure**: The HTML structure should be semantic. Use tags like \`<header>\`, \`<main>\`, \`<aside>\`, \`<footer>\`, and \`<article>\` appropriately within the Blogger sections. Include a default Blog widget in the main section: \`<b:widget id='Blog1' locked='true' title='Blog Posts' type='Blog' version='1'>\`.
    5.  **Clean Code**: The generated HTML and CSS should be clean, well-commented (inside the CSS), and easy to understand. Do not include any external JavaScript libraries.
    6.  **Full Code**: Provide the entire, complete XML code for the template. Do not provide snippets.
    7.  **Creator Credit**: In the footer section, you MUST include a credit for the template creator. For example: \`<div id='creator-credit' class='text-center p-4'>Template designed by {{{creatorName}}}</div>\`. Also, include an XML comment at the top of the theme: \`<!-- Template created for a {{{niche}}} blog by {{{creatorName}}} -->\`. This credit must be visible in the template's footer.
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
