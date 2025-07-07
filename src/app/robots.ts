
import type { MetadataRoute } from 'next';
import { getSeoSettings } from '@/actions/settings';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSeoSettings();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  return {
    rules: [
        {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard/', '/api/'],
        }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
