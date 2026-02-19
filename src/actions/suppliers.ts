'use server'

import { db } from "@/db"
import { suppliers } from "@/db/schema"
import { revalidatePath } from "next/cache"
import { desc, eq } from "drizzle-orm"

export async function getSuppliers() {
    const data = await db.query.suppliers.findMany({
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

    const data = await db.query.suppliers.findFirst({
        where: eq(suppliers.id, supplierId),
        with: {
            representatives: true,
            orders: true,
        }
    })
    return data
}

export async function createSupplier(data: { name: string, brand?: string, observations?: string }) {
    await db.insert(suppliers).values({
        name: data.name,
        brand: data.brand || null,
        observations: data.observations || null,
    })
    revalidatePath("/suppliers")
    revalidatePath("/orders/new")
}

export async function updateSupplier(id: number, data: { name: string, brand?: string, observations?: string }) {
    await db.update(suppliers)
        .set({
            name: data.name,
            brand: data.brand || null,
            observations: data.observations || null,
            updatedAt: new Date()
        })
        .where(eq(suppliers.id, id))

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

    await db.delete(suppliers).where(eq(suppliers.id, id))
    revalidatePath("/suppliers")
    revalidatePath("/orders/new")
}
