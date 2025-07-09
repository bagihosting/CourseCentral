import { NextResponse, type NextRequest } from 'next/server';
import { getTenantBySubdomain } from '@/lib/tenants';

// Force the middleware to run on the Node.js runtime for database access.
export const runtime = 'nodejs';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const headers = new Headers(request.headers);

  // Skip static files, images, and internal API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/static') ||
    /\.(.*)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const host = request.headers.get('host');
  if (!host) {
    headers.set('x-tenant-id', 'platform_main');
    return NextResponse.next({ request: { headers } });
  }

  // Logic to determine if the host is a subdomain.
  // This is more robust than using new URL() which can fail.
  // Assumes production domain has at least 2 parts (e.g., example.com)
  // and development is on localhost.
  const hostParts = host.split('.');
  const isLocalhost = host.includes('localhost');
  const isIpAddress = /^\d{1,3}(\.\d{1,3}){3}(:\d+)?$/.test(host);

  let subdomain: string | null = null;
  if (!isLocalhost && !isIpAddress && hostParts.length > 2) {
      // It's likely a subdomain like `tenant.example.com`
      subdomain = hostParts[0];
  }
  
  if (subdomain) {
    // If it's a subdomain, try to find the tenant.
    const tenant = await getTenantBySubdomain(subdomain);
    if (tenant) {
      // Tenant found, set the header and continue.
      headers.set('x-tenant-id', tenant.id);
      return NextResponse.next({ request: { headers } });
    }
    // If tenant not found, fall through to main platform logic.
  }
  
  // Default case: It's the main domain, localhost, an IP, or an unknown subdomain.
  // Serve the main platform content.
  headers.set('x-tenant-id', 'platform_main');
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
