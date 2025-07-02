'use client';

import { useEffect, useState } from 'react';
import { AdminCourseActions } from '@/components/admin-course-actions';
import { AiSuggestions } from '@/components/ai-suggestions';
import { CourseCard } from '@/components/course-card';
import { getAllCourses } from '@/lib/data';
import { useUser } from '@/hooks/use-user';
import type { Course } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    setCourses(getAllCourses());
    setLoading(false);
  }, []);

  const handleCourseDeleted = () => {
    setCourses(getAllCourses());
  };
  
  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <div>
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-80" />
        </div>
        <Skeleton className="h-56 w-full" />
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
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">Katalog Kursus</h1>
            <p className="text-muted-foreground">Jelajahi dan temukan kursus yang tepat untuk Anda.</p>
          </div>
        </div>
      </div>
      
      <AiSuggestions />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="relative group">
            <CourseCard course={course} />
            {user?.role === 'admin' && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <AdminCourseActions courseId={course.id} onCourseDeleted={handleCourseDeleted}/>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
