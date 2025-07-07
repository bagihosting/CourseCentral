
import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CourseCard } from '@/components/course-card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { getLandingPageSettings, getAllTestimonials, getSeoSettings } from '@/actions/settings';
import { getAllCourses } from '@/actions/courses';
import type { Course, Testimonial } from '@/types';
import { ArrowRight, ShieldCheck, Clock, Users, Star } from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { Metadata } from 'next';
import { LandingHeader } from '@/components/landing-header';

const featureIcons: { [key: string]: React.ElementType } = {
  ShieldCheck,
  Clock,
  Users,
};

export async function generateMetadata(): Promise<Metadata> {
  try {
    const [seoSettings, landingSettings, testimonials] = await Promise.all([
        getSeoSettings(),
        getLandingPageSettings(),
        getAllTestimonials(),
    ]);

    let aggregateRating;
    if (testimonials.length > 0) {
        const totalRating = testimonials.reduce((acc, t) => acc + t.rating, 0);
        const averageRating = totalRating / testimonials.length;
        aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: averageRating.toFixed(1),
            reviewCount: testimonials.length,
        };
    }

    const title = `${seoSettings.platformName} ${seoSettings.titleSuffix || ''}`.trim();
    const description = seoSettings.metaDescription;
    
    return {
      title: title,
      description: description,
      keywords: seoSettings.metaKeywords,
      openGraph: {
        title: title,
        description: description,
        images: [landingSettings.heroImageUrl],
      },
      other: {
        'script[type="application/ld+json"]': JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: seoSettings.platformName,
            url: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000', 
            logo: landingSettings.logoUrl,
            ...(aggregateRating && { aggregateRating }),
        }),
      }
    };
  } catch (error) {
    console.error("Failed to generate metadata:", error);
    return {
      title: 'CourseCentral',
      description: 'Platform kursus online untuk masa depan Anda.',
    };
  }
}

export default async function LandingPage() {
  const settings = await getLandingPageSettings();
  const allCourses = await getAllCourses();
  const allTestimonials = await getAllTestimonials();
  const seoSettings = await getSeoSettings();

  const courses = allCourses.slice(0, 4);
  const testimonials = allTestimonials.filter(t => settings.featuredTestimonialIds.includes(t.id));

  const features = settings.features.map(f => ({
      ...f,
      icon: React.createElement(featureIcons[f.icon] || ShieldCheck, { className: "h-10 w-10 text-primary" })
  }));

  return (
    <div className="bg-background text-foreground">
      <LandingHeader logoUrl={settings.logoUrl} platformName={seoSettings.platformName} />
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
                     <h2 className="text-3xl md:text-4xl font-bold">Mengapa Belajar Skill di {seoSettings.platformName}?</h2>
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

        {/* FAQ Section */}
        <section id="faq" className="py-20 md:py-28 bg-muted/30">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center space-y-4 mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold">Pertanyaan yang Sering Diajukan</h2>
                    <p className="text-muted-foreground">Tidak menemukan jawaban yang Anda cari? <Link href="/contact" className="text-primary underline">Hubungi kami</Link>.</p>
                </div>
                {settings.faqs && settings.faqs.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full space-y-2">
                        {settings.faqs.map((faq) => (
                            <AccordionItem value={faq.id} key={faq.id} className="border rounded-lg bg-background shadow-sm px-4">
                                <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline">{faq.question}</AccordionTrigger>
                                <AccordionContent className="text-base text-muted-foreground pb-4">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                     <p className="text-center text-muted-foreground">Tidak ada FAQ untuk ditampilkan saat ini.</p>
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
             <p>&copy; {new Date().getFullYear()} {seoSettings.platformName}. {settings.footerText}</p>
          </div>
      </footer>
    </div>
  );
}
