
import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const headers = new Headers(request.headers);
  const host = request.headers.get('host');

  // Skip all internal Next.js, API, and static file routes to avoid unnecessary processing
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') || 
    pathname.startsWith('/static') ||
    /\.(.*)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  if (!host) {
    headers.set('x-tenant-id', 'platform_main');
    return NextResponse.next({ request: { headers } });
  }

  // Explicitly handle IP addresses and localhost to avoid subdomain logic
  const isIpAddress = /^\d{1,3}(\.\d{1,3}){3}(:\d+)?$/.test(host);
  const isLocalhost = host.startsWith('localhost');

  if (isIpAddress || isLocalhost) {
    headers.set('x-tenant-id', 'platform_main');
    return NextResponse.next({ request: { headers } });
  }
  
  // For production domains, attempt to resolve the subdomain
  const hostParts = host.split('.');
  if (hostParts.length > 2) {
    const subdomain = hostParts[0];
    
    // Fetch tenant ID from a lightweight internal API route.
    // This decouples the middleware from direct database dependencies.
    try {
      const url = new URL(`/api/internal/get-tenant?subdomain=${subdomain}`, request.url);
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        if (data.tenantId) {
          headers.set('x-tenant-id', data.tenantId);
          return NextResponse.next({ request: { headers } });
        }
      }
    } catch (error) {
        console.error("Middleware fetch error:", error);
        // Fall through to default if API fails, ensuring the site doesn't crash
    }
  }
  
  // Default case: It's the main domain or a subdomain that was not found.
  headers.set('x-tenant-id', 'platform_main');
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: [
    // This matcher ensures the middleware runs on all paths except for the excluded ones.
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
