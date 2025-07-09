
import { NextResponse, type NextRequest } from 'next/server';
import { getTenantBySubdomain } from '@/lib/tenants';

// Force the middleware to run on the Node.js runtime.
// This is necessary because it needs to access the database (a Node.js-specific API)
// to look up tenant information, which is not available in the default Edge runtime.
export const runtime = 'nodejs';

const PUBLIC_FILE = /\.(.*)$/;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lewati file statis, gambar, dan rute API internal Next.js
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/static') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const host = request.headers.get('host');
  if (!host) {
    // Jika tidak ada host, lanjutkan saja
    return NextResponse.next();
  }

  // Tentukan domain utama dari variabel lingkungan
  const mainDomain = process.env.NEXT_PUBLIC_BASE_URL 
    ? new URL(process.env.NEXT_PUBLIC_BASE_URL).hostname 
    : 'localhost';

  // Ekstrak subdomain
  const subdomain = host.replace(`.${mainDomain}`, '').replace(`:3000`, '');
  
  const headers = new Headers(request.headers);

  if (subdomain !== host.replace(`:3000`, '')) {
    // Ini adalah subdomain, coba cari tenant
    const tenant = await getTenantBySubdomain(subdomain);
    if (tenant) {
      // Set header tenant-id untuk digunakan di seluruh aplikasi
      headers.set('x-tenant-id', tenant.id);
      return NextResponse.next({ request: { headers } });
    }
    // Jika subdomain tidak ditemukan, bisa diarahkan ke halaman utama atau halaman "tidak ditemukan"
    // Untuk saat ini, kita biarkan saja, mungkin akan menampilkan halaman 404
  }
  
  // Jika ini adalah domain utama, set tenant ke 'platform_main'
  headers.set('x-tenant-id', 'platform_main');
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: [
    /*
     * Cocokkan semua path permintaan kecuali yang dimulai dengan:
     * - api (rute API)
     * - _next/static (file statis)
     * - _next/image (optimisasi gambar)
     * - favicon.ico (file favicon)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
