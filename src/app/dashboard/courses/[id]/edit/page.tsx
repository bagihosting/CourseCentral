'use client';

import { useEffect, useState } from 'react';
import { CourseForm } from '@/components/course-form';
import { CurriculumManager } from '@/components/curriculum-manager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCourseById, updateCourse } from '@/lib/data';
import { useParams, notFound } from 'next/navigation';
import type { Course } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function CourseSeoForm({ course, onUpdate }: { course: Course, onUpdate: () => void }) {
    const [seoTitle, setSeoTitle] = useState(course.seoTitle || '');
    const [seoDescription, setSeoDescription] = useState(course.seoDescription || '');
    const [seoKeywords, setSeoKeywords] = useState(course.seoKeywords || '');
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const handleSave = () => {
        setIsSaving(true);
        try {
            updateCourse(course.id, { seoTitle, seoDescription, seoKeywords });
            toast({ title: 'Sukses', description: 'Pengaturan SEO kursus berhasil disimpan.' });
            onUpdate();
        } catch(e) {
            const errorMessage = e instanceof Error ? e.message : 'Terjadi kesalahan tidak diketahui.';
            toast({ title: 'Gagal Menyimpan', description: errorMessage, variant: 'destructive'});
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="seo-title">Judul SEO</Label>
                <Input
                    id="seo-title"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Judul yang dioptimalkan untuk mesin pencari"
                />
                <p className="text-xs text-muted-foreground">Jika kosong, akan menggunakan judul kursus.</p>
            </div>
             <div className="space-y-2">
                <Label htmlFor="seo-description">Deskripsi SEO</Label>
                <Textarea
                    id="seo-description"
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="Deskripsi singkat (150-160 karakter) untuk mesin pencari"
                    rows={4}
                />
                 <p className="text-xs text-muted-foreground">Jika kosong, akan menggunakan deskripsi kursus.</p>
            </div>
             <div className="space-y-2">
                <Label htmlFor="seo-keywords">Kata Kunci SEO</Label>
                <Input
                    id="seo-keywords"
                    value={seoKeywords}
                    onChange={(e) => setSeoKeywords(e.target.value)}
                    placeholder="Contoh: belajar react, kursus javascript, web development"
                />
                 <p className="text-xs text-muted-foreground">Pisahkan kata kunci dengan koma.</p>
            </div>
             <CardFooter className="px-0 pb-0 pt-4">
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simpan Pengaturan SEO
                </Button>
            </CardFooter>
        </div>
    );
}

export default function EditCoursePage() {
  const params = useParams<{ id: string }>();
  const courseId = params.id;

  const [course, setCourse] = useState<Course | undefined | null>(undefined);

  const refreshCourse = () => {
    const courseData = getCourseById(courseId);
    setCourse(courseData);
  }

  useEffect(() => {
    refreshCourse();
  }, [courseId]);

  if (course === undefined) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-5 w-1/2" />
                </CardHeader>
            </Card>
        </div>
    )
  }

  if (course === null) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Kelola Kursus: {course.title}</CardTitle>
          <CardDescription>
            Perbarui detail kursus dan kelola kurikulum di sini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Detail Kursus</TabsTrigger>
              <TabsTrigger value="curriculum">Kurikulum</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-6">
              <Card>
                <CardHeader>
                    <CardTitle>Detail Halaman Utama</CardTitle>
                    <CardDescription>Informasi ini akan ditampilkan di halaman katalog kursus.</CardDescription>
                </CardHeader>
                <CardContent>
                    <CourseForm course={course} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="curriculum" className="mt-6">
               <CurriculumManager course={course} onUpdate={refreshCourse} />
            </TabsContent>
            <TabsContent value="seo" className="mt-6">
               <Card>
                <CardHeader>
                    <CardTitle>Pengaturan SEO Kursus</CardTitle>
                    <CardDescription>Optimalkan bagaimana kursus ini muncul di mesin pencari.</CardDescription>
                </CardHeader>
                <CardContent>
                    <CourseSeoForm course={course} onUpdate={refreshCourse} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
