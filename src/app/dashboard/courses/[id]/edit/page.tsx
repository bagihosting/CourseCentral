'use client';

import { useEffect, useState } from 'react';
import { CourseForm } from '@/components/course-form';
import { CurriculumManager } from '@/components/curriculum-manager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCourseById } from '@/lib/data';
import { notFound } from 'next/navigation';
import type { Course } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditCoursePage({ params }: { params: { id: string } }) {
  const [course, setCourse] = useState<Course | undefined | null>(undefined);

  const refreshCourse = () => {
    const courseData = getCourseById(params.id);
    setCourse(courseData);
  }

  useEffect(() => {
    refreshCourse();
  }, [params.id]);

  if (course === undefined) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-5 w-1/2" />
                </CardHeader>
            </Card>
        </div>
    )
  }

  if (course === null) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Kelola Kursus: {course.title}</CardTitle>
          <CardDescription>
            Perbarui detail kursus dan kelola kurikulum di sini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Detail Kursus</TabsTrigger>
              <TabsTrigger value="curriculum">Kurikulum</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-6">
              <Card>
                <CardHeader>
                    <CardTitle>Detail Halaman Utama</CardTitle>
                    <CardDescription>Informasi ini akan ditampilkan di halaman katalog kursus.</CardDescription>
                </CardHeader>
                <CardContent>
                    <CourseForm course={course} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="curriculum" className="mt-6">
               <CurriculumManager course={course} onUpdate={refreshCourse} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
