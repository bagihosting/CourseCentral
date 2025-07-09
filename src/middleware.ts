
import { NextResponse, type NextRequest } from 'next/server';

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

  // Handle IP addresses and localhost explicitly for robustness
  const isIpAddress = /^\d{1,3}(\.\d{1,3}){3}(:\d+)?$/.test(host);
  const isLocalhost = host.includes('localhost');

  if (isIpAddress || isLocalhost) {
    headers.set('x-tenant-id', 'platform_main');
    return NextResponse.next({ request: { headers } });
  }
  
  // Handle subdomains for production domains (e.g., app.example.com)
  const hostParts = host.split('.');
  if (hostParts.length > 2) {
    const subdomain = hostParts[0];
    
    // Dynamically import the function that uses the database
    const { getTenantBySubdomain } = await import('@/lib/tenants');
    const tenant = await getTenantBySubdomain(subdomain);
    
    if (tenant) {
      headers.set('x-tenant-id', tenant.id);
      return NextResponse.next({ request: { headers } });
    }
  }
  
  // Default case: It's the main domain or an unknown subdomain.
  headers.set('x-tenant-id', 'platform_main');
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
