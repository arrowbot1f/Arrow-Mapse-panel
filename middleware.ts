import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Check for auth cookie
    const auth = request.cookies.get('admin_session');

    // Protect root path
    if (request.nextUrl.pathname === '/') {
        if (!auth || auth.value !== 'valid_secure_session') {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Redirect logged in users away from login
    if (request.nextUrl.pathname === '/login') {
        if (auth && auth.value === 'valid_secure_session') {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/login'],
};
