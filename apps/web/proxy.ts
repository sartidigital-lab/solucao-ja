import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

export async function proxy(request: NextRequest) {
  const { user, response } = await updateSession(request);

  const url = request.nextUrl.clone();
  const path = url.pathname;

  // app_metadata is written only by trusted server-side administration.
  const role = user?.app_metadata?.role;

  const isAuthPage = path.startsWith('/login') || path.startsWith('/cadastro');

  if (user) {
    if (isAuthPage) {
      if (role === 'admin') {
        url.pathname = '/admin';
      } else if (role === 'professional') {
        url.pathname = '/profissional';
      } else {
        url.pathname = '/dashboard';
      }
      return NextResponse.redirect(url);
    }

    if (path.startsWith('/admin') && role !== 'admin') {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    if (path.startsWith('/profissional') && role !== 'professional' && role !== 'admin') {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    if (path.startsWith('/dashboard') && role !== 'client' && role !== 'admin') {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  } else {
    const isProtected = path.startsWith('/admin') || path.startsWith('/profissional') || path.startsWith('/dashboard');
    if (isProtected) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
