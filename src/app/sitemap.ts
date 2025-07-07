
import type { MetadataRoute } from 'next';
import { getAllCourses } from '@/actions/courses';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  // Static pages
  const staticRoutes = [
    '',
    '/login',
    '/contact',
    '/privacy-policy',
    '/terms-conditions',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic course pages
  const courses = await getAllCourses();
  const courseRoutes = courses
    .filter(course => course.status === 'published')
    .map((course) => ({
        url: `${baseUrl}/courses/${course.id}`,
        lastModified: new Date(course.updated_at).toISOString(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
  }));

  return [...staticRoutes, ...courseRoutes];
}
