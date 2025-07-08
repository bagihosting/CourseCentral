import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// In modern Next.js environments, environment variables from .env.local (for development)
// or from the production environment are automatically loaded into process.env.
// Manually calling dotenv is unnecessary and can be brittle.

// The googleAI() plugin will automatically look for the GEMINI_API_KEY
// in the process environment. This is the recommended and most robust approach.
// If the key is not found, Genkit will throw a clear error on server start,
// which is better for debugging than a silent failure.
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  // Set a default model to use for all AI generation calls.
  // Using a 'latest' model tag is generally more stable for production.
  model: 'googleai/gemini-1.5-flash-latest',
});
