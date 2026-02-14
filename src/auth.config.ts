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

            console.log('[CALLBACK] authorized check:', { isLoggedIn, pathname: nextUrl.pathname });

            if (isOnLogin) {
                if (isLoggedIn) {
                    console.log('[CALLBACK] Redirecting logged in user to home');
                    return Response.redirect(new URL('/', nextUrl));
                }
                return true;
            }

            if (isOnDashboard) {
                if (isLoggedIn) return true;
                console.log('[CALLBACK] Redirecting unauthenticated user to login');
                return false; // Redirect unauthenticated users to login page
            }
            return true;
        },
        async session({ session, token }) {
            console.log('[CALLBACK] session called', { tokenSub: token.sub, tokenStoreId: token.storeId });
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }
            if (token.storeId && session.user) {
                // @ts-ignore
                session.user.storeId = token.storeId;
                // @ts-ignore
                session.user.role = token.role;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                console.log('[CALLBACK] jwt called with user', { id: user.id });
                // @ts-ignore
                token.storeId = user.storeId;
                // @ts-ignore
                token.role = user.role;
            }
            return token;
        }
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
