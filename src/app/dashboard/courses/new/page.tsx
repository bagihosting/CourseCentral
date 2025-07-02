import { CourseForm } from '@/components/course-form';
import { getUserById } from '@/lib/data';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function NewCoursePage() {
  const userId = cookies().get('userId')?.value;
  if (!userId) {
    redirect('/');
  }

  const user = await getUserById(userId);
  if (user?.role !== 'admin') {
    redirect('/dashboard/courses');
  }

  return (
    <div className="max-w-4xl mx-auto">
      <CourseForm />
    </div>
  );
}
