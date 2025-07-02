import { AdminCourseActions } from '@/components/admin-course-actions';
import { AiSuggestions } from '@/components/ai-suggestions';
import { CourseCard } from '@/components/course-card';
import { Button } from '@/components/ui/button';
import { getAllCourses, getUser } from '@/lib/data';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default async function CoursesPage() {
  const courses = await getAllCourses();
  const user = await getUser();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">Katalog Kursus</h1>
            <p className="text-muted-foreground">Jelajahi dan temukan kursus yang tepat untuk Anda.</p>
          </div>
          {user?.role === 'admin' && (
            <Link href="/dashboard/courses/new">
              <Button>
                <PlusCircle className="mr-2" />
                Tambah Kursus
              </Button>
            </Link>
          )}
        </div>
      </div>
      
      <AiSuggestions />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="relative group">
            <CourseCard course={course} />
            {user?.role === 'admin' && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <AdminCourseActions courseId={course.id} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
