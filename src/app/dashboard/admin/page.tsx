
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getAllUsers } from '@/actions/users';
import { getAllCoursesForAdmin } from '@/actions/courses';
import { getAffiliateStats, getWithdrawalRequests } from '@/actions/affiliate';
import { getUpgradeRequests, getCertificateRequests } from '@/actions/requests';
import { getCoursesForAdminReview } from '@/actions/courses';
import { getInstructorApplications } from '@/actions/instructor';
import { Users, BookOpenCheck, Gem, GraduationCap, Banknote, DollarSign, ArrowRight, BookOpen, UserCheck, FileClock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Course } from '@/types';
import { useAuth } from '@/contexts/auth-context';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    proMembers: 0,
    instructors: 0,
    totalCourses: 0,
    totalUnpaid: 0,
    totalWithdrawn: 0,
  });
  const [pending, setPending] = useState({
    proRequests: 0,
    courseReviews: 0,
    instructorRequests: 0,
    certificateRequests: 0
  });
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [
          users, 
          courses, 
          affiliateStats, 
          withdrawals, 
          proRequests, 
          courseReviews, 
          instructorRequests,
          certificateRequests
        ] = await Promise.all([
          getAllUsers(),
          getAllCoursesForAdmin(),
          getAffiliateStats(),
          getWithdrawalRequests(),
          getUpgradeRequests(),
          getCoursesForAdminReview(),
          getInstructorApplications(),
          getCertificateRequests()
        ]);

        const proMembers = users.filter(u => u.role === 'pro' || u.role === 'instructor' || u.role === 'admin').length;
        const instructors = users.filter(u => u.role === 'instructor').length;
        const totalUnpaid = affiliateStats.reduce((acc, stat) => acc + stat.unpaidBalance, 0);
        const totalWithdrawn = withdrawals.filter(w => w.status === 'approved').reduce((acc, w) => acc + w.amount, 0);
        
        setRecentCourses(courses.slice(0, 5));

        setStats({
          totalUsers: users.length,
          proMembers,
          instructors,
          totalCourses: courses.length,
          totalUnpaid,
          totalWithdrawn,
        });

        setPending({
            proRequests: proRequests.filter(r => r.status === 'pending').length,
            courseReviews: courseReviews.length,
            instructorRequests: instructorRequests.length,
            certificateRequests: certificateRequests.filter(r => r.status === 'pending').length,
        })

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
      return (
        <div className="space-y-8">
            <div className="space-y-2">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-5 w-80" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
            </div>
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
            </div>
             <div className="space-y-4">
                <Skeleton className="h-7 w-48 mb-2" />
                <Card>
                    <CardContent className="p-6">
                        <Skeleton className="h-40 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
      );
  }
  
  const isSuperAdmin = user?.tenant_id === 'platform_main';
  const welcomeMessage = isSuperAdmin ? 'Dasbor Super Admin' : 'Dasbor Admin';
  const welcomeDescription = isSuperAdmin ? 'Ringkasan dan statistik vital dari seluruh platform.' : 'Ringkasan dan statistik vital dari tenant Anda.';

  const statCards = [
      { title: "Total Pengguna", value: stats.totalUsers, icon: Users },
      { title: "Member Pro", value: stats.proMembers, icon: Gem },
      { title: "Total Pengajar", value: stats.instructors, icon: GraduationCap },
      { title: "Total Kursus", value: stats.totalCourses, icon: BookOpenCheck },
      { title: "Komisi Terutang", value: `Rp${stats.totalUnpaid.toLocaleString('id-ID')}`, icon: DollarSign },
      { title: "Total Ditarik", value: `Rp${stats.totalWithdrawn.toLocaleString('id-ID')}`, icon: Banknote },
  ]

  const pendingCards = [
      { title: "Permintaan Jadi Pengajar", value: pending.instructorRequests, icon: UserCheck, href: "/dashboard/admin/instructor-requests" },
      { title: "Kursus Perlu Direview", value: pending.courseReviews, icon: BookOpen, href: "/dashboard/admin/course-review" },
      { title: "Permintaan Upgrade Pro", value: pending.proRequests, icon: Gem, href: "/dashboard/admin/pro-requests" },
      { title: "Permintaan Sertifikat", value: pending.certificateRequests, icon: FileClock, href: "/dashboard/admin/certificate-requests" },
  ]

  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold">{welcomeMessage}</h1>
            <p className="text-muted-foreground">{welcomeDescription}</p>
        </div>
        
        {!isSuperAdmin && (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {statCards.map(card => (
                    <Card key={card.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                            <card.icon className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{card.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            
            <div>
                <h2 className="text-2xl font-bold mb-4">Tindakan Cepat</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {pendingCards.map(card => (
                        <Card key={card.title} className="flex flex-col">
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                               <div className="space-y-1">
                                    <CardTitle className="text-lg">{card.title}</CardTitle>
                                    <div className="text-3xl font-bold">{card.value}</div>
                               </div>
                               <card.icon className="h-8 w-8 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="flex-grow"></CardContent>
                            <CardFooter>
                               <Button asChild className="w-full">
                                    <Link href={card.href}>
                                        Tinjau Sekarang <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                               </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
          </>
        )}

        <Card>
            <CardHeader>
              <CardTitle>Kursus Terbaru</CardTitle>
              <CardDescription>5 kursus yang baru saja ditambahkan di {isSuperAdmin ? 'seluruh platform' : 'tenant Anda'}.</CardDescription>
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
    </div>
  );
}
