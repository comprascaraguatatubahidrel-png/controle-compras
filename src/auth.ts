import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function getUser(email: string) {
    try {
        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
            with: {
                store: true
            }
        });
        return user;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                console.log('[AUTH] Authorizing credentials:', { email: credentials.email });
                const parsedCredentials = z
                    .object({ email: z.string().min(1), password: z.string().min(1) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    console.log('[AUTH] Zod parsed success. Fetching user:', email);
                    const user = await getUser(email);
                    if (!user) {
                        console.log('[AUTH] User not found during authorize:', email);
                        return null;
                    }
                    console.log('[AUTH] User found:', { id: user.id, email: user.email, storedPasswordHash: user.password.substring(0, 10) + '...' });

                    const passwordsMatch = await bcrypt.compare(password, user.password);
                    console.log('[AUTH] Password match result:', passwordsMatch);

                    if (passwordsMatch) {
                        console.log('[AUTH] Login successful for:', email);
                        return {
                            id: user.id.toString(),
                            name: user.name,
                            email: user.email,
                            // @ts-ignore - Adding custom property
                            storeId: user.storeId,
                            role: user.role
                        };
                    }
                } else {
                    console.log('[AUTH] Zod parsing failed:', parsedCredentials.error);
                }

                console.log('[AUTH] Invalid credentials');
                return null;
            },
        }),
    ],
});
