
'use client';

import { CourseForm } from '@/components/course-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';

export default function NewCoursePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
        <Card>
            <CardHeader><Skeleton className="h-8 w-64" /></CardHeader>
            <CardContent><Skeleton className="h-64 w-full" /></CardContent>
        </Card>
    );
  }

  if (user?.role !== 'admin' && user?.role !== 'instructor') {
    return (
        <Card>
            <CardHeader><CardTitle>Akses Ditolak</CardTitle></CardHeader>
            <CardContent><p>Hanya admin dan pengajar yang dapat membuat kursus baru.</p></CardContent>
        </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Buat Kursus Baru</CardTitle>
          <CardDescription>Isi detail kursus baru Anda di bawah ini.</CardDescription>
        </CardHeader>
        <CardContent>
          <CourseForm />
        </CardContent>
      </Card>
    </div>
  );
}
