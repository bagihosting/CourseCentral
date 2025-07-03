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
      The design must be elegant, professional, and suitable for printing on A4 landscape paper.
      Use a <style> block for all CSS. Use web-safe or Google Fonts.

      **Data to Use:**
      - Participant: {{{participantName}}}
      - Course: {{{courseName}}}
      - Date: {{{completionDate}}}
      - Organizer: {{{organizerName}}}
      - NIP: {{{nip}}}
      - Logo: <img src="{{{logoUrl}}}" alt="Logo" style="max-height: 80px; max-width: 200px;" />
      - Barcode: <img src="{{{barcodeDataUri}}}" alt="Barcode" style="height: 40px;" />
      - Signature: <img src="{{{signatureDataUri}}}" alt="Signature" style="height: 50px; mix-blend-mode: darken;" />

      **CRITICAL INSTRUCTIONS:**
      1.  **Full HTML Document**: The output MUST be a complete HTML document from <!DOCTYPE html> to </html>.
      2.  **Layout**: Design for A4 landscape (approx. 1123px by 794px). Use a decorative border. The layout should be balanced and formal.
      3.  **Content**: Include the following texts: "Certificate of Completion", "This is to certify that", "[Participant Name]", "has successfully completed the course", "[Course Name]", "on [Date]".
      4.  **Signature Area**: Below the main content, align a block for the signature. It should contain the signature image, the organizer's name below it, and the NIP below that.
      5.  **Barcode & Serial**: Place the barcode image and the text "Serial No: [Serial Number]" in a corner, like the bottom-left. Make it discreet.
      6.  **Fonts**: Use professional fonts like 'Merriweather', 'Montserrat', 'Lato', or 'Playfair Display' from Google Fonts.
      7.  **No External Files**: All CSS must be in a <style> tag. No external stylesheets or scripts.
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
      config: { responseModalities: ['TEXT', 'IMAGE'] },
    });
    const barcodeDataUri = barcodeGeneration.media?.url;
    if (!barcodeDataUri) throw new Error("Barcode generation failed. The model did not return media.");

    // 3. Generate a consistent signature image for "Scriptify"
    const signatureGeneration = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate a realistic, elegant, flowing, handwritten signature for the name 'Scriptify'. Use black ink on a transparent background. The signature should be professional and look like a real signature. Do not include any other text or elements.`,
      config: { responseModalities: ['TEXT', 'IMAGE'] },
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
