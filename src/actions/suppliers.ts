'use server'

import { db } from "@/db"
import { suppliers } from "@/db/schema"
import { revalidatePath } from "next/cache"
import { desc } from "drizzle-orm"

export async function getSuppliers() {
    const data = await db.query.suppliers.findMany({
        orderBy: [desc(suppliers.createdAt)],
    })
    return data
}

export async function createSupplier(data: { name: string, brand?: string, observations?: string }) {
    await db.insert(suppliers).values({
        name: data.name,
        brand: data.brand,
        observations: data.observations,
    })
    revalidatePath("/suppliers")
    revalidatePath("/orders/new")
}
