'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CourseCard } from '@/components/course-card';
import { getAllCourses, getSeoSettings } from '@/lib/data';
import type { Course } from '@/types';
import { BookOpenCheck, ArrowRight, ShieldCheck, Clock, Users, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function LandingPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [platformName, setPlatformName] = useState('CourseCentral');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const settings = getSeoSettings();
    if (settings && settings.platformName) {
      setPlatformName(settings.platformName);
      document.title = `${settings.platformName} - ${settings.titleSuffix || ''}`;
    }
    setCourses(getAllCourses().slice(0, 4)); // Show first 4 courses
    setLoading(false);
  }, []);

  const features = [
    {
      icon: <ShieldCheck className="h-10 w-10 text-primary" />,
      title: 'Kurikulum Terstruktur',
      description: 'Materi disusun secara sistematis dari dasar hingga mahir untuk memastikan pemahaman yang mendalam.',
    },
    {
      icon: <Clock className="h-10 w-10 text-primary" />,
      title: 'Belajar Fleksibel',
      description: 'Akses kursus kapan saja dan di mana saja. Belajar sesuai dengan kecepatan dan jadwal Anda sendiri.',
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: 'Instruktur Ahli',
      description: 'Belajar langsung dari para praktisi dan ahli di bidangnya yang memiliki pengalaman nyata.',
    },
  ];

  const testimonials = [
    {
      name: 'Andi Pratama',
      role: 'Web Developer',
      quote: `"${platformName} benar-benar mengubah cara saya belajar. Materinya sangat relevan dengan industri saat ini dan mudah dipahami."`,
      avatar: 'https://placehold.co/100x100.png',
    },
    {
      name: 'Citra Kirana',
      role: 'UI/UX Designer',
      quote: '"Saya berhasil mendapatkan pekerjaan impian saya setelah menyelesaikan kursus UI/UX di sini. Sangat direkomendasikan!"',
      avatar: 'https://placehold.co/100x100.png',
    },
  ];

  const Header = () => (
    <header className="py-4 px-4 md:px-6 bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <BookOpenCheck className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold">{platformName}</span>
        </Link>
        <nav className="hidden md:flex gap-6 items-center">
          <Link href="#courses" className="text-sm font-medium hover:text-primary transition-colors">Kursus</Link>
          <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">Fitur</Link>
        </nav>
        <Button asChild>
          <Link href="/login">Masuk / Daftar</Link>
        </Button>
      </div>
    </header>
  );

  return (
    <div className="bg-background text-foreground">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-muted/30">
          <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center px-4">
            <div className="space-y-6 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
                Tingkatkan Skill, <span className="text-primary">Buka Peluang Baru.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto md:mx-0">
                Mulai perjalanan Anda dari nol menjadi ahli dengan kursus online terstruktur yang diajar oleh para profesional terbaik di industrinya.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button size="lg" asChild>
                  <Link href="#courses">
                    Jelajahi Kursus <ArrowRight className="ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                    <Link href="/login">Daftar Sekarang</Link>
                </Button>
              </div>
            </div>
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl mx-auto w-full max-w-lg">
                <Image src="https://placehold.co/600x400.png" alt="Hero Image" fill className="object-cover" data-ai-hint="online learning students" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-28">
            <div className="container mx-auto px-4 space-y-16">
                <div className="text-center space-y-4">
                     <h2 className="text-3xl md:text-4xl font-bold">Mengapa Memilih {platformName}?</h2>
                     <p className="text-muted-foreground max-w-2xl mx-auto">Kami menyediakan platform pembelajaran yang tidak hanya berkualitas, tetapi juga dirancang untuk kesuksesan karir Anda.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, i) => (
                        <Card key={i} className="text-center p-6 border-2 border-transparent hover:border-primary hover:shadow-2xl transition-all duration-300">
                             <div className="flex justify-center mb-4">
                                <div className="p-4 bg-primary/10 rounded-full">
                                    {feature.icon}
                                </div>
                            </div>
                            <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                            <CardContent className="p-0">
                                <p className="text-muted-foreground">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

        {/* Featured Courses Section */}
        <section id="courses" className="py-20 md:py-28 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Kursus Unggulan</h2>
            {loading ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-40 w-full" />
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {courses.map(course => <CourseCard key={course.id} course={course} />)}
                </div>
            )}
            <div className="text-center mt-12">
                 <Button size="lg" variant="outline" asChild>
                    <Link href="/dashboard/courses">Lihat Semua Kursus</Link>
                </Button>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 md:py-28">
            <div className="container mx-auto px-4">
                 <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Apa Kata Mereka?</h2>
                 <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {testimonials.map((testimonial, i) => (
                         <Card key={i} className="p-6">
                            <CardContent className="p-0 space-y-4">
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, j) => <Star key={j} className="h-5 w-5 fill-current" />)}
                                </div>
                                <p className="text-muted-foreground italic">{testimonial.quote}</p>
                                <div className="flex items-center gap-4 pt-2">
                                     <Image src={testimonial.avatar} alt={testimonial.name} width={50} height={50} className="rounded-full" data-ai-hint="person portrait"/>
                                     <div>
                                        <p className="font-semibold">{testimonial.name}</p>
                                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                     </div>
                                </div>
                            </CardContent>
                         </Card>
                    ))}
                 </div>
            </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28">
            <div className="container mx-auto px-4">
                <div className="bg-primary text-primary-foreground rounded-2xl p-12 text-center shadow-xl">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Siap Memulai Perjalanan Anda?</h2>
                    <p className="max-w-2xl mx-auto mb-8 opacity-80">Daftar sekarang secara gratis dan dapatkan akses ke kursus-kursus dasar kami. Tidak ada risiko, hanya ada peluang.</p>
                    <Button size="lg" variant="secondary" asChild>
                        <Link href="/login">Daftar Gratis Sekarang</Link>
                    </Button>
                </div>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted/30 border-t">
          <div className="container mx-auto py-8 px-4 text-center text-muted-foreground">
             <p>&copy; {new Date().getFullYear()} {platformName}. Semua Hak Cipta Dilindungi.</p>
          </div>
      </footer>
    </div>
  );
}

export default LandingPage;
