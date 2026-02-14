'use server'

import { db } from "@/db"
import { users } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { auth } from "@/auth"

export async function getStoreUsers() {
    // const session = await auth();
    // if (!session?.user?.storeId) return [];

    const data = await db.query.users.findMany({
        // where: eq(users.storeId, session.user.storeId as number),
        orderBy: [desc(users.name)],
        columns: {
            id: true,
            name: true,
            email: true,
            role: true
        }
    })
    return data
}
