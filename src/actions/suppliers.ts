'use server'

import { db } from "@/db"
import { suppliers } from "@/db/schema"
import { revalidatePath } from "next/cache"
import { desc, eq, and } from "drizzle-orm"
import { auth } from "@/auth"

export async function getSuppliers() {
    const session = await auth();
    if (!session?.user?.storeId) return [];

    const data = await db.query.suppliers.findMany({
        where: eq(suppliers.storeId, session.user.storeId as number),
        with: {
            orders: true,
            representatives: true,
        },
        orderBy: [desc(suppliers.createdAt)],
    })
    return data
}

export async function getSupplierById(id: number | string) {
    const supplierId = Number(id)
    if (isNaN(supplierId)) return null

    const session = await auth();
    if (!session?.user?.storeId) return null;

    const data = await db.query.suppliers.findFirst({
        where: and(
            eq(suppliers.id, supplierId),
            eq(suppliers.storeId, session.user.storeId as number)
        ),
        with: {
            representatives: true,
            orders: true,
        }
    })
    return data
}

export async function createSupplier(data: { name: string, brand?: string, observations?: string }) {
    const session = await auth();
    if (!session?.user?.storeId) throw new Error("Unauthorized");

    await db.insert(suppliers).values({
        name: data.name,
        brand: data.brand || null,
        observations: data.observations || null,
        storeId: session.user.storeId as number
    })
    revalidatePath("/suppliers")
    revalidatePath("/orders/new")
}

export async function updateSupplier(id: number, data: { name: string, brand?: string, observations?: string }) {
    const session = await auth();
    if (!session?.user?.storeId) throw new Error("Unauthorized");

    await db.update(suppliers)
        .set({
            name: data.name,
            brand: data.brand || null,
            observations: data.observations || null,
            updatedAt: new Date()
        })
        .where(and(
            eq(suppliers.id, id),
            eq(suppliers.storeId, session.user.storeId as number)
        ))

    revalidatePath("/suppliers")
    revalidatePath(`/suppliers/${id}`)
    revalidatePath("/orders/new")
}

export async function deleteSupplier(id: number) {
    // Check if has orders
    const supplier = await getSupplierById(id)
    if (supplier && supplier.orders.length > 0) {
        throw new Error("Não é possível excluir fornecedor com pedidos vinculados.")
    }

    if (supplier && supplier.orders.length > 0) {
        throw new Error("Não é possível excluir fornecedor com pedidos vinculados.")
    }

    const session = await auth();
    if (!session?.user?.storeId) throw new Error("Unauthorized");

    await db.delete(suppliers).where(and(
        eq(suppliers.id, id),
        eq(suppliers.storeId, session.user.storeId as number)
    ))
    revalidatePath("/suppliers")
    revalidatePath("/orders/new")
}
