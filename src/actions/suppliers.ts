'use server'

import { db } from "@/db"
import { suppliers, representatives, refusedInvoices } from "@/db/schema"
import { revalidatePath } from "next/cache"
import { desc, asc, eq, ilike } from "drizzle-orm"

export async function getSuppliers(search?: string) {
    const whereClause = search ? ilike(suppliers.name, `%${search}%`) : undefined

    const data = await db.query.suppliers.findMany({
        where: whereClause,
        with: {
            orders: true,
            representatives: true,
        },
        orderBy: [asc(suppliers.name)],
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

export async function createSupplier(data: { name: string, brand?: string, observations?: string, whatsapp?: string }) {
    await db.insert(suppliers).values({
        name: data.name,
        brand: data.brand || null,
        observations: data.observations || null,
        whatsapp: data.whatsapp || null,
    })
    revalidatePath("/suppliers")
    revalidatePath("/orders/new")
}

export async function updateSupplier(id: number, data: { name: string, brand?: string, observations?: string, whatsapp?: string }) {
    await db.update(suppliers)
        .set({
            name: data.name,
            brand: data.brand || null,
            observations: data.observations || null,
            whatsapp: data.whatsapp || null,
            updatedAt: new Date()
        })
        .where(eq(suppliers.id, id))

    revalidatePath("/suppliers")
    revalidatePath(`/suppliers/${id}`)
    revalidatePath("/orders/new")
}

export async function deleteSupplier(id: number): Promise<{ success: boolean; error?: string }> {
    try {
        // Check if has orders
        const supplier = await getSupplierById(id)
        if (supplier && supplier.orders.length > 0) {
            return { success: false, error: "Não é possível excluir fornecedor com pedidos vinculados." }
        }

        // Explicitly delete representatives to avoid foreign key violation
        await db.delete(representatives).where(eq(representatives.supplierId, id))

        // Delete refused invoices linked to this supplier
        await db.delete(refusedInvoices).where(eq(refusedInvoices.supplierId, id))

        // Now delete the supplier
        await db.delete(suppliers).where(eq(suppliers.id, id))

        revalidatePath("/suppliers")
        revalidatePath("/orders/new")

        return { success: true }
    } catch (error) {
        console.error("Erro ao excluir fornecedor:", error)
        return { success: false, error: "Erro ao excluir fornecedor. Tente novamente." }
    }
}
