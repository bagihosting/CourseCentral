'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/hooks/use-user';
import { Skeleton } from '@/components/ui/skeleton';
import { getAllCourses, getAllUsers } from '@/lib/data';
import type { Course, User as UserType } from '@/types';
import { BookOpenCheck, Users, GraduationCap, ArrowRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CourseCard } from '@/components/course-card';

export default function DashboardPage() {
  const { user } = useUser();
  // Initialize data states to null to represent "not yet loaded"
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [users, setUsers] = useState<UserType[] | null>(null);

  useEffect(() => {
    // This effect runs on the client after the user is identified.
    // It fetches all necessary data from localStorage.
    if (user) {
      setCourses(getAllCourses());
      if (user.role === 'admin') {
        setUsers(getAllUsers());
      }
    }
  }, [user]); // This will re-run whenever the user object changes.

  // The loading skeleton is shown until the user is identified AND all their required data is loaded.
  // This is a more robust check than a separate 'loading' state.
  if (!user || courses === null || (user.role === 'admin' && users === null)) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
             <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium"><Skeleton className="h-5 w-24" /></CardTitle>
                <Skeleton className="h-6 w-6 rounded-full" />
                </CardHeader>
                <CardContent>
                <Skeleton className="h-8 w-12" />
                </CardContent>
            </Card>
          ))}
        </div>
        <Card>
            <CardHeader>
                <Skeleton className="h-7 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
            </CardContent>
        </Card>
      </div>
    );
  }
  
  // At this point, `user` and `courses` (and `users` for admin) are guaranteed to be loaded.
  const userName = user.name || 'Pengguna';
  
  const totalLessons = courses.reduce((acc, course) => 
    acc + course.modules.reduce((modAcc, mod) => modAcc + mod.lessons.length, 0), 0);

  const recentCourses = [...courses].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 5);
  const suggestedCourses = courses.slice(0, 3);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Selamat datang kembali, {userName}!</h1>
        <p className="text-muted-foreground">
          {user.role === 'admin' 
            ? 'Ini adalah ringkasan platform kursus Anda.' 
            : 'Siap untuk melanjutkan pembelajaran Anda?'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {user.role === 'admin' ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
                <Users className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Kursus</CardTitle>
                <BookOpenCheck className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{courses.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pelajaran</CardTitle>
                <GraduationCap className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalLessons}</div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Kursus Diikuti</CardTitle>
                <BookOpenCheck className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Mulai belajar kursus baru!</p>
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pelajaran</CardTitle>
                <GraduationCap className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalLessons}</div>
                 <p className="text-xs text-muted-foreground">Di semua kursus yang tersedia</p>
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Kursus Tersedia</CardTitle>
                <BookOpenCheck className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{courses.length}</div>
                 <p className="text-xs text-muted-foreground">Jelajahi katalog kursus</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {user.role === 'admin' ? (
          <Card>
            <CardHeader>
              <CardTitle>Kursus Terbaru</CardTitle>
              <CardDescription>5 kursus yang baru saja ditambahkan ke platform.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul Kursus</TableHead>
                    <TableHead className="hidden md:table-cell">Instruktur</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentCourses.length > 0 ? (
                    recentCourses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.title}</TableCell>
                        <TableCell className="hidden md:table-cell">{course.instructor}</TableCell>
                        <TableCell className="text-right">
                          <Link href={`/dashboard/courses/${course.id}/edit`}>
                            <Button variant="outline" size="sm">
                              Kelola
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                     <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                            Belum ada kursus yang dibuat.
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold tracking-tight">Rekomendasi Untuk Anda</h2>
              <Link href="/dashboard/courses" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                Lihat Semua
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
             {suggestedCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {suggestedCourses.map(course => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </div>
             ) : (
                <div className="py-20 text-center text-muted-foreground bg-muted/30 rounded-lg border-2 border-dashed">
                    <h2 className="text-xl font-semibold">Tidak Ada Kursus Tersedia</h2>
                    <p className="mt-2">Silakan kembali lagi nanti untuk melihat kursus baru.</p>
                </div>
             )}
          </div>
        )}
    </div>
  );
}
