
'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/auth-context';
import { useEffect, useState } from 'react';
import { getActiveTenantId } from '@/actions/utils';
import { getTenantById } from '@/lib/tenants';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

function hexToHsl(hex: string): string | null {
    if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)) return null;

    let r, g, b;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    }

    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    
    return `${h} ${s}% ${l}%`;
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [themeColor, setThemeColor] = useState('--primary: 262 52% 47%;'); // Default color

  useEffect(() => {
    async function applyTenantTheme() {
        const tenantId = await getActiveTenantId();
        if (tenantId && tenantId !== 'platform_main') {
            const tenant = await getTenantById(tenantId);
            if (tenant?.brandPrimaryColor) {
                const hslColor = hexToHsl(tenant.brandPrimaryColor);
                if (hslColor) {
                    setThemeColor(`--primary: ${hslColor};`);
                }
            }
        }
    }
    applyTenantTheme();
  }, []);

  useEffect(() => {
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
        <style dangerouslySetInnerHTML={{ __html: `:root { ${themeColor} }` }} />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6a2cf5" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className={`${inter.variable} font-body antialiased`} suppressHydrationWarning>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
