
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Eye, BookOpen, User, Loader2 } from 'lucide-react';
import { getCoursesForAdminReview, publishCourse, rejectCourse, type CourseForReview } from '@/actions/courses';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { RelativeTime } from '@/components/relative-time';

function RejectDialog({ courseId, onFinished }: { courseId: string; onFinished: () => void }) {
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const handleReject = async () => {
        if (!notes) {
            toast({ title: 'Catatan Diperlukan', description: 'Harap berikan alasan penolakan.', variant: 'destructive' });
            return;
        }
        setIsSaving(true);
        try {
            await rejectCourse(courseId, notes);
            toast({ title: 'Sukses', description: 'Kursus telah ditolak dan dikembalikan ke pengajar.' });
            onFinished();
        } catch(e) {
            const err = e as Error;
            toast({ title: 'Gagal', description: err.message, variant: 'destructive'});
        } finally {
            setIsSaving(false);
        }
    }
    
    return (
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Tolak Kursus Ini?</AlertDialogTitle>
                <AlertDialogDescription>
                    Kursus akan dikembalikan ke status 'draft' dan pengajar akan melihat catatan Anda.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
                <Label htmlFor="rejection-notes">Alasan Penolakan</Label>
                <Input id="rejection-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleReject} disabled={isSaving || !notes}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Ya, Tolak Kursus
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    );
}

export default function CourseReviewPage() {
  const [courses, setCourses] = useState<CourseForReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  const refreshCourses = async () => {
    const data = await getCoursesForAdminReview();
    setCourses(data);
  };

  useEffect(() => {
    async function fetchData() {
        await refreshCourses();
        setLoading(false);
    }
    fetchData();
  }, []);

  const handlePublish = async (courseId: string) => {
    setProcessingId(courseId);
    try {
        await publishCourse(courseId);
        toast({ title: 'Sukses!', description: 'Kursus telah berhasil dipublikasikan.' });
        await refreshCourses();
    } catch (e) {
        const err = e as Error;
        toast({ title: 'Gagal', description: err.message, variant: 'destructive' });
    } finally {
        setProcessingId(null);
    }
  };
  
  if (loading) {
    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-64 mb-2" />
                    <Skeleton className="h-5 w-96" />
                </CardHeader>
                <CardContent><Skeleton className="h-48 w-full" /></CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BookOpen /> Tinjauan Kursus</CardTitle>
          <CardDescription>Tinjau kursus yang diajukan oleh pengajar sebelum mempublikasikannya.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul Kursus</TableHead>
                <TableHead>Pengajar</TableHead>
                <TableHead>Diajukan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Tidak ada kursus yang menunggu untuk ditinjau.
                  </TableCell>
                </TableRow>
              ) : (
                courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>{course.instructorName}</TableCell>
                     <TableCell>
                        <RelativeTime date={course.updated_at} />
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/courses/${course.id}/edit`}>
                                <Eye className="mr-2 h-4 w-4" /> Tinjau
                            </Link>
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handlePublish(course.id)}
                            disabled={!!processingId}
                        >
                            {processingId === course.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Check className="mr-2 h-4 w-4" />}
                            Publikasikan
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" disabled={!!processingId}>
                                    <X className="mr-2 h-4 w-4" /> Tolak
                                </Button>
                            </AlertDialogTrigger>
                            <RejectDialog courseId={course.id} onFinished={refreshCourses} />
                        </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
