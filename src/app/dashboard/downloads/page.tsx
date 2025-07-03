'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getAllCourses } from '@/lib/data';
import { Download, FileText, Film, Archive, Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { Course } from '@/types';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

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


export default function DownloadsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const { user, loading } = useAuth();

  useEffect(() => {
    // Only fetch courses if the user is loaded and has access
    if (!loading && user && (user.role === 'admin' || user.role === 'pro')) {
      setCourses(getAllCourses());
    }
  }, [loading, user]);

  const allDownloads = courses.flatMap(course => 
    course.modules.flatMap(module => 
      module.lessons
        .filter(lesson => lesson.downloadable && lesson.contentUrl) // Ensure it's downloadable and has a URL
        .map(lesson => ({
          courseTitle: course.title,
          lessonTitle: lesson.title,
          type: lesson.type,
          contentUrl: lesson.contentUrl,
        }))
    )
  );

  const getIcon = (type: 'video' | 'text' | 'zip' | 'youtube') => {
    switch (type) {
      case 'video': return <Film className="h-5 w-5 text-muted-foreground" />;
      case 'text': return <FileText className="h-5 w-5 text-muted-foreground" />;
      case 'zip': return <Archive className="h-5 w-5 text-muted-foreground" />;
      default: return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };

  if (loading) {
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
                ? 'Berikut adalah daftar semua materi yang dapat Anda unduh.'
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
                        <Button variant="ghost" size="sm" asChild disabled={!item.contentUrl}>
                            <a href={item.contentUrl} download className="flex items-center justify-end gap-2">
                                <Download className="h-4 w-4" /> Unduh
                            </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                Saat Anda mendaftar kursus dengan materi yang dapat diunduh, materi tersebut akan muncul di sini.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
