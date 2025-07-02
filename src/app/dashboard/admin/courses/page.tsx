'use client';

import { useEffect, useState } from 'react';
import { AdminCourseActions } from '@/components/admin-course-actions';
import { CourseCard } from '@/components/course-card';
import { Button } from '@/components/ui/button';
import { getAllCourses } from '@/lib/data';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import type { Course } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Data fetching happens on the client
    setCourses(getAllCourses());
    setLoading(false);
  }, []);

  const handleCourseDeleted = () => {
    // Re-fetch courses from localStorage to update the UI
    setCourses(getAllCourses());
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
            <div>
                <Skeleton className="h-9 w-64 mb-2" />
                <Skeleton className="h-5 w-80" />
            </div>
            <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            ))}
        </div>
      </div>
    );
  }

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
                <AdminCourseActions courseId={course.id} onCourseDeleted={handleCourseDeleted} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
