
'use server';
/**
 * @fileOverview A flow for generating course certificates using AI.
 *
 * - generateCertificate - A function that handles the certificate generation process.
 * - GenerateCertificateInput - The input type for the function.
 * - GenerateCertificateOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateCertificateInputSchema = z.object({
  participantName: z.string().describe('The full name of the course participant.'),
  courseName: z.string().describe('The name of the course they completed.'),
  completionDate: z.string().describe('The date the course was completed (e.g., "28 Agustus 2024").'),
  organizerName: z.string().describe('The name of the organizing body or company.'),
  logoUrl: z.string().url().describe("A public URL for the organizer's logo."),
  courseId: z.string().describe('The ID of the course, used for the QR code link.'),
});
export type GenerateCertificateInput = z.infer<typeof GenerateCertificateInputSchema>;

const GenerateCertificateOutputSchema = z.object({
  certificateHtml: z.string().describe('The full, self-contained HTML for the certificate.'),
  serialNumber: z.string().describe('The unique serial number generated for the certificate.'),
});
export type GenerateCertificateOutput = z.infer<typeof GenerateCertificateOutputSchema>;

const generateCertificateFlow = ai.defineFlow(
  {
    name: 'generateCertificateFlow',
    inputSchema: GenerateCertificateInputSchema,
    outputSchema: GenerateCertificateOutputSchema,
  },
  async (input) => {
    // 1. Generate unique/consistent data
    const serialNumber = `CERT-${Date.now()}-${crypto.randomUUID().substring(0, 4).toUpperCase()}`;
    const nip = '31.7405.527108.1001'; 

    // Define prompt inside the flow to avoid module-level object exports.
    const certificateHtmlPrompt = ai.definePrompt({
        name: 'certificateHtmlPrompt',
        input: { schema: z.object({
            participantName: z.string(),
            courseName: z.string(),
            completionDate: z.string(),
            organizerName: z.string(),
            logoUrl: z.string(),
            courseId: z.string(),
            serialNumber: z.string(),
            nip: z.string(),
        }) },
        output: { schema: z.object({ certificateHtml: z.string() }) },
        prompt: `
          You are a professional graphic designer and SVG expert tasked with creating a certificate.
          Generate a complete, self-contained HTML document for a Certificate of Completion.
          The design must be MODERN, ELEGANT, and PROFESSIONAL, suitable for printing on A4 landscape paper.

          **CRITICAL DESIGN INSTRUCTIONS:**
          1.  **Full HTML Document**: The output MUST be a complete HTML document from \`<!DOCTYPE html>\` to \`</html>\`.
          2.  **Layout**: Design for A4 landscape (approx. 1123px by 794px). The layout must be balanced, formal, and visually appealing with good use of whitespace.
          3.  **Decorative Frame (SVG)**: Create a beautiful, modern, and intricate certificate border or frame. **You MUST use inline SVG for the frame** to create elegant patterns, guilloche, or geometric designs in the corners and/or along the edges. Do not use a simple CSS border. The frame should look sophisticated and premium. Use a color palette based on a deep, professional blue (#0A2240) and gold accents (#D4AF37).
          4.  **Typography**: Use professional and elegant fonts from Google Fonts (e.g., 'Merriweather' for headings, 'Lato' or 'Montserrat' for body text). The main title "Certificate of Completion" should be large and prominent.
          5.  **Content**: The certificate must include the following texts clearly: "Certificate of Completion", "This is to certify that", "{{{participantName}}}", "has successfully completed the course", "{{{courseName}}}", "on {{{completionDate}}}".
          6.  **Signature & Organizer Block (SVG/HTML)**: Below the main content, create a single, centered block for the signature and organizer details. This block MUST contain the following elements, stacked vertically in this exact order:
              a.  A **realistic, elegant, handwritten signature for the name 'Scriptify', generated as an inline SVG path**. It should look like a real signature, not just a cursive font.
              b.  The organizer's name: \`{{{organizerName}}}\`.
              c.  The NIB (Nomor Ijin Berusaha) number below the organizer's name: \`{{{nip}}}\`.
              d.  The organizer's logo, rendered as an \`<img>\` tag using the URL \`{{{logoUrl}}}\`. The logo MUST be placed directly below the NIB number and styled appropriately (e.g., max-height: 50px, margin-top: 10px).
          7.  **QR Code & Serial (SVG)**: Place this in a corner (e.g., bottom-left). It MUST contain:
              - A **valid, scannable QR code generated as an inline SVG** that links to the URL: \`https://scriptify.com/dashboard/courses/{{{courseId}}}\`. The QR code should be black on a white background.
              - The text "Serial No: {{{serialNumber}}}" next to or below the QR code.
          8.  **Self-Contained**: All CSS and SVG MUST be included within the HTML file in \`<style>\` tags or as inline SVG. No external files. Do not use top-level logo placement anymore; it must be in the signature block.
        `,
        config: {
          safetySettings: [
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_NONE',
            },
          ]
        },
    });
    
    // Generate the final HTML using the single, consolidated prompt
    const { output } = await certificateHtmlPrompt({
        ...input,
        serialNumber,
        nip,
    });
    if (!output || !output.certificateHtml) {
      throw new Error("Gagal membuat HTML sertifikat. Model AI tidak mengembalikan konten yang valid.");
    }

    return {
        certificateHtml: output.certificateHtml,
        serialNumber,
    };
  }
);

export async function generateCertificate(input: GenerateCertificateInput): Promise<GenerateCertificateOutput> {
  return generateCertificateFlow(input);
}
