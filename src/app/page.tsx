

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CourseCard } from '@/components/course-card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { getLandingPageSettings, getAllCourses, getAllTestimonials, getSeoSettings } from '@/lib/data';
import type { Course, LandingPageSettings, Testimonial } from '@/types';
import { BookOpenCheck, ArrowRight, ShieldCheck, Clock, Users, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import DOMPurify from 'isomorphic-dompurify';

const featureIcons: { [key: string]: React.ElementType } = {
  ShieldCheck,
  Clock,
  Users,
};

function LandingPageSkeleton() {
  return (
    <div className="bg-background text-foreground">
      <header className="py-4 px-4 md:px-6 bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
        <div className="container mx-auto flex justify-between items-center">
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-10 w-28" />
        </div>
      </header>
      <main>
        <section className="py-20 md:py-32 bg-muted/30">
          <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center px-4">
            <div className="space-y-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-5/6" />
              <div className="flex gap-4">
                <Skeleton className="h-12 w-36" />
                <Skeleton className="h-12 w-36" />
              </div>
            </div>
            <Skeleton className="aspect-video rounded-2xl w-full max-w-lg mx-auto" />
          </div>
        </section>
        <section id="courses" className="py-20 md:py-28 bg-muted/30">
          <div className="container mx-auto px-4">
            <Skeleton className="h-10 w-1/2 mx-auto mb-12" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function LandingPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [settings, setSettings] = useState<LandingPageSettings | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const seoData = getSeoSettings();
    if (seoData && seoData.platformName) {
      document.title = `${seoData.platformName} - ${seoData.titleSuffix || ''}`;
    }
    const landingData = getLandingPageSettings();
    setSettings(landingData);
    setCourses(getAllCourses().slice(0, 4));

    if (landingData && landingData.featuredTestimonialIds) {
        const allTestimonials = getAllTestimonials();
        const featured = allTestimonials.filter(t => landingData.featuredTestimonialIds.includes(t.id));
        setTestimonials(featured);
    }

    setLoading(false);
  }, []);

  if (loading || !settings) {
    return <LandingPageSkeleton />;
  }

  const { platformName } = getSeoSettings();
  const features = settings.features.map(f => ({
      ...f,
      icon: React.createElement(featureIcons[f.icon] || ShieldCheck, { className: "h-10 w-10 text-primary" })
  }));

  const Header = () => (
    <header className="py-4 px-4 md:px-6 bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          {settings.logoUrl ? (
            <Image src={settings.logoUrl} alt={`${platformName} logo`} width={120} height={30} className="h-7 w-auto"/>
          ) : (
            <>
              <BookOpenCheck className="h-7 w-7 text-primary" />
              <span className="text-xl font-bold">{platformName}</span>
            </>
          )}
        </Link>
        <nav className="hidden md:flex gap-6 items-center">
          <Link href="#courses" className="text-sm font-medium hover:text-primary transition-colors">Kursus</Link>
          <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">Fitur</Link>
          <Link href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">Testimoni</Link>
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
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(settings.heroHeadline) }}></h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto md:mx-0">
                {settings.heroSubheadline}
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
                <Image src={settings.heroImageUrl} alt="Siswa sedang belajar kursus online bersertifikat" fill className="object-cover" data-ai-hint="online learning students" priority />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-28">
            <div className="container mx-auto px-4 space-y-16">
                <div className="text-center space-y-4">
                     <h2 className="text-3xl md:text-4xl font-bold">Mengapa Belajar Skill di {platformName}?</h2>
                     <p className="text-muted-foreground max-w-2xl mx-auto">Kami menyediakan platform pembelajaran yang tidak hanya berkualitas, tetapi juga dirancang untuk kesuksesan karir Anda melalui sertifikasi online terpercaya.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, i) => (
                        <Card key={i} className="text-center p-6 border-2 border-transparent hover:border-primary hover:shadow-2xl transition-all duration-300">
                             <div className="flex justify-center mb-4">
                                <div className="p-4 bg-primary/10 rounded-full">
                                    {feature.icon}
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold leading-none tracking-tight mb-2">{feature.title}</h3>
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
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Pilihan Kursus Online Populer</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {courses.map(course => <CourseCard key={course.id} course={course} />)}
            </div>
            <div className="text-center mt-12">
                 <Button size="lg" variant="outline" asChild>
                    <Link href="/dashboard/courses">Lihat Semua Kursus</Link>
                </Button>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 md:py-28">
            <div className="container mx-auto px-4">
                 <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Apa Kata Alumni Sukses Kami?</h2>
                 {testimonials.length > 2 ? (
                    <Carousel opts={{ loop: true }} className="max-w-4xl mx-auto">
                        <CarouselContent>
                            {testimonials.map((testimonial) => (
                                <CarouselItem key={testimonial.id} className="md:basis-1/2">
                                     <Card className="p-6 h-full flex flex-col">
                                        <CardContent className="p-0 space-y-4 flex-grow flex flex-col justify-between">
                                            <div>
                                                <div className="flex text-yellow-400">
                                                    {[...Array(5)].map((_, j) => <Star key={j} className={`h-5 w-5 ${j < testimonial.rating ? 'fill-current' : ''}`} />)}
                                                </div>
                                                <p className="text-muted-foreground italic mt-4">"{testimonial.quote}"</p>
                                            </div>
                                            <div className="flex items-center gap-4 pt-2">
                                                <Image src={testimonial.userAvatar} alt={testimonial.userName} width={50} height={50} className="rounded-full" data-ai-hint="person portrait"/>
                                                <div>
                                                    <h4 className="font-semibold">{testimonial.userName}</h4>
                                                    <p className="text-sm text-muted-foreground capitalize">{testimonial.userRole} Member</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                 ) : (
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {testimonials.map((testimonial) => (
                             <Card key={testimonial.id} className="p-6">
                                <CardContent className="p-0 space-y-4">
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, j) => <Star key={j} className={`h-5 w-5 ${j < testimonial.rating ? 'fill-current' : ''}`} />)}
                                    </div>
                                    <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                                    <div className="flex items-center gap-4 pt-2">
                                        <Image src={testimonial.userAvatar} alt={testimonial.userName} width={50} height={50} className="rounded-full" data-ai-hint="person portrait"/>
                                        <div>
                                            <h4 className="font-semibold">{testimonial.userName}</h4>
                                            <p className="text-sm text-muted-foreground capitalize">{testimonial.userRole} Member</p>
                                        </div>
                                    </div>
                                </CardContent>
                             </Card>
                        ))}
                     </div>
                 )}
            </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28">
            <div className="container mx-auto px-4">
                <div className="bg-primary text-primary-foreground rounded-2xl p-12 text-center shadow-xl">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Siap Meningkatkan Skill & Karir Anda?</h2>
                    <p className="max-w-2xl mx-auto mb-8 opacity-80">Daftar sekarang dan dapatkan akses ke beragam kursus online berkualitas untuk memulai perjalanan Anda. Dapatkan sertifikasi online untuk memvalidasi keahlian baru Anda.</p>
                    <Button size="lg" variant="secondary" asChild>
                        <Link href="/login">Daftar Gratis Sekarang</Link>
                    </Button>
                </div>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted/30 border-t">
          <div className="container mx-auto py-8 px-4 text-center text-muted-foreground space-y-4">
             <div className="flex justify-center gap-4 md:gap-6">
                <Link href="/privacy-policy" className="text-sm hover:text-primary transition-colors">Kebijakan Privasi</Link>
                <Link href="/terms-conditions" className="text-sm hover:text-primary transition-colors">Syarat & Ketentuan</Link>
                <Link href="/contact" className="text-sm hover:text-primary transition-colors">Kontak</Link>
             </div>
             <p>&copy; {new Date().getFullYear()} {platformName}. {settings.footerText}</p>
          </div>
      </footer>
    </div>
  );
}

export default LandingPage;
