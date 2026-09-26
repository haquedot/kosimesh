import { NextRequest, NextResponse } from 'next/server';
import { MESH_API_KEY } from '@/lib/auth/constants';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect all /api endpoints
  if (pathname.startsWith('/api')) {
    const apiKey = req.headers.get('x-mesh-api-key');
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;
    const secFetchSite = req.headers.get('sec-fetch-site');

    // Token check
    const isTokenValid = apiKey === MESH_API_KEY || bearerToken === MESH_API_KEY;

    // Allow internal browser requests from the same origin or valid token
    const isSameOrigin = 
      secFetchSite === 'same-origin' || 
      (req.headers.get('referer') && req.headers.get('referer')?.includes(req.nextUrl.host));

    if (!isTokenValid && !isSameOrigin) {
      return NextResponse.json(
        {
          error: 'Unauthorized. Missing or invalid API token.',
          hint: 'Provide header `x-mesh-api-key: km_live_mesh_secret_2026` or `Authorization: Bearer km_live_mesh_secret_2026`',
        },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
