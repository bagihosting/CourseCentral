'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, notFound } from 'next/navigation';
import type { Course, Module, Lesson } from '@/types';
import { getCourseById } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, Film, FileText, Package, Download, Youtube } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  let videoId = null;
  
  // Regular watch URL
  const urlParams = new URLSearchParams(new URL(url).search);
  videoId = urlParams.get('v');
  if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  
  // Short youtu.be URL
  const youtuBeMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (youtuBeMatch && youtuBeMatch[1]) {
    return `https://www.youtube.com/embed/${youtuBeMatch[1]}`;
  }

  // Embed URL (already correct)
  const embedMatch = url.match(/youtube\.com\/embed\/([^?&]+)/);
  if (embedMatch && embedMatch[1]) {
    return url;
  }
  
  return null;
}

function LessonDisplay({ lesson, onComplete, isCompleted }: { lesson: Lesson; onComplete: () => void; isCompleted: boolean }) {
  const getLessonContent = () => {
    switch (lesson.type) {
      case 'video':
        if (!lesson.contentUrl) {
          return (
            <div className="flex items-center justify-center w-full bg-black rounded-lg aspect-video">
              <p className="text-muted-foreground">URL video tidak tersedia.</p>
            </div>
          );
        }
        return (
          <video key={lesson.id} controls className="w-full aspect-video rounded-lg bg-black" src={lesson.contentUrl}>
            Browser Anda tidak mendukung tag video.
          </video>
        );
      case 'youtube':
        const embedUrl = getYouTubeEmbedUrl(lesson.contentUrl || '');
        if (!embedUrl) {
           return (
            <div className="flex items-center justify-center w-full bg-black rounded-lg aspect-video">
              <p className="text-muted-foreground">URL YouTube tidak valid.</p>
            </div>
          );
        }
        return (
          <div className="aspect-video w-full">
            <iframe
              className="w-full h-full rounded-lg"
              src={embedUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        );
      case 'text':
        return (
          <div
            className="prose dark:prose-invert max-w-none p-6 bg-muted/30 rounded-lg border"
            dangerouslySetInnerHTML={{ __html: lesson.content || '' }}
          />
        );
      case 'zip':
        return (
          <div className="p-6 bg-muted/30 rounded-lg border text-center">
            <h3 className="text-lg font-semibold mb-4">Materi Unduhan</h3>
            <Button asChild disabled={!lesson.contentUrl}>
              <a href={lesson.contentUrl || undefined} download>
                <Download className="mr-2" /> Unduh File ZIP
              </a>
            </Button>
            {!lesson.contentUrl && (
              <p className="mt-2 text-sm text-muted-foreground">URL untuk mengunduh tidak tersedia.</p>
            )}
          </div>
        );
      default:
        return <p>Tipe konten tidak didukung.</p>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{lesson.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {getLessonContent()}
        <Button onClick={onComplete} disabled={isCompleted} className="w-full" size="lg">
          {isCompleted ? <><CheckCircle className="mr-2" /> Selesai</> : 'Tandai sebagai Selesai'}
        </Button>
      </CardContent>
    </Card>
  );
}

function CourseContentDisplay({
  modules,
  activeLessonId,
  completedLessonIds,
  onLessonClick,
}: {
  modules: Module[];
  activeLessonId: string | null;
  completedLessonIds: Set<string>;
  onLessonClick: (lesson: Lesson) => void;
}) {
  const getLessonIcon = (type: Lesson['type']) => {
    switch (type) {
      case 'video': return <Film className="h-5 w-5 text-muted-foreground" />;
      case 'youtube': return <Youtube className="h-5 w-5 text-red-500" />;
      case 'text': return <FileText className="h-5 w-5 text-muted-foreground" />;
      case 'zip': return <Package className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <Accordion type="multiple" defaultValue={modules.map(m => m.id)} className="w-full">
      {modules.map((module) => (
        <AccordionItem value={module.id} key={module.id} className="border-b-0">
          <AccordionTrigger className="text-base font-semibold hover:no-underline py-3 px-6">
            <div className="flex-1 text-left">{module.title}</div>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-1 pr-6 pb-2">
              {module.lessons.map((lesson) => (
                <li
                  key={lesson.id}
                  onClick={() => onLessonClick(lesson)}
                  className={cn(
                    'flex items-center justify-between cursor-pointer hover:bg-muted/50 ml-6 p-2 rounded-md transition-colors',
                    lesson.id === activeLessonId && 'bg-primary/10'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {getLessonIcon(lesson.type)}
                    <span className="text-sm">{lesson.title}</span>
                  </div>
                  <CheckCircle className={cn('h-5 w-5 text-primary transition-opacity', completedLessonIds.has(lesson.id) ? 'opacity-100' : 'opacity-20')} />
                </li>
              ))}
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
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const startButtonRef = useRef<HTMLButtonElement>(null);


  // Load course data
  useEffect(() => {
    if (params.id) {
      const courseData = getCourseById(params.id);
      setCourse(courseData);
    }
  }, [params.id]);

  // Load progress and set initial lesson
  useEffect(() => {
    if (course) {
      const storedProgress = localStorage.getItem(`progress_${course.id}`);
      if (storedProgress) {
        setCompletedLessons(new Set(JSON.parse(storedProgress)));
      }
      
      if (!activeLesson && course.modules?.[0]?.lessons?.[0]) {
        setActiveLesson(course.modules[0].lessons[0]);
      }
    }
  }, [course, activeLesson]);

  // Save progress
  useEffect(() => {
    if (course && completedLessons.size > 0) {
      localStorage.setItem(`progress_${course.id}`, JSON.stringify(Array.from(completedLessons)));
    }
  }, [completedLessons, course]);

  const findNextLesson = (currentLessonId: string): Lesson | null => {
    if (!course) return null;
    const allLessons: Lesson[] = course.modules.flatMap(m => m.lessons);
    const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
    if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
      return allLessons[currentIndex + 1];
    }
    return null;
  };

  const handleLessonClick = (lesson: Lesson) => {
    setActiveLesson(lesson);
  };

  const handleMarkAsComplete = () => {
    if (!activeLesson) return;

    setCompletedLessons(prev => new Set(prev).add(activeLesson.id));

    const nextLesson = findNextLesson(activeLesson.id);
    if (nextLesson) {
      setActiveLesson(nextLesson);
      toast({ title: 'Bagus!', description: 'Lanjut ke pelajaran berikutnya.' });
    } else {
      toast({
        title: 'Selamat!',
        description: 'Anda telah menyelesaikan semua pelajaran di kursus ini!',
        variant: 'default',
        duration: 5000,
      });
    }
  };

  if (course === undefined) {
    return (
      <div className="grid lg:grid-cols-5 gap-8 p-4 md:p-6">
        <div className="lg:col-span-3 space-y-6">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="w-full aspect-video rounded-lg" />
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

  const totalLessons = course.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
  const progress = totalLessons > 0 ? (completedLessons.size / totalLessons) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">{course.title}</h1>
          
          {activeLesson ? (
            <LessonDisplay 
              lesson={activeLesson}
              onComplete={handleMarkAsComplete}
              isCompleted={completedLessons.has(activeLesson.id)}
            />
          ) : (
             <Card>
              <CardContent className='p-6'>
                <p className="text-center text-muted-foreground">Pilih pelajaran dari daftar untuk memulai.</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Tentang Kursus Ini</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{course.description}</p>
            </CardContent>
          </Card>
        </div>

        <aside className="lg:col-span-2 space-y-6 lg:sticky lg:top-6 h-fit">
          <Card>
            <CardHeader>
              <p className="text-muted-foreground">Oleh <span className="font-semibold text-foreground">{course.instructor}</span></p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground">{completedLessons.size} dari {totalLessons} pelajaran selesai.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Isi Kursus</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {course.modules.length > 0 ? (
                <CourseContentDisplay
                  modules={course.modules}
                  activeLessonId={activeLesson?.id || null}
                  completedLessonIds={completedLessons}
                  onLessonClick={handleLessonClick}
                />
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
