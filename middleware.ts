import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const isProtected = req.nextUrl.pathname.startsWith('/dashboard') || req.nextUrl.pathname.startsWith('/onboarding');
  if (!isProtected) return NextResponse.next();
  return NextResponse.next();
}

export const config = { matcher: ['/dashboard/:path*', '/onboarding/:path*'] };
