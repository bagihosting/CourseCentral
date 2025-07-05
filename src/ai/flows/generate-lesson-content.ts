
'use server';
/**
 * @fileOverview A flow for generating long-form lesson tutorial content with an AI-generated image.
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
    
    // Define the prompt for generating the text content
    const textPrompt = ai.definePrompt({
      name: 'generateLessonTextPrompt',
      input: { schema: GenerateLessonContentInputSchema },
      output: { schema: GenerateLessonContentOutputSchema },
      prompt: `
        You are an expert instructional designer and author. Your task is to create a **comprehensive, very long-form tutorial** in HTML format based on the provided course and lesson titles. The content should be exceptionally detailed, easy to understand, and approximately 3000 words in length.
        The tutorial must be written in clear, educational, and professional Bahasa Indonesia, with well-structured paragraphs.

        **Course Title:** "{{{courseTitle}}}"
        **Lesson Title:** "{{{lessonTitle}}}"

        **CRITICAL INSTRUCTIONS:**

        1.  **HTML Structure**: The entire output must be a single block of well-formed HTML. Use semantic tags like \`<h1>\`, \`<h2>\`, \`<h3>\`, \`<p>\`, \`<ul>\`, \`<ol>\`, \`<li>\`, and \`<strong>\` for emphasis on key concepts.
        2.  **Content Organization**:
            -   Start with a main heading \`<h1>\` using the lesson title.
            -   Write a detailed introductory paragraph \`<p>\` that sets the stage and outlines what the reader will learn.
            -   Divide the content into multiple, logical, in-depth sections using subheadings \`<h2>\` and \`<h3>\`.
            -   Use well-written, elaborate paragraphs \`<p>\` for detailed explanations.
            -   Use ordered lists \`<ol>\` for step-by-step instructions and unordered lists \`<ul>\` for key points or examples.
        3.  **No Code Snippets**: Unless the lesson title is explicitly about computer programming, **do not include code blocks (\`<pre>\`, \`<code>\`)**. The focus must be on creating rich, descriptive prose.
        4.  **Image Inclusion**: You MUST include exactly one image tag within the tutorial.
            -   The image tag MUST be precisely: \`<img src="IMAGE_PLACEHOLDER" alt="{{{lessonTitle}}}" style="width:100%;height:auto;border-radius:8px;margin:1em 0;" />\`.
            -   Place this tag in a logically relevant position, such as after the introduction.
        5.  **Content Quality & Length**: The tutorial must be extremely comprehensive, thorough, and aim for a length of **approximately 3000 words**. It should provide practical, in-depth information suitable for an expert-level learner.
        6.  **Language**: All text must be in Bahasa Indonesia.
      `,
    });
    
    // Define the prompt for generating the image
    const imagePrompt = `
        A high-quality, professional, and visually appealing image for an online course lesson titled "${input.lessonTitle}".
        The style should be modern and clean. Do not include any text in the image.
    `;

    // Run both text and image generation in parallel
    const [textGenerationResult, imageGenerationResult] = await Promise.all([
        textPrompt(input),
        ai.generate({
            model: 'googleai/gemini-2.0-flash-preview-image-generation',
            prompt: imagePrompt,
            config: {
              responseModalities: ['TEXT', 'IMAGE'],
            },
        })
    ]);

    const { output: textOutput } = textGenerationResult;
    const { media: imageOutput } = imageGenerationResult;
    
    if (!textOutput || !textOutput.content) {
      throw new Error('Lesson content generation failed. The model did not return valid text content.');
    }
    
    if (!imageOutput || !imageOutput.url) {
        throw new Error('Image generation failed. The model did not return a valid image.');
    }
    
    // Replace the placeholder in the HTML with the generated image data URI
    const finalContent = textOutput.content.replace(
        'src="IMAGE_PLACEHOLDER"',
        `src="${imageOutput.url}"`
    );

    return { content: finalContent };
  }
);
