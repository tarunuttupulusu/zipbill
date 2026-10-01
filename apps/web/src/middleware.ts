import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_EXCLUDED_PREFIXES = [
  '/_next',
  '/api',
  '/favicon.ico',
  '/assets',
  '/static',
  '/login',
  '/register',
  '/auth',
  '/admin',
  '/pending-approval',
  '/verify-email',
];

const KNOWN_SECTIONS = new Set([
  'dashboard',
  'pos',
  'tables',
  'orders',
  'kitchen',
  'menu',
  'customers',
  'billing',
  'payments',
  'expenses',
  'inventory',
  'reports',
  'staff',
  'qr',
  'screens',
  'printers',
  'sync',
  'settings',
  'subscription',
  'leads',
  'offline',
  'onboarding',
]);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Skip system paths and assets
  if (
    PUBLIC_EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Root entry point opens the account creation page (Image 1)
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/register', req.url));
  }

  const segments = pathname.split('/').filter(Boolean);

  // 2. Pattern: /:restaurantSlug/:section (e.g., /taste-of-punjab/pos)
  if (segments.length >= 2) {
    const [potentialSlug, section, ...rest] = segments;

    if (KNOWN_SECTIONS.has(section)) {
      const restPath = rest.length > 0 ? `/${rest.join('/')}` : '';
      const rewriteUrl = new URL(`/${section}${restPath}`, req.url);
      rewriteUrl.search = req.nextUrl.search;
      rewriteUrl.searchParams.set('restaurantSlug', potentialSlug);

      const response = NextResponse.rewrite(rewriteUrl);
      response.headers.set('x-restaurant-slug', potentialSlug);
      return response;
    }
  }

  // 3. Pattern: /:restaurantSlug alone -> rewrite to /:restaurantSlug/dashboard
  if (segments.length === 1) {
    const [potentialSlug] = segments;
    if (!KNOWN_SECTIONS.has(potentialSlug)) {
      const rewriteUrl = new URL('/dashboard', req.url);
      rewriteUrl.search = req.nextUrl.search;
      rewriteUrl.searchParams.set('restaurantSlug', potentialSlug);

      const response = NextResponse.rewrite(rewriteUrl);
      response.headers.set('x-restaurant-slug', potentialSlug);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
