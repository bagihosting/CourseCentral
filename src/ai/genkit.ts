import {genkit, type GenkitPlugin} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const plugins: GenkitPlugin[] = [];
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  plugins.push(googleAI({apiKey}));
} else {
  if (process.env.NODE_ENV === 'production') {
    console.warn(
      'WARNING: GEMINI_API_KEY is not set. AI features will not be available.'
    );
  }
}

export const ai = genkit({
  plugins,
  // Conditionally set the default model only if the plugin is loaded
  ...(apiKey && {model: 'googleai/gemini-2.0-flash'}),
});
