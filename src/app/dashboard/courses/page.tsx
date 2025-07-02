import { CourseCard } from '@/components/course-card';
import { Input } from '@/components/ui/input';
import { getAllCourses } from '@/lib/data';
import { Search } from 'lucide-react';

export default async function CoursesPage() {
  const courses = await getAllCourses();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Katalog Kursus</h1>
        <p className="text-muted-foreground">
          Jelajahi pustaka kursus kami yang luas untuk menemukan petualangan belajar Anda berikutnya.
        </p>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input placeholder="Cari kursus..." className="pl-10" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
