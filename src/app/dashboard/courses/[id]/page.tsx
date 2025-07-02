'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import type { Course, Module, Lesson } from '@/types';
import { getCourseById, isUserEnrolled, enrollUserInCourse } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, Film, FileText, Package, Download, Youtube, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import YouTube from 'react-youtube';


function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  let videoId = null;
  try {
    const urlObject = new URL(url);
    if (urlObject.hostname.includes('youtu.be')) {
      videoId = urlObject.pathname.substring(1);
    } else {
      videoId = urlObject.searchParams.get('v');
    }
  } catch (e) {
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    videoId = match ? match[1] : null;
  }
  return videoId;
}

function calculateReadingTime(htmlContent: string): number {
    if (!htmlContent) return 5000; // Default 5 seconds if empty
    const text = htmlContent.replace(/<[^>]*>?/gm, '');
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const wpm = 200; // Words per minute
    const time = Math.round((wordCount / wpm) * 60 * 1000);
    return Math.max(time, 5000); // Minimum 5 seconds
}


function LessonDisplay({ lesson, onComplete, isCompleted }: { lesson: Lesson; onComplete: () => void; isCompleted: boolean }) {
  const [textProgress, setTextProgress] = useState(0);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout | undefined;
    let completeTimeout: NodeJS.Timeout | undefined;

    if (lesson.type === 'text' && !isCompleted) {
        const totalDuration = calculateReadingTime(lesson.content || '');
        const intervalDuration = 100; // Update progress every 100ms
        let elapsedTime = 0;
        
        progressInterval = setInterval(() => {
            elapsedTime += intervalDuration;
            const currentProgress = (elapsedTime / totalDuration) * 100;
            setTextProgress(Math.min(currentProgress, 100));
        }, intervalDuration);

        completeTimeout = setTimeout(() => {
            clearInterval(progressInterval);
            onComplete();
        }, totalDuration);
    }

    // Cleanup function
    return () => {
        clearInterval(progressInterval);
        clearTimeout(completeTimeout);
    };
  }, [lesson, isCompleted, onComplete]);


  const handleVideoEnd = () => {
    if (!isCompleted) {
      onComplete();
    }
  }

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
          <video key={lesson.id} controls className="w-full aspect-video rounded-lg bg-black" src={lesson.contentUrl} onEnded={handleVideoEnd}>
            Browser Anda tidak mendukung tag video.
          </video>
        );
      case 'youtube':
        const videoId = getYouTubeVideoId(lesson.contentUrl || '');
        if (!videoId) {
           return (
            <div className="flex items-center justify-center w-full bg-black rounded-lg aspect-video">
              <p className="text-muted-foreground">URL YouTube tidak valid.</p>
            </div>
          );
        }
        return (
          <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
            <YouTube
              videoId={videoId}
              className="w-full h-full"
              iframeClassName="w-full h-full"
              opts={{
                playerVars: {
                  autoplay: 1,
                  rel: 0,
                },
              }}
              onEnd={handleVideoEnd}
            />
          </div>
        );
      case 'text':
        return (
            <>
                <div
                    className="prose dark:prose-invert max-w-none p-6 bg-muted/30 rounded-lg border"
                    dangerouslySetInnerHTML={{ __html: lesson.content || '' }}
                />
                {!isCompleted && <Progress value={textProgress} className="w-full h-2 mt-4" />}
            </>
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
      <CardContent>
        {getLessonContent()}
      </CardContent>
    </Card>
  );
}

