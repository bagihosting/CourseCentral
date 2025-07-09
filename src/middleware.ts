
import { NextResponse, type NextRequest } from 'next/server';

// This is the new, more robust middleware.
// Its only job is to parse the subdomain and pass it in a header.
// It avoids any complex logic or fetching, which is the root cause of the previous errors.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const bypassPaths = [
    '/api/',
    '/_next/static/',
    '/_next/image/',
    '/static/',
    '/favicon.ico',
    '/sw.js',
    '/manifest.json'
  ];

  if (bypassPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const headers = new Headers(request.headers);
  const host = request.headers.get('host') ?? '';
  
  const isIpAddress = /^\d{1,3}(\.\d{1,3}){3}(:\d+)?$/.test(host);
  const isLocalhost = host.startsWith('localhost');
  const hostParts = host.split('.');

  let subdomain = '';
  // Check for a valid subdomain structure (e.g., sub.domain.com)
  if (!isIpAddress && !isLocalhost && hostParts.length > 2) {
    subdomain = hostParts[0];
  }
  
  // Pass the raw subdomain string to server components/actions via headers.
  // The actual database lookup will happen there, inside a cached function.
  headers.set('x-subdomain', subdomain);

  return NextResponse.next({
    request: {
      headers: headers,
    },
  });
}

export const config = {
  matcher: [
    // This matcher is simplified to run on all paths except for the specific ones
    // handled by the bypass logic at the start of the function.
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
