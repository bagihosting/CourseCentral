'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/auth-context';
import { useEffect } from 'react';
import { getSeoSettings, getLandingPageSettings, getAllTestimonials } from '@/lib/data';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    // SEO and Schema Markup Logic
    const seoSettings = getSeoSettings();
    const landingSettings = getLandingPageSettings();
    const testimonials = getAllTestimonials();

    if (seoSettings) {
      document.title = `${seoSettings.platformName} ${seoSettings.titleSuffix || ''}`.trim();
      
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', seoSettings.metaDescription || '');

      let metaKeywords = document.querySelector('meta[name="keywords"]');
       if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', seoSettings.metaKeywords || '');
    }
    
    const organizationSchema: any = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: seoSettings.platformName,
      url: window.location.origin, 
      logo: landingSettings.logoUrl || `${window.location.origin}/logo.png`,
    };

    if (testimonials.length > 0) {
        const totalRating = testimonials.reduce((acc, t) => acc + t.rating, 0);
        const averageRating = totalRating / testimonials.length;
        organizationSchema.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: averageRating.toFixed(1),
            reviewCount: testimonials.length,
        };
    }
    
    let schemaScript = document.getElementById('organization-schema');
    if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = 'organization-schema';
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = JSON.stringify(organizationSchema);
    
    // PWA Service Worker Registration
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
          console.log('PWA Service Worker registered: ', registration);
        }).catch(registrationError => {
          console.log('PWA Service Worker registration failed: ', registrationError);
        });
      });
    }

  }, []);

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6a2cf5" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className={`${inter.variable} font-body antialiased`}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