function CourseContentDisplay({
  modules,
  activeLessonId,
  completedLessonIds,
  onLessonClick,
  isLessonUnlocked,
}: {
  modules: Module[];
  activeLessonId: string | null;
  completedLessonIds: Set<string>;
  onLessonClick: (lesson: Lesson) => void;
  isLessonUnlocked: (lessonId: string) => boolean;
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
              {module.lessons.map((lesson) => {
                const unlocked = isLessonUnlocked(lesson.id);
                return (
                  <li
                    key={lesson.id}
                    onClick={() => unlocked && onLessonClick(lesson)}
                    className={cn(
                      'flex items-center justify-between ml-6 p-2 rounded-md transition-colors',
                      unlocked ? 'cursor-pointer hover:bg-muted/50' : 'opacity-50 cursor-not-allowed',
                      lesson.id === activeLessonId && 'bg-primary/10'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {unlocked ? getLessonIcon(lesson.type) : <Lock className="h-5 w-5 text-muted-foreground" />}
                      <span className="text-sm">{lesson.title}</span>
                    </div>
                    <CheckCircle className={cn('h-5 w-5 text-primary transition-opacity', completedLessonIds.has(lesson.id) ? 'opacity-100' : 'opacity-20')} />
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
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { user, loading: userLoading } = useAuth();
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load course, user, and progress data
  useEffect(() => {
    if (userLoading) return;

    if (!user) {
        toast({ title: 'Akses Ditolak', description: 'Anda harus masuk untuk melihat kursus.', variant: 'destructive'});
        router.push('/');
        return;
    }

    const courseData = getCourseById(params.id);
    if (courseData) {
        setCourse(courseData);
        const isEnrolled = user.role === 'admin' || isUserEnrolled(user.id, courseData.id);
        setEnrolled(isEnrolled);
        
        if (isEnrolled) {
            const storedProgress = localStorage.getItem(`progress_${user.id}_${courseData.id}`);
            const initialCompleted = storedProgress ? new Set(JSON.parse(storedProgress)) : new Set<string>();
            setCompletedLessons(initialCompleted);

            const allLessons = courseData.modules.flatMap(m => m.lessons);
            const firstUncompleted = allLessons.find(l => !initialCompleted.has(l.id)) || allLessons[allLessons.length - 1] || null;
            setActiveLesson(firstUncompleted);
        }
    } else {
        setCourse(null); // Course not found
    }

    setLoading(false);
  }, [params.id, user, userLoading, router, toast]);

  // Save progress whenever it changes
  useEffect(() => {
    if (course && user) {
      localStorage.setItem(`progress_${user.id}_${course.id}`, JSON.stringify(Array.from(completedLessons)));
    }
  }, [completedLessons, course, user]);

  const allLessons = useMemo(() => course?.modules.flatMap(m => m.lessons) ?? [], [course]);

  const findNextLesson = useCallback((currentLessonId: string): Lesson | null => {
    const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
    if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
      return allLessons[currentIndex + 1];
    }
    return null;
  }, [allLessons]);

  const isLessonUnlocked = useCallback((lessonId: string): boolean => {
    const lessonIndex = allLessons.findIndex(l => l.id === lessonId);
    if (lessonIndex === -1) return false;
    if (lessonIndex === 0) return true; // First lesson is always unlocked
    const previousLesson = allLessons[lessonIndex - 1];
    return completedLessons.has(previousLesson.id);
  }, [allLessons, completedLessons]);

  const handleLessonClick = (lesson: Lesson) => {
    if (isLessonUnlocked(lesson.id)) {
        setActiveLesson(lesson);
    } else {
        toast({
            title: 'Terkunci',
            description: 'Selesaikan pelajaran sebelumnya terlebih dahulu untuk membuka pelajaran ini.',
            variant: 'default'
        });
    }
  };

  const handleMarkAsComplete = useCallback(() => {
    if (!activeLesson || completedLessons.has(activeLesson.id)) return;

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
  }, [activeLesson, completedLessons, findNextLesson, toast]);

  const handleEnroll = () => {
    if (user && course) {
        enrollUserInCourse(user.id, course.id);
        setEnrolled(true);
        const firstLesson = course.modules?.[0]?.lessons?.[0] || null;
        setActiveLesson(firstLesson);
        toast({
            title: "Pendaftaran Berhasil!",
            description: `Anda sekarang terdaftar di kursus "${course.title}".`,
        });
    }
  };

  if (loading || userLoading) {
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
          
          {enrolled && activeLesson ? (
            <LessonDisplay 
              lesson={activeLesson}
              onComplete={handleMarkAsComplete}
              isCompleted={completedLessons.has(activeLesson.id)}
            />
          ) : enrolled ? (
             <Card>
              <CardContent className='p-6'>
                <p className="text-center text-muted-foreground">Pilih pelajaran dari daftar untuk memulai.</p>
              </CardContent>
            </Card>
          ) : (
             <Card>
                <CardContent className="p-6 text-center">
                    <Lock className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">Anda Belum Terdaftar</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Ikuti kursus ini untuk mengakses semua pelajaran dan materi.
                    </p>
                    <Button onClick={handleEnroll} className="mt-4">
                        Ikuti Kursus Ini
                    </Button>
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
                enrolled ? (
                    <CourseContentDisplay
                    modules={course.modules}
                    activeLessonId={activeLesson?.id || null}
                    completedLessonIds={completedLessons}
                    onLessonClick={handleLessonClick}
                    isLessonUnlocked={isLessonUnlocked}
                    />
                ) : (
                    <div className="p-6 text-center text-muted-foreground">
                        <Lock className="h-6 w-6 mx-auto mb-2" />
                        Daftar untuk melihat kurikulum.
                    </div>
                )
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
