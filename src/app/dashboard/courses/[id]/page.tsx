'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import type { Course, Module, Lesson } from '@/types';
import { getCourseById } from '@/lib/data';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, Film, FileText, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

function CourseContentDisplay({ modules }: { modules: Module[] }) {
    const getLessonIcon = (type: Lesson['type']) => {
        switch (type) {
            case 'video': return <Film className="h-5 w-5 text-muted-foreground" />;
            case 'text': return <FileText className="h-5 w-5 text-muted-foreground" />;
            case 'zip': return <Package className="h-5 w-5 text-muted-foreground" />;
        }
    };
    
    return (
        <Accordion type="multiple" defaultValue={modules.map(m => m.id)} className="w-full">
            {modules.map((module, moduleIndex) => (
                <AccordionItem value={module.id} key={module.id} className="border-b-0">
                    <AccordionTrigger className="text-base font-semibold hover:no-underline py-3 px-6">
                        <div className="flex-1 text-left">{module.title}</div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <ul className="space-y-1 pr-6 pb-2">
                            {module.lessons.map((lesson, lessonIndex) => {
                                // Simple completion logic for demonstration. In a real app, track progress.
                                const isCompleted = moduleIndex === 0 && lessonIndex < 2; 
                                
                                return (
                                    <li key={lesson.id} className="flex items-center justify-between cursor-pointer hover:bg-muted/50 ml-6 p-2 rounded-md">
                                        <div className="flex items-center gap-3">
                                            {getLessonIcon(lesson.type)}
                                            <span className="text-sm">{lesson.title}</span>
                                        </div>
                                        <CheckCircle className={cn("h-5 w-5 text-primary transition-opacity", isCompleted ? "opacity-100" : "opacity-20")} />
                                    </li>
                                );
                            })}
                        </ul>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}

export default function CoursePage() {
  const params = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null | undefined>(undefined);

  useEffect(() => {
    if (params.id) {
      const courseData = getCourseById(params.id);
      setCourse(courseData);
    }
  }, [params.id]);

  if (course === undefined) {
    // Loading state
    return (
        <div className="grid lg:grid-cols-5 gap-8 p-4 md:p-6">
            <div className="lg:col-span-3 space-y-6">
                <Skeleton className="w-full aspect-video rounded-lg" />
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-5 w-1/4 mb-4" />
                <Skeleton className="h-32 w-full" />
            </div>
            <div className="lg:col-span-2 space-y-4">
                 <Skeleton className="h-40 w-full rounded-lg" />
                 <Skeleton className="h-64 w-full rounded-lg" />
            </div>
        </div>
    );
  }

  if (course === null) {
    notFound();
  }
  
  // Dummy progress for demonstration
  const totalLessons = course.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
  const completedLessons = totalLessons > 3 ? 2 : 0; // Assume 2 lessons are completed for demo
  const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-8">
            {/* Left/Main Column */}
            <div className="lg:col-span-3 space-y-6">
                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">{course.title}</h1>
                <div className="relative aspect-video w-full rounded-lg overflow-hidden border">
                     <Image
                        src={course.imageUrl}
                        alt={course.title}
                        fill
                        className="object-cover"
                        data-ai-hint="course topic"
                    />
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Tentang Kursus Ini</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground whitespace-pre-wrap">{course.description}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Right/Sidebar Column */}
            <aside className="lg:col-span-2 space-y-6 lg:sticky lg:top-6 h-fit">
                <Card>
                    <CardHeader>
                        <p className="text-muted-foreground">Oleh <span className="font-semibold text-foreground">{course.instructor}</span></p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <Progress value={progress} className="w-full" />
                         <p className="text-sm text-muted-foreground">{completedLessons} dari {totalLessons} pelajaran selesai.</p>
                         <Button className="w-full text-lg" size="lg">Mulai Belajar</Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Isi Kursus</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {course.modules.length > 0 ? (
                           <CourseContentDisplay modules={course.modules} />
                        ) : (
                            <p className="text-center text-muted-foreground p-6">Kurikulum belum tersedia.</p>
                        )}
                    </CardContent>
                </Card>
            </aside>
        </div>
    </div>
  );
}
