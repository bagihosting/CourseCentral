'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/hooks/use-user';
import { Skeleton } from '@/components/ui/skeleton';
import { getAllCourses, getAllUsers } from '@/lib/data';
import type { Course, User as UserType } from '@/types';
import { BookOpenCheck, Users, GraduationCap } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setCourses(getAllCourses());
      if (user.role === 'admin') {
        setUsers(getAllUsers());
      }
      setLoading(false);
    }
  }, [user]);

  if (!user || loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium"><Skeleton className="h-5 w-24" /></CardTitle>
              <Skeleton className="h-6 w-6 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium"><Skeleton className="h-5 w-24" /></CardTitle>
              <Skeleton className="h-6 w-6 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  const userName = user?.name || 'Pengguna';
  
  const totalLessons = courses.reduce((acc, course) => 
    acc + course.modules.reduce((modAcc, mod) => modAcc + mod.lessons.length, 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Selamat datang kembali, {userName}!</h1>
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
                <CardTitle className="text-sm font-medium">Kursus Tersedia</CardTitle>
                <BookOpenCheck className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{courses.length}</div>
                <p className="text-xs text-muted-foreground">Jelajahi semua kursus yang ada</p>
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
          </>
        )}
      </div>
    </div>
  );
}
