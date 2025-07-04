
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getAllCourses, getEnrolledCoursesForUser } from '@/lib/data';
import { Download, FileText, Film, Archive, Lock, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { Course, Lesson } from '@/types';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import DOMPurify from 'isomorphic-dompurify';


function UpgradePrompt() {
  return (
    <Card className="text-center mt-6">
      <CardHeader>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <CardTitle>Buka Fitur Unduhan Pro</CardTitle>
        <CardDescription>
          Upgrade ke akun Pro untuk mendapatkan akses untuk mengunduh
          <br />
          semua materi kursus yang tersedia.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button size="lg" asChild>
            <Link href="/dashboard/upgrade">
                <Sparkles className="mr-2" />
                Upgrade ke Pro Sekarang
            </Link>
        </Button>
         <p className="mt-2 text-xs text-muted-foreground">(Anda akan diarahkan untuk konfirmasi manual)</p>
      </CardContent>
    </Card>
  );
}

type DownloadableItem = {
  courseTitle: string;
  lessonTitle: string;
  type: Lesson['type'];
  downloadType: 'file' | 'pdf';
  content: string; // URL for 'file', HTML content for 'pdf'
};


export default function DownloadsPage() {
  const { user, loading: userLoading } = useAuth();
  const [allDownloads, setAllDownloads] = useState<DownloadableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingPdfTitle, setDownloadingPdfTitle] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!userLoading && user && (user.role === 'admin' || user.role === 'pro')) {
      const allCoursesData = getAllCourses();
      const enrolledCourses = getEnrolledCoursesForUser(user.id);
      
      const isCourseCompleted = (course: Course): boolean => {
        if (!user) return false;
        const totalLessons = course.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
        if (totalLessons === 0) return false;
        
        const progressString = localStorage.getItem(`progress_${user.id}_${course.id}`);
        if (!progressString) return false;

        try {
          const completedLessons: string[] = JSON.parse(progressString);
          return new Set(completedLessons).size >= totalLessons;
        } catch (e) {
          return false;
        }
      };

      const completedCourses = enrolledCourses.filter(isCourseCompleted);

      // Regular downloadable files (ZIP, etc.) from ALL courses for Pro/Admin
      const regularDownloads = allCoursesData.flatMap(course => 
        course.modules.flatMap(module => 
          module.lessons
            .filter(lesson => lesson.downloadable && lesson.contentUrl)
            .map(lesson => ({
              courseTitle: course.title,
              lessonTitle: lesson.title,
              type: lesson.type,
              downloadType: 'file' as const,
              content: lesson.contentUrl!,
            }))
        )
      );

      // Text lessons from COMPLETED courses become downloadable PDFs
      const pdfDownloads = completedCourses.flatMap(course => 
        course.modules.flatMap(module => 
          module.lessons
            .filter(lesson => lesson.type === 'text' && lesson.content)
            .map(lesson => ({
              courseTitle: course.title,
              lessonTitle: lesson.title,
              type: lesson.type,
              downloadType: 'pdf' as const,
              content: lesson.content!,
            }))
        )
      );

      const combinedDownloads = [...regularDownloads, ...pdfDownloads];
      setAllDownloads(combinedDownloads);
    }
    setLoading(false);
  }, [user, userLoading]);

  const handleDownloadPdf = async (htmlContent: string, lessonTitle: string) => {
    setDownloadingPdfTitle(lessonTitle);
    toast({ title: 'Mempersiapkan PDF...', description: 'Ini mungkin memerlukan beberapa saat.' });

    const tempContainer = document.createElement('div');
    // Styling for A4-like layout
    tempContainer.style.width = '210mm';
    tempContainer.style.padding = '15mm';
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.backgroundColor = 'white';
    tempContainer.style.color = 'black';
    tempContainer.style.fontFamily = 'Arial, sans-serif';
    tempContainer.style.fontSize = '12pt';
    tempContainer.style.boxSizing = 'border-box';

    const titleElement = `<h1>${lessonTitle}</h1><hr style="margin-bottom: 1em;"/>`;
    // Using a class for prose styling allows better control if defined in globals.css
    tempContainer.innerHTML = `<div class="prose">${DOMPurify.sanitize(titleElement + htmlContent)}</div>`;
    
    document.body.appendChild(tempContainer);
    
    try {
        const canvas = await html2canvas(tempContainer, {
            scale: 2,
            useCORS: true,
            windowWidth: tempContainer.scrollWidth,
            windowHeight: tempContainer.scrollHeight,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });
        
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        let heightLeft = pdfHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();

        while (heightLeft >= 0) {
            position = heightLeft - pdfHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();
        }

        pdf.save(`materi-${lessonTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`);
        toast({ title: 'Sukses', description: 'PDF berhasil dibuat dan diunduh.' });
    } catch (e) {
        console.error(e);
        toast({ title: "Gagal Mengunduh PDF", description: "Terjadi kesalahan saat membuat PDF.", variant: "destructive" });
    } finally {
        document.body.removeChild(tempContainer);
        setDownloadingPdfTitle(null);
    }
  };


  const getIcon = (type: 'video' | 'text' | 'zip' | 'youtube') => {
    switch (type) {
      case 'video': return <Film className="h-5 w-5 text-muted-foreground" />;
      case 'text': return <FileText className="h-5 w-5 text-muted-foreground" />;
      case 'zip': return <Archive className="h-5 w-5 text-muted-foreground" />;
      default: return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };

  if (loading || userLoading) {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-5 w-80" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-4 w-96" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-40 w-full" />
                </CardContent>
            </Card>
        </div>
    );
  }

  const isProAccess = user?.role === 'admin' || user?.role === 'pro';

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Unduhan</h1>
        <p className="text-muted-foreground">Akses semua materi kursus yang dapat diunduh di sini.</p>
      </div>
      
      {!isProAccess ? (
        <UpgradePrompt />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Materi Kursus</CardTitle>
            <CardDescription>
              {allDownloads.length > 0
                ? 'Berikut adalah daftar semua materi yang dapat Anda unduh. Materi teks dari kursus yang sudah selesai akan tersedia sebagai PDF.'
                : 'Tidak ada materi yang tersedia untuk diunduh saat ini.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {allDownloads.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Pelajaran</TableHead>
                    <TableHead>Kursus</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allDownloads.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.lessonTitle}</TableCell>
                      <TableCell>{item.courseTitle}</TableCell>
                      <TableCell className="capitalize flex items-center gap-2">
                        {getIcon(item.type)}
                        {item.type}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.downloadType === 'pdf' ? (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDownloadPdf(item.content, item.lessonTitle)}
                            disabled={!!downloadingPdfTitle}
                          >
                            {downloadingPdfTitle === item.lessonTitle ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                            Unduh PDF
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" asChild disabled={!item.content || !!downloadingPdfTitle}>
                            <a href={item.content} download className="flex items-center justify-end gap-2">
                                <Download className="h-4 w-4" /> Unduh
                            </a>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                Saat Anda mendaftar kursus dengan materi yang dapat diunduh, materi tersebut akan muncul di sini. Selesaikan kursus untuk mengunduh materi teks sebagai PDF.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
