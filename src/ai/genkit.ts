import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// The googleAI() plugin will automatically look for the GEMINI_API_KEY
// in the environment variables (e.g., from your .env.local file).
// If the key is not found, Genkit will throw a clear error on server start,
// which is better for debugging than failing silently.
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  // Set a default model to use for all AI generation calls.
  // Using a 'latest' model tag is generally more stable for production.
  model: 'googleai/gemini-1.5-flash-latest',
});
