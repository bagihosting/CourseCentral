
'use client';

import { useEffect, useState } from 'react';
import { CourseCard } from '@/components/course-card';
import { Button } from '@/components/ui/button';
import { getCoursesByAuthor } from '@/actions/courses';
import { PlusCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { Course } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { Badge } from '@/components/ui/badge';

export default function InstructorCoursesPage() {
  const { user, loading: userLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCourses = async () => {
    if (!user) return;
    try {
      const coursesData = await getCoursesByAuthor(user.id);
      setCourses(coursesData);
    } catch (error) {
      toast({
        title: "Gagal Memuat Kursus",
        description: "Tidak dapat mengambil data dari server. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userLoading && user) {
      fetchCourses();
    }
  }, [userLoading, user]);

  const getStatusBadge = (status: Course['status']) => {
    switch (status) {
        case 'draft':
            return <Badge variant="secondary">Draft</Badge>;
        case 'pending_review':
            return <Badge className="bg-yellow-500 hover:bg-yellow-600">Menunggu Review</Badge>;
        case 'published':
            return <Badge className="bg-green-600 hover:bg-green-700">Dipublikasikan</Badge>;
        case 'rejected':
            return <Badge variant="destructive">Ditolak</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
  }

  if (loading || userLoading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <Skeleton className="h-9 w-64 mb-2" />
                <Skeleton className="h-5 w-80" />
            </div>
            <Skeleton className="h-10 w-full md:w-48" />
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
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Konten Saya</h1>
          <p className="text-muted-foreground">Kelola semua kursus yang telah Anda buat.</p>
        </div>
        <Link href="/dashboard/courses/new" className="w-full md:w-auto">
          <Button className="w-full md:w-auto">
            <PlusCircle className="mr-2" />
            Buat Kursus Baru
          </Button>
        </Link>
      </div>
      
      {courses.length === 0 ? (
         <div className="py-20 text-center text-muted-foreground bg-muted/30 rounded-lg border-2 border-dashed">
            <h2 className="text-xl font-semibold">Anda Belum Membuat Kursus</h2>
            <p className="mt-2">Klik tombol "Buat Kursus Baru" untuk memulai.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <Link key={course.id} href={`/dashboard/courses/${course.id}/edit`}>
              <div className="relative group">
                <div className="absolute top-2 right-2 z-10">
                  {getStatusBadge(course.status)}
                </div>
                <CourseCard course={course} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
