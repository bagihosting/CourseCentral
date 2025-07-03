
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
import { v4 as uuidv4 } from 'uuid';

const GenerateCertificateInputSchema = z.object({
  participantName: z.string().describe('The full name of the course participant.'),
  courseName: z.string().describe('The name of the course they completed.'),
  completionDate: z.string().describe('The date the course was completed (e.g., "28 Agustus 2024").'),
  organizerName: z.string().describe('The name of the organizing body or company.'),
  logoUrl: z.string().url().describe("A public URL for the organizer's logo."),
});
export type GenerateCertificateInput = z.infer<typeof GenerateCertificateInputSchema>;

const GenerateCertificateOutputSchema = z.object({
  certificateHtml: z.string().describe('The full, self-contained HTML for the certificate.'),
  serialNumber: z.string().describe('The unique serial number generated for the certificate.'),
});
export type GenerateCertificateOutput = z.infer<typeof GenerateCertificateOutputSchema>;

const certificateHtmlPrompt = ai.definePrompt({
    name: 'certificateHtmlPrompt',
    input: { schema: z.object({
        participantName: z.string(),
        courseName: z.string(),
        completionDate: z.string(),
        organizerName: z.string(),
        logoUrl: z.string(),
        serialNumber: z.string(),
        barcodeDataUri: z.string().describe("A data URI for the barcode image."),
        signatureDataUri: z.string().describe("A data URI for the signature image."),
        nip: z.string(),
    }) },
    output: { schema: z.object({ certificateHtml: z.string() }) },
    prompt: `
      You are a professional graphic designer tasked with creating a certificate.
      Generate a complete, self-contained HTML document for a Certificate of Completion.
      The design must be MODERN, ELEGANT, and PROFESSIONAL, suitable for printing on A4 landscape paper.

      **Data to Use:**
      - Participant: {{{participantName}}}
      - Course: {{{courseName}}}
      - Date: {{{completionDate}}}
      - Organizer: {{{organizerName}}}
      - NIP: {{{nip}}}
      - Logo: <img src="{{{logoUrl}}}" alt="Logo" style="max-height: 80px; max-width: 200px; object-fit: contain;" />
      - Barcode: <img src="{{{barcodeDataUri}}}" alt="Barcode" style="height: 40px;" />
      - Signature: <img src="{{{signatureDataUri}}}" alt="Signature" style="height: 50px; mix-blend-mode: darken;" />

      **CRITICAL DESIGN INSTRUCTIONS:**
      1.  **Full HTML Document**: The output MUST be a complete HTML document from <!DOCTYPE html> to </html>.
      2.  **Layout**: Design for A4 landscape (approx. 1123px by 794px). The layout must be balanced, formal, and visually appealing with good use of whitespace.
      3.  **Decorative Frame**: Create a beautiful, modern, and intricate certificate border or frame. **You MUST use inline SVG for the frame** to create elegant patterns, guilloche, or geometric designs in the corners and/or along the edges. Do not use a simple CSS border. The frame should look sophisticated and premium. Use a color palette based on a deep, professional blue (#0A2240) and gold accents (#D4AF37) for the frame.
      4.  **Typography**: Use professional and elegant fonts from Google Fonts (e.g., 'Merriweather' for headings, 'Lato' or 'Montserrat' for body text). The main title "Certificate of Completion" should be large and prominent.
      5.  **Content**: The certificate must include the following texts clearly: "Certificate of Completion", "This is to certify that", "[Participant Name]", "has successfully completed the course", "[Course Name]", "on [Date]".
      6.  **Signature Area**: Below the main content, create a centered signature block. It should contain the signature image, the organizer's name below it, and the NIP below that.
      7.  **Barcode & Serial**: Place the barcode image and the text "Serial No: [Serial Number]" in a corner (e.g., bottom-left). It should be discreet but readable.
      8.  **Self-Contained**: All CSS and SVG MUST be included within the HTML file in <style> tags or as inline SVG. No external files.
      9.  **Logo Placement**: The organizer's logo should be placed prominently, usually at the top center.
    `,
});

const generateCertificateFlow = ai.defineFlow(
  {
    name: 'generateCertificateFlow',
    inputSchema: GenerateCertificateInputSchema,
    outputSchema: GenerateCertificateOutputSchema,
  },
  async (input) => {
    // 1. Generate unique/consistent data
    const serialNumber = `CERT-${Date.now()}-${uuidv4().substring(0, 4).toUpperCase()}`;
    // Use a consistent, plausible NIP for Scriptify. This ensures it doesn't change on every generation.
    const nip = '31.7405.527108.1001'; 

    // 2. Generate barcode image from the serial number
    const barcodeGeneration = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate a standard Code 128 barcode image for the number: ${serialNumber}. The image should be clean, high-contrast, black bars on a perfectly white background. Do not include any text or numbers below the barcode. The image should be wide and short.`,
      config: { 
          responseModalities: ['IMAGE', 'TEXT'],
          safetySettings: [{ category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }]
      },
    });
    const barcodeDataUri = barcodeGeneration.media?.url;
    if (!barcodeDataUri) throw new Error("Barcode generation failed. The model did not return media.");

    // 3. Generate a consistent signature image for "Scriptify"
    const signatureGeneration = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate a realistic, elegant, flowing, handwritten signature for the name 'Scriptify'. Use black ink on a transparent background. The signature should be professional and look like a real signature. Do not include any other text or elements.`,
      config: { 
          responseModalities: ['IMAGE', 'TEXT'],
          safetySettings: [{ category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }]
      },
    });
    const signatureDataUri = signatureGeneration.media?.url;
    if (!signatureDataUri) throw new Error("Signature generation failed. The model did not return media.");

    // 4. Generate the final HTML using the dedicated prompt
    const { output } = await certificateHtmlPrompt({
        ...input,
        serialNumber,
        nip,
        barcodeDataUri,
        signatureDataUri,
    });
    if (!output || !output.certificateHtml) throw new Error("Certificate HTML generation failed.");

    return {
        certificateHtml: output.certificateHtml,
        serialNumber,
    };
  }
);

export async function generateCertificate(input: GenerateCertificateInput): Promise<GenerateCertificateOutput> {
  return generateCertificateFlow(input);
}
