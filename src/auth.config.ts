import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/');
            const isOnLogin = nextUrl.pathname.startsWith('/login');

            if (isOnLogin) {
                if (isLoggedIn) return Response.redirect(new URL('/', nextUrl));
                return true;
            }

            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            }
            return true;
        },
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }
            if (token.storeId && session.user) {
                // @ts-ignore
                session.user.storeId = token.storeId;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                // @ts-ignore
                token.storeId = user.storeId;
            }
            return token;
        }
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
