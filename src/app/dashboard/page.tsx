import { AiSuggestions } from '@/components/ai-suggestions';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getCourseById, getUserById } from '@/lib/data';
import { BookCheck, CheckCircle, Clock, Users } from 'lucide-react';
import type { User } from '@/types';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const userId = cookies().get('userId')?.value;

  if (!userId) {
    redirect('/');
  }
  
  const user: User | undefined = await getUserById(userId);

  if (!user) {
    redirect('/');
  }

  const inProgressCourses = await Promise.all(
    Object.entries(user.courseProgress)
      .filter(([, progress]) => progress < 100)
      .map(async ([courseId, progress]) => {
        const course = await getCourseById(courseId);
        return { ...course, progress };
      })
  );

  const completedCoursesCount = Object.values(user.courseProgress).filter(
    (progress) => progress === 100
  ).length;
  
  return (
    <div className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Selamat datang kembali, {user.name}!</CardTitle>
            <CardDescription>
              {user.role === 'admin'
                ? "Berikut adalah ikhtisar platform Anda."
                : "Inilah yang terjadi dengan kursus Anda."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user.role === 'member' && user.membershipDuration && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Status Keanggotaan</p>
                <Badge variant="default">Anggota Premium</Badge>
                <p className="text-xs text-muted-foreground">
                  Keanggotaan Anda aktif untuk {user.membershipDuration} bulan ke depan.
                </p>
              </div>
            )}
             {user.role === 'admin' && (
                <div className="grid grid-cols-2 gap-4">
                     <div className="flex items-center gap-4 rounded-lg bg-secondary p-4">
                        <Users className="h-8 w-8 text-muted-foreground" />
                        <div>
                            <p className="text-2xl font-bold">1,234</p>
                            <p className="text-sm text-muted-foreground">Total Pengguna</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 rounded-lg bg-secondary p-4">
                        <BookCheck className="h-8 w-8 text-muted-foreground" />
                        <div>
                            <p className="text-2xl font-bold">42</p>
                            <p className="text-sm text-muted-foreground">Total Kursus</p>
                        </div>
                    </div>
                </div>
            )}
          </CardContent>
        </Card>
        
        <AiSuggestions user={user} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kursus Saya</CardTitle>
          <CardDescription>Gambaran umum tentang kursus Anda saat ini dan yang telah selesai.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
             <div className="flex items-center gap-4 rounded-lg border p-4">
                <Clock className="h-8 w-8 text-muted-foreground" />
                <div>
                    <p className="text-2xl font-bold">{inProgressCourses.length}</p>
                    <p className="text-sm text-muted-foreground">Kursus Sedang Berjalan</p>
                </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg border p-4">
                <CheckCircle className="h-8 w-8 text-muted-foreground" />
                <div>
                    <p className="text-2xl font-bold">{completedCoursesCount}</p>
                    <p className="text-sm text-muted-foreground">Kursus Selesai</p>
                </div>
            </div>
          </div>
        
          <h3 className="mb-4 mt-6 text-lg font-semibold">Sedang Berjalan</h3>
          {inProgressCourses.length > 0 ? (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Kursus</TableHead>
                        <TableHead className="w-[150px] text-center">Kemajuan</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                {inProgressCourses.map((course) => (
                    course.id && (
                    <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                            <Progress value={course.progress} className="w-full" />
                            <span className="text-sm font-medium">{course.progress}%</span>
                        </div>
                    </TableCell>
                    </TableRow>
                    )
                ))}
                </TableBody>
            </Table>
          ) : (
            <div className="text-center text-muted-foreground">
              Anda tidak memiliki kursus yang sedang berjalan. Jelajahi katalog kursus untuk memulai!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
