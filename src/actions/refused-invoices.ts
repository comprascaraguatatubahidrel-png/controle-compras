'use server'

import { db } from "@/db"
import { refusedInvoices } from "@/db/schema"
import { revalidatePath } from "next/cache"
import { eq, desc, and, like } from "drizzle-orm"
import { auth } from "@/auth"

export async function getRefusedInvoices(search?: string) {
    const session = await auth();
    const storeId = session?.user?.storeId || 1;

    const results = await db.query.refusedInvoices.findMany({
        where: eq(refusedInvoices.storeId, storeId as number),
        with: {
            supplier: true,
        },
        orderBy: [desc(refusedInvoices.returnDate)]
    })

    if (search) {
        const searchLower = search.toLowerCase()
        return results.filter(item =>
            item.invoiceNumber.toLowerCase().includes(searchLower) ||
            item.supplier.name.toLowerCase().includes(searchLower) ||
            item.reason.toLowerCase().includes(searchLower)
        )
    }

    return results
}

export async function createRefusedInvoice(data: {
    invoiceNumber: string,
    value: string,
    supplierId: string,
    returnDate: Date,
    reason: string,
    boletoNumber?: string,
    imageUrl?: string
}) {
    const session = await auth();
    const storeId = session?.user?.storeId || 1;

    await db.insert(refusedInvoices).values({
        invoiceNumber: data.invoiceNumber,
        value: data.value,
        supplierId: parseInt(data.supplierId),
        returnDate: data.returnDate,
        reason: data.reason,
        boletoNumber: data.boletoNumber,
        imageUrl: data.imageUrl,
        storeId: storeId as number
    })

    revalidatePath("/refused-invoices")
}
