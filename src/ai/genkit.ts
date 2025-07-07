import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { config } from 'dotenv';

// Explicitly load environment variables from .env.local
// This ensures that process.env.GEMINI_API_KEY is available when this module is initialized,
// which is crucial for the Next.js server environment.
config({ path: `.env.local` });

// The googleAI() plugin will automatically look for the GEMINI_API_KEY.
// By explicitly passing it, we remove any ambiguity and ensure it's configured correctly.
// If the key is not found, Genkit will now throw a clear error on server start,
// which is better for debugging than a silent failure.
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
  // Set a default model to use for all AI generation calls.
  // Using a 'latest' model tag is generally more stable for production.
  model: 'googleai/gemini-1.5-flash-latest',
});
