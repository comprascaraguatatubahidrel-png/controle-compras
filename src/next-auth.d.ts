import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            /** The user's store ID. */
            storeId: number
        } & DefaultSession["user"]
    }

    interface User {
        storeId: number
        role: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        storeId: number
    }
}
