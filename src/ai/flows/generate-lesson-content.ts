
'use server';
/**
 * @fileOverview A flow for generating lesson tutorial content.
 *
 * - generateLessonContent - A function that handles the content generation.
 * - GenerateLessonContentInput - The input type for the function.
 * - GenerateLessonContentOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateLessonContentInputSchema = z.object({
  courseTitle: z.string().describe('The title of the overall course.'),
  lessonTitle: z.string().describe('The title of the specific lesson.'),
});

const GenerateLessonContentOutputSchema = z.object({
  content: z.string().describe('The generated tutorial content in well-structured HTML format.'),
});

export type GenerateLessonContentInput = z.infer<typeof GenerateLessonContentInputSchema>;
export type GenerateLessonContentOutput = z.infer<typeof GenerateLessonContentOutputSchema>;

export async function generateLessonContent(
  input: GenerateLessonContentInput
): Promise<GenerateLessonContentOutput> {
  return generateLessonContentFlow(input);
}

const generateLessonContentFlow = ai.defineFlow(
  {
    name: 'generateLessonContentFlow',
    inputSchema: GenerateLessonContentInputSchema,
    outputSchema: GenerateLessonContentOutputSchema,
  },
  async (input) => {
    // Generate keywords for the placeholder image hint
    const hintKeywords = input.lessonTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .slice(0, 2)
      .join(' ');
      
    const prompt = ai.definePrompt({
      name: 'generateLessonContentPrompt',
      input: { schema: GenerateLessonContentInputSchema.extend({ hintKeywords: z.string() }) },
      output: { schema: GenerateLessonContentOutputSchema },
      prompt: `
        You are an expert instructional designer and author. Your task is to create a **comprehensive, long-form tutorial** in HTML format based on the provided course and lesson titles. The content should be detailed, easy to understand, and approximately 500-700 words in length.
        The tutorial must be written in clear, educational, and professional Bahasa Indonesia.

        **Course Title:** "{{{courseTitle}}}"
        **Lesson Title:** "{{{lessonTitle}}}"

        **CRITICAL INSTRUCTIONS:**

        1.  **HTML Structure**: The entire output must be a single block of well-formed HTML. Use semantic tags like \`<h1>\`, \`<h2>\`, \`<p>\`, \`<ul>\`, \`<ol>\`, \`<li>\`, and \`<strong>\`.
        2.  **Content Organization**:
            -   Start with a main heading \`<h1>\` using the lesson title.
            -   Write a detailed introductory paragraph \`<p>\` that sets the stage.
            -   Divide the content into several logical sections using subheadings \`<h2>\`.
            -   Use well-written paragraphs \`<p>\` for detailed explanations. Use \`<strong>\` to emphasize key concepts.
            -   Use ordered lists \`<ol>\` for step-by-step instructions and unordered lists \`<ul>\` for key points or examples.
        3.  **No Code Snippets**: Unless the lesson title is explicitly about computer programming, **do not include code blocks (\`<pre>\`, \`<code>\`)**. Focus on creating rich, descriptive prose.
        4.  **Image Inclusion**: You MUST include exactly one relevant image within the tutorial to enhance understanding.
            -   The image tag must be: \`<img src="https://placehold.co/600x400.png" alt="{{{lessonTitle}}}" data-ai-hint="{{{hintKeywords}}}" style="width:100%;height:auto;border-radius:8px;margin:1em 0;" />\`.
            -   Place the image in a logically relevant position, such as after the introduction or within a key section.
        5.  **Content Quality & Length**: The tutorial must be comprehensive, thorough, and approximately 500-700 words. It should provide practical, in-depth information suitable for a learner.
        6.  **Language**: All text must be in Bahasa Indonesia.
      `,
    });
    
    const { output } = await prompt({ ...input, hintKeywords });
    
    if (!output || !output.content) {
      throw new Error('Lesson content generation failed. The model did not return valid content.');
    }
    return output;
  }
);
