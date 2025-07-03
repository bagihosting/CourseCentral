'use server';
/**
 * @fileOverview A flow for generating digital invitation content.
 *
 * - generateDigitalInvitation - A function that handles the invitation generation process.
 * - GenerateDigitalInvitationInput - The input type for the function.
 * - GenerateDigitalInvitationOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateDigitalInvitationInputSchema = z.object({
  eventType: z.string().describe('The type of event (e.g., "Pernikahan", "Ulang Tahun", "Aqiqah").'),
  personOneName: z.string().describe('The name of the main person or first person in a couple.'),
  personTwoName: z.string().optional().describe('The name of the second person in a couple (for weddings).'),
  eventDate: z.string().describe('The date of the event (e.g., "Sabtu, 28 Desember 2024").'),
  eventTime: z.string().describe('The time of the event (e.g., "10:00 WIB - Selesai").'),
  eventVenue: z.string().describe('The name and address of the event venue.'),
  theme: z.string().describe('The desired theme or style of the invitation (e.g., "Minimalis Elegan", "Rustic", "Modern & Ceria").'),
});

const GenerateDigitalInvitationOutputSchema = z.object({
  title: z.string().describe('A catchy title for the invitation (e.g., "The Wedding of A & B", "You\'re Invited!").'),
  openingVerse: z.string().describe('A short, thematic quote, verse, or opening line suitable for the event.'),
  bodyText: z.string().describe('The main invitation text, including who is getting married/celebrating, and inviting the recipient.'),
  eventDetails: z.string().describe('A well-formatted block of text containing the date, time, and venue details.'),
  closingText: z.string().describe('A warm closing text, expressing hope for the recipient\'s attendance.'),
  designSuggestion: z.string().describe('A brief suggestion for the visual design, including color palette and font pairing based on the theme.'),
});

export type GenerateDigitalInvitationInput = z.infer<
  typeof GenerateDigitalInvitationInputSchema
>;
export type GenerateDigitalInvitationOutput = z.infer<
  typeof GenerateDigitalInvitationOutputSchema
>;

export async function generateDigitalInvitation(
  input: GenerateDigitalInvitationInput
): Promise<GenerateDigitalInvitationOutput> {
  return generateDigitalInvitationFlow(input);
}

const generateDigitalInvitationFlow = ai.defineFlow(
  {
    name: 'generateDigitalInvitationFlow',
    inputSchema: GenerateDigitalInvitationInputSchema,
    outputSchema: GenerateDigitalInvitationOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'generateDigitalInvitationPrompt',
      input: { schema: GenerateDigitalInvitationInputSchema },
      output: { schema: GenerateDigitalInvitationOutputSchema },
      prompt: `
        You are a creative and empathetic digital invitation designer. Your task is to craft compelling, warm, and well-structured content for a digital invitation based on the user's provided details.
        The language must be Bahasa Indonesia, with a tone that is respectful and appropriate for the event.

        **Event Details:**
        - Event Type: {{{eventType}}}
        - Name 1: {{{personOneName}}}
        {{#if personTwoName}}- Name 2: {{{personTwoName}}}{{/if}}
        - Date: {{{eventDate}}}
        - Time: {{{eventTime}}}
        - Venue: {{{eventVenue}}}
        - Theme: {{{theme}}}

        **CRITICAL INSTRUCTIONS:**
        1.  **Craft All Components**: Generate content for all fields in the output schema: \`title\`, \`openingVerse\`, \`bodyText\`, \`eventDetails\`, \`closingText\`, and \`designSuggestion\`.
        2.  **Tailor the Content**:
            -   For a **Wedding**, the \`bodyText\` should formally announce the union of \`{{{personOneName}}}\` and \`{{{personTwoName}}}\` and invite the recipient to witness their holy matrimony.
            -   For a **Birthday**, the tone should be more celebratory and personal.
            -   For other events, adapt the tone accordingly.
        3.  **Opening Verse**: Choose or create a short, beautiful verse or quote that matches the event type and theme. For a wedding, it could be a romantic or spiritual quote. For a birthday, something more joyful.
        4.  **Event Details Formatting**: Combine the date, time, and venue into a single, clearly formatted string. Use line breaks (\\n) for readability. For example: "Sabtu, 28 Desember 2024\\n10:00 WIB - Selesai\\nGrand Ballroom Hotel Indonesia\\nJl. MH Thamrin No. 1, Jakarta".
        5.  **Closing Text**: Write a warm and sincere closing remark, expressing how much the hosts are looking forward to the guest's presence.
        6.  **Design Suggestion**: Provide a concise and actionable design concept. Suggest a color palette (2-3 colors) and a font pairing (one for headings, one for body text) that aligns with the specified \`{{{theme}}}\`.
      `,
    });

    const { output } = await prompt(input);
    
    if (!output) {
      throw new Error('Digital invitation content generation failed.');
    }
    return output;
  }
);
