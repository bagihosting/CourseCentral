
import { getCourseById, getAllCourses } from '@/actions/courses';
import { getSeoSettings } from '@/actions/settings';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gem, Check, ArrowRight, BookOpenCheck } from 'lucide-react';
import Link from 'next/link';

type Props = {
  params: { id: string };
};

// Generate metadata for the page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = await getCourseById(params.id);
  const seoSettings = await getSeoSettings();

  if (!course || course.status !== 'published') {
    return {
      title: 'Kursus Tidak Ditemukan',
    };
  }

  const title = course.seoTitle || course.title;
  const description = course.seoDescription || course.description;
  const keywords = course.seoKeywords || seoSettings.metaKeywords;

  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    provider: {
      '@type': 'Organization',
      name: seoSettings.platformName,
    },
    ...(course.price > 0 && {
        offers: {
            '@type': 'Offer',
            price: course.price,
            priceCurrency: 'IDR',
        }
    })
  };

  return {
    title: `${title} ${seoSettings.titleSuffix}`,
    description: description,
    keywords: keywords,
    openGraph: {
      title: `${title} ${seoSettings.titleSuffix}`,
      description: description,
      images: [course.imageUrl],
      type: 'article',
    },
    other: {
        'script[type="application/ld+json"]': JSON.stringify(courseSchema),
    }
  };
}

// Generate static paths for all courses
export async function generateStaticParams() {
    try {
        const courses = await getAllCourses();
        return courses.map((course) => ({
            id: course.id,
        }));
    } catch (error) {
        console.warn("Could not generate static params for courses, likely due to DB connection issues during build. Skipping.");
        return [];
    }
}

export default async function PublicCoursePage({ params }: Props) {
  const course = await getCourseById(params.id);

  if (!course || course.status !== 'published') {
    notFound();
  }

  return (
    <div className="bg-muted/30 min-h-screen">
      <main className="container mx-auto py-12 md:py-16">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div className="space-y-4">
              {course.accessLevel === 'pro' && (
                  <Badge variant="outline" className="text-violet-500 border-violet-500 bg-violet-500/10">
                      <Gem className="mr-1.5 h-4 w-4" />
                      Kursus Pro
                  </Badge>
              )}
              <h1 className="text-4xl font-extrabold tracking-tight">{course.title}</h1>
              <p className="text-xl text-muted-foreground">{course.description}</p>
              <p className="text-sm text-muted-foreground">Oleh: <span className="font-semibold">{course.instructor}</span></p>
            </div>

            {/* Image */}
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg">
                <Image src={course.imageUrl} alt={course.title} fill className="object-cover" />
            </div>

            {/* Modules */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BookOpenCheck />Apa yang akan Anda Pelajari?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {course.modules.length > 0 ? course.modules.map(module => (
                  <div key={module.id} className="p-3 border rounded-md bg-background">
                    <h3 className="font-semibold">{module.title}</h3>
                    <ul className="mt-2 space-y-2 pl-4">
                      {module.lessons.map(lesson => (
                        <li key={lesson.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-green-500" />
                          <span>{lesson.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )) : (
                  <p className="text-muted-foreground">Detail kurikulum akan segera tersedia.</p>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* CTA Sidebar */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">
                    {course.price === 0 ? 'Gratis' : `Rp${course.price.toLocaleString('id-ID')}`}
                </CardTitle>
                 <CardDescription>Akses penuh ke semua materi kursus.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" size="lg">
                    <Link href={`/dashboard/courses/${course.id}`}>
                        Mulai Belajar Sekarang <ArrowRight className="ml-2"/>
                    </Link>
                </Button>
                 <p className="text-xs text-muted-foreground text-center mt-2">Masuk atau daftar untuk memulai.</p>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-3">
                  <h4 className="font-semibold text-sm">Kursus ini mencakup:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2"><Check /> Akses materi seumur hidup</li>
                      <li className="flex items-center gap-2"><Check /> Sertifikat penyelesaian</li>
                  </ul>
              </CardFooter>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}
