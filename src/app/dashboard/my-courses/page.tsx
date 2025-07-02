'use client';

import { useEffect, useState } from 'react';
import { CourseCard } from '@/components/course-card';
import { getEnrolledCoursesForUser } from '@/lib/data';
import { useAuth } from '@/contexts/auth-context';
import type { Course } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: userLoading } = useAuth();

  useEffect(() => {
    if (userLoading) return; // Wait for user to be loaded

    if (user) {
      setCourses(getEnrolledCoursesForUser(user.id));
    }
    setLoading(false);
    
  }, [user, userLoading]);

  if (loading || userLoading) {
    return (
      <div className="flex flex-col gap-8">
        <div>
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-80" />
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
      <div>
        <h1 className="text-3xl font-bold">Kursus Saya</h1>
        <p className="text-muted-foreground">Ini adalah daftar semua kursus yang Anda ikuti.</p>
      </div>
      
      {courses.length === 0 ? (
         <div className="py-20 text-center text-muted-foreground bg-muted/30 rounded-lg border-2 border-dashed flex flex-col items-center gap-4">
            <h2 className="text-xl font-semibold">Anda Belum Mengikuti Kursus Apapun</h2>
            <p>Jelajahi katalog kami untuk menemukan kursus yang menarik bagi Anda.</p>
            <Link href="/dashboard/courses">
                <Button>Jelajahi Katalog</Button>
            </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="relative group">
              <CourseCard course={course} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
