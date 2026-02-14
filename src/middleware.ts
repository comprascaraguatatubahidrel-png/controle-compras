import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

// TEMPORARILY DISABLED middleware to allow local work
export default function middleware() { }

export const config = {
    // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
