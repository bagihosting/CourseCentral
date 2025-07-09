
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
import crypto from 'crypto';

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

// Define the prompt for generating ONLY the creative SVG frame.
const certificateFramePrompt = ai.definePrompt({
    name: 'certificateFramePrompt',
    output: { schema: z.object({ svgFrame: z.string().describe('The complete <svg> element for the decorative frame.') }) },
    prompt: `
      You are a master SVG artist specializing in elegant, intricate designs for official documents.
      Your task is to create a beautiful, modern, and sophisticated decorative frame as a single inline SVG element.

      **CRITICAL DESIGN INSTRUCTIONS:**
      1.  **SVG Only**: The output MUST be a single, complete <svg> element. Do not include any other HTML.
      2.  **Dimensions**: The SVG should be designed to fit a landscape A4 page, so use a viewBox like "0 0 1123 794".
      3.  **Elegant Design**: Create an intricate and professional certificate border. Use guilloche patterns, geometric designs, or elegant corner flourishes. The design should convey prestige and achievement.
      4.  **Color Palette**: Use a professional color palette based on a deep, authoritative blue (e.g., #0A2240) and sophisticated gold accents (e.g., #D4AF37 or #B8860B).
      5.  **No Text**: The SVG frame itself MUST NOT contain any text elements.
      6.  **Self-Contained**: All styles must be inline within the SVG element. Do not use external CSS.
    `,
    config: {
      safetySettings: [
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      ],
    },
});

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
    const signatureSvgPath = "M20 70 C 30 20, 60 20, 70 70 S 100 120, 110 70 C 120 20, 150 20, 160 70 C 165 50, 175 50, 180 70 C 185 90, 195 90, 200 70 T 220 70 C 230 60, 240 60, 250 70 C 255 80, 265 80, 270 70";
    
    // Generate only the creative SVG frame from the AI
    const { output: frameOutput } = await certificateFramePrompt({});
    if (!frameOutput || !frameOutput.svgFrame) {
      throw new Error("Gagal membuat bingkai SVG sertifikat. Model AI tidak mengembalikan konten yang valid.");
    }

    const { svgFrame } = frameOutput;

    // 2. Construct the final HTML using a fixed, reliable template
    const certificateHtml = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Sertifikat Kelulusan - ${input.courseName}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet">
          <style>
              body { margin: 0; padding: 0; background-color: #f0f0f0; font-family: 'Montserrat', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
              .certificate-container { width: 1123px; height: 794px; position: relative; background-color: white; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
              .certificate-frame { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; }
              .certificate-content { position: relative; z-index: 2; padding: 60px; text-align: center; display: flex; flex-direction: column; justify-content: space-between; height: 100%; box-sizing: border-box; }
              .main-title { font-family: 'Merriweather', serif; font-size: 48px; font-weight: 900; color: #0A2240; margin: 0; }
              .subtitle { font-size: 20px; color: #555; margin-top: 10px; }
              .participant-name { font-family: 'Merriweather', serif; font-size: 40px; font-weight: 700; color: #B8860B; margin: 40px 0; }
              .course-info { font-size: 18px; color: #333; }
              .course-name { font-weight: 600; }
              .completion-date { font-size: 16px; color: #555; margin-top: 10px; }
              .footer { display: flex; justify-content: space-between; align-items: flex-end; width: 100%; }
              .qr-block { text-align: left; }
              .qr-code svg { width: 80px; height: 80px; }
              .serial-number { font-size: 12px; font-family: monospace; color: #555; margin-top: 5px; }
              .signature-block { text-align: center; }
              .signature-svg { height: 50px; }
              .organizer-name { font-weight: 600; font-size: 18px; margin-top: 5px; }
              .organizer-logo { max-height: 40px; margin-top: 5px; }
              .nip { font-size: 14px; color: #555; }
          </style>
      </head>
      <body>
          <div class="certificate-container">
              <div class="certificate-frame">${svgFrame}</div>
              <div class="certificate-content">
                  <div>
                      <h1 class="main-title">SERTIFIKAT KELULUSAN</h1>
                      <p class="subtitle">Dengan ini menyatakan bahwa:</p>
                      <p class="participant-name">${input.participantName}</p>
                      <p class="course-info">Telah berhasil menyelesaikan kursus <strong class="course-name">${input.courseName}</strong></p>
                      <p class="completion-date">Pada tanggal ${input.completionDate}</p>
                  </div>
                  <div class="footer">
                      <div class="qr-block">
                          <div class="qr-code">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25"><path d="M0 0h11v11H0zM2 2h7v7H2zm12-2h11v11H14zM4 4h3v3H4zM16 2h7v7h-7zm-10 7H2v4h4zM18 4h3v3h-3zM4 16H2v7h7v-2H4zm5-5H7v2h2zm2 2H9v2h2zm-2 2H7v2h2zm2-2h2v2h-2zm-5 5H4v2h2zm2 0h2v2H8zm-2 2H4v2h2zm13-13h7v4h-4v2h4v3h-2v-3h-3v-2h3v-2h-5zM9 21h2v2H9zm2-2h2v2h-2zm-5 0h2v2H6zm2 0h2v2H8zm-2-2h2v2H6zm2 2h2v2H8zm5-2h2v2h-2zm2 0h3v2h-3zM9 9h2v2H9zm5 0h2v2h-2zm-3-2h2v2h-2zm0 2h2v2h-2zm5 5h2v2h-2zm-2-2h2v2h-2z" fill="#000"/></svg>
                          </div>
                          <p class="serial-number">Serial No: ${serialNumber}</p>
                      </div>
                      <div class="signature-block">
                          <svg class="signature-svg" viewBox="0 0 300 100"><path d="${signatureSvgPath}" stroke="black" stroke-width="2.5" fill="none"/></svg>
                          <p class="organizer-name">${input.organizerName}</p>
                          <p class="nip">NIB: ${nip}</p>
                          <img src="${input.logoUrl}" alt="Logo Penyelenggara" class="organizer-logo">
                      </div>
                      <div style="width: 80px;"></div>
                  </div>
              </div>
          </div>
      </body>
      </html>
    `;

    return {
        certificateHtml,
        serialNumber,
    };
  }
);

export async function generateCertificate(input: GenerateCertificateInput): Promise<GenerateCertificateOutput> {
  return generateCertificateFlow(input);
}
