
'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { BookOpenCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

interface LandingHeaderProps {
  logoUrl: string;
  platformName: string;
}

export function LandingHeader({ logoUrl, platformName }: LandingHeaderProps) {
  const { user, loading } = useAuth();

  return (
    <header className="py-4 px-4 md:px-6 bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          {logoUrl ? (
            <Image src={logoUrl} alt={`${platformName} logo`} width={120} height={30} className="h-7 w-auto"/>
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
          <Link href="#faq" className="text-sm font-medium hover:text-primary transition-colors">FAQ</Link>
        </nav>
        {loading ? (
            <Button disabled className="w-[125px]">
                <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
        ) : user ? (
            <Button asChild>
                <Link href="/dashboard">Buka Dasbor</Link>
            </Button>
        ) : (
            <Button asChild>
                <Link href="/login">Masuk / Daftar</Link>
            </Button>
        )}
      </div>
    </header>
  );
}
