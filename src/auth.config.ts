import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    trustHost: true,
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            return true;
        },
        async session({ session, token }) {
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
                // @ts-ignore
                token.storeId = user.storeId;
                // @ts-ignore
                token.role = user.role;
            }
            return token;
        }
    },
    providers: [],
} satisfies NextAuthConfig;
