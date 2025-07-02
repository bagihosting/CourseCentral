import { CourseCard } from '@/components/course-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getAllCourses, getUserById } from '@/lib/data';
import { Search, PlusCircle } from 'lucide-react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function CoursesPage() {
  const courses = await getAllCourses();
  const userId = cookies().get('userId')?.value;
  if (!userId) {
    redirect('/');
  }

  const user = await getUserById(userId);
  const isAdmin = user?.role === 'admin';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Katalog Kursus</h1>
          <p className="text-muted-foreground">
            Jelajahi pustaka kursus kami yang luas untuk menemukan petualangan belajar Anda berikutnya.
          </p>
        </div>
        {isAdmin && (
          <Button asChild>
            <Link href="/dashboard/courses/new">
              <PlusCircle />
              Tambah Kursus
            </Link>
          </Button>
        )}
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input placeholder="Cari kursus..." className="pl-10" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} isAdmin={isAdmin} />
        ))}
      </div>
    </div>
  );
}
