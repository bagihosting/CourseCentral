import { CourseForm } from '@/components/course-form';
import { getCourseById, getUserById } from '@/lib/data';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

export default async function EditCoursePage({ params }: { params: { id: string } }) {
  const userId = cookies().get('userId')?.value;
  if (!userId) {
    redirect('/');
  }
  
  const user = await getUserById(userId);
  if (user?.role !== 'admin') {
    redirect('/dashboard/courses');
  }

  const course = await getCourseById(params.id);
  if (!course) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <CourseForm course={course} />
    </div>
  );
}
