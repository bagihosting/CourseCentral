
import { NextResponse, type NextRequest } from 'next/server';
import { getTenantBySubdomain } from '@/lib/tenants';

// This is an internal API route used by the middleware to resolve subdomains to tenant IDs.
// It allows the middleware to remain lightweight and avoid direct database connections,
// which can cause bundling issues.

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const subdomain = searchParams.get('subdomain');
  
  if (!subdomain) {
    return NextResponse.json({ error: 'Subdomain parameter is required' }, { status: 400 });
  }

  try {
    const tenant = await getTenantBySubdomain(subdomain);
    if (tenant) {
      return NextResponse.json({ tenantId: tenant.id });
    } else {
      // It's not an error if a subdomain doesn't exist, just return null.
      return NextResponse.json({ tenantId: null });
    }
  } catch (error) {
    console.error('API Error fetching tenant:', error);
    // In case of a database or server error, return a 500 status.
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
