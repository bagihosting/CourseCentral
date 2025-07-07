import { config } from 'dotenv';

// In development, Next.js uses .env.local.
// The genkit dev server should do the same to ensure consistency.
config({ path: `.env.local` });
