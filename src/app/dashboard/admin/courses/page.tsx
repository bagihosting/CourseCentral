import { AdminCourseActions } from '@/components/admin-course-actions';
import { CourseCard } from '@/components/course-card';
import { Button } from '@/components/ui/button';
import { getAllCourses } from '@/lib/data';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default async function AdminCoursesPage() {
  const courses = await getAllCourses();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Kursus</h1>
          <p className="text-muted-foreground">Tambah, ubah, dan hapus kursus dari sini.</p>
        </div>
        <Link href="/dashboard/courses/new">
          <Button>
            <PlusCircle className="mr-2" />
            Tambah Kursus Baru
          </Button>
        </Link>
      </div>
      
      {courses.length === 0 ? (
         <div className="py-20 text-center text-muted-foreground bg-muted/30 rounded-lg border-2 border-dashed">
            <h2 className="text-xl font-semibold">Katalog Kursus Kosong</h2>
            <p className="mt-2">Klik tombol "Tambah Kursus Baru" untuk membuat kursus pertama Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="relative group">
              <CourseCard course={course} />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <AdminCourseActions courseId={course.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
