import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { VISITOR_COOKIE } from './lib/experiment';

/**
 * Give every visitor a stable random id on their first request.
 *
 * The id is written to both the response (so the browser keeps it) and the
 * forwarded request (so the very first render can already use it). Without the
 * second half, a first-time visitor would be assigned on the next page view and
 * could see the call-to-action change under them.
 */
export function proxy(request: NextRequest) {
  if (request.cookies.has(VISITOR_COOKIE)) return NextResponse.next();

  const id = crypto.randomUUID();
  request.cookies.set(VISITOR_COOKIE, id);
  const response = NextResponse.next({ request: { headers: request.headers } });
  response.cookies.set(VISITOR_COOKIE, id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 180,
    path: '/',
  });
  return response;
}

export const config = {
  // Pages only: assets, images and API routes do not need a visitor id.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
