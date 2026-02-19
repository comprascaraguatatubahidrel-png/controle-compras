'use server'

import { db } from "@/db"
import { representatives, suppliers } from "@/db/schema"
import { revalidatePath } from "next/cache"
import { eq, desc } from "drizzle-orm"

import { auth } from "@/auth"

export async function getRepresentatives() {
    const results = await db.query.representatives.findMany({
        with: {
            supplier: true,
        },
        orderBy: [desc(representatives.createdAt)]
    })

    return results
}

export async function getRepresentativeById(id: number | string) {
    const repId = Number(id)
    if (isNaN(repId)) return null

    const rep = await db.query.representatives.findFirst({
        where: eq(representatives.id, repId),
        with: {
            supplier: true,
        },
    })
    return rep
}

export async function createRepresentative(data: {
    name: string,
    phone?: string,
    email?: string,
    supplierId: string
}) {
    await db.insert(representatives).values({
        name: data.name,
        phone: data.phone || null,
        email: data.email || null,
        supplierId: parseInt(data.supplierId),
    })

    revalidatePath("/representatives")
    revalidatePath("/suppliers")
}

export async function updateRepresentative(id: number, data: {
    name: string,
    phone?: string,
    email?: string,
    supplierId: string
}) {
    await db.update(representatives)
        .set({
            name: data.name,
            phone: data.phone || null,
            email: data.email || null,
            supplierId: parseInt(data.supplierId),
            updatedAt: new Date()
        })
        .where(eq(representatives.id, id))

    revalidatePath("/representatives")
    revalidatePath("/suppliers")
}

export async function deleteRepresentative(id: number) {
    await db.delete(representatives)
        .where(eq(representatives.id, id))

    revalidatePath("/representatives")
    revalidatePath("/suppliers")
}
