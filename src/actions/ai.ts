'use server';

import { suggestCourses, type SuggestCoursesInput } from '@/ai/flows/suggest-courses';
import { getCoursesByIds } from '@/lib/data';

export async function getCourseSuggestions(input: SuggestCoursesInput) {
  try {
    const courseIds = await suggestCourses(input);
    if (!courseIds || courseIds.length === 0) {
      return { success: true, courses: [] };
    }
    const courses = await getCoursesByIds(courseIds);
    return { success: true, courses };
  } catch (error) {
    console.error('Error getting course suggestions:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again later.' };
  }
}
