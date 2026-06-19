import { NextRequest, NextResponse } from 'next/server';

const ENGLISH_PREFIX_PATTERN = /^\/en(?=\/|$)/i;
const ENGLISH_VALUE_PATTERN = /^en(?:[-_][a-z]{2})?$/i;
const LANGUAGE_QUERY_KEYS = ['lang', 'language', 'locale', 'lng'];
const FRENCH_LOCALE = 'fr';

function stripEnglishPrefix(pathname: string) {
  const normalizedPath = pathname.replace(ENGLISH_PREFIX_PATTERN, '');
  return normalizedPath.length ? normalizedPath : '/';
}

function hasEnglishLanguageQuery(request: NextRequest) {
  return LANGUAGE_QUERY_KEYS.some((key) => {
    const value = request.nextUrl.searchParams.get(key);
    return value ? ENGLISH_VALUE_PATTERN.test(value) : false;
  });
}

function clearEnglishLanguageQuery(url: URL) {
  LANGUAGE_QUERY_KEYS.forEach((key) => {
    const value = url.searchParams.get(key);
    if (value && ENGLISH_VALUE_PATTERN.test(value)) {
      url.searchParams.delete(key);
    }
  });
}

export function middleware(request: NextRequest) {
  const { nextUrl, cookies } = request;
  const redirectUrl = nextUrl.clone();
  const pathnameHasEnglishPrefix = ENGLISH_PREFIX_PATTERN.test(nextUrl.pathname);
  const queryRequestsEnglish = hasEnglishLanguageQuery(request);
  const cookieRequestsEnglish = ENGLISH_VALUE_PATTERN.test(
    cookies.get('NEXT_LOCALE')?.value ?? ''
  );

  if (pathnameHasEnglishPrefix || queryRequestsEnglish || cookieRequestsEnglish) {
    redirectUrl.pathname = stripEnglishPrefix(nextUrl.pathname);
    clearEnglishLanguageQuery(redirectUrl);

    const response = NextResponse.redirect(redirectUrl, 301);
    response.cookies.set('NEXT_LOCALE', FRENCH_LOCALE, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });

    return response;
  }

  const response = NextResponse.next();
  response.cookies.set('NEXT_LOCALE', FRENCH_LOCALE, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
