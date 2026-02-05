'use server'

import { db } from "@/db"
import { partialReceipts, orders, orderHistory } from "@/db/schema"
import { revalidatePath } from "next/cache"
import { eq, desc } from "drizzle-orm"

export async function getPartialReceipts(orderId: number) {
    return await db.query.partialReceipts.findMany({
        where: eq(partialReceipts.orderId, orderId),
        orderBy: [desc(partialReceipts.receivedDate)]
    })
}

export async function createPartialReceipt(data: {
    orderId: number,
    receivedValue: string,
    remainingValueAfter: string,
    receivedBy?: string,
    notes?: string
}) {
    const [receipt] = await db.insert(partialReceipts).values({
        orderId: data.orderId,
        receivedValue: data.receivedValue,
        remainingValueAfter: data.remainingValueAfter,
        receivedBy: data.receivedBy,
        notes: data.notes,
    }).returning()

    // Atualizar o remaining value do pedido
    await db.update(orders)
        .set({
            remainingValue: data.remainingValueAfter,
            lastUpdate: new Date()
        })
        .where(eq(orders.id, data.orderId))

    // Adicionar ao histórico
    const currentOrder = await db.query.orders.findFirst({
        where: eq(orders.id, data.orderId),
    })

    if (currentOrder) {
        await db.insert(orderHistory).values({
            orderId: data.orderId,
            previousStatus: currentOrder.status,
            newStatus: currentOrder.status,
            notes: `Recebimento parcial registrado: R$ ${data.receivedValue}. Saldo restante: R$ ${data.remainingValueAfter}`,
        })
    }

    revalidatePath(`/orders/${data.orderId}`)
    revalidatePath("/orders")
    revalidatePath("/pending-balance")
    revalidatePath("/")

    return receipt
}

export async function getPendingBalanceOrders(search?: string, supplierId?: string) {
    let whereFilters: any[] = [eq(orders.status, 'RECEIVED_PARTIAL')]

    if (supplierId && supplierId !== 'ALL') {
        whereFilters.push(eq(orders.supplierId, parseInt(supplierId)))
    }

    const results = await db.query.orders.findMany({
        where: whereFilters.length === 1 ? whereFilters[0] : undefined,
        with: {
            supplier: true,
        },
        orderBy: [desc(orders.expectedArrivalDate)]
    })

    // Filtro manual para múltiplas condições
    let filteredResults = results.filter(order => order.status === 'RECEIVED_PARTIAL')

    if (supplierId && supplierId !== 'ALL') {
        filteredResults = filteredResults.filter(order => order.supplierId === parseInt(supplierId))
    }

    if (search) {
        const searchLower = search.toLowerCase()
        filteredResults = filteredResults.filter(order =>
            order.code.toLowerCase().includes(searchLower) ||
            order.supplier.name.toLowerCase().includes(searchLower)
        )
    }

    return filteredResults
}

export async function updateRemainingValue(orderId: number, newValue: string) {
    const currentOrder = await db.query.orders.findFirst({
        where: eq(orders.id, orderId),
    })

    if (!currentOrder) throw new Error("Order not found")

    const previousValue = currentOrder.remainingValue || "0"

    await db.update(orders)
        .set({
            remainingValue: newValue,
            lastUpdate: new Date()
        })
        .where(eq(orders.id, orderId))

    await db.insert(orderHistory).values({
        orderId: orderId,
        previousStatus: currentOrder.status,
        newStatus: currentOrder.status,
        notes: `Valor do saldo alterado de R$ ${previousValue} para R$ ${newValue}`,
    })

    revalidatePath(`/orders/${orderId}`)
    revalidatePath("/orders")
    revalidatePath("/pending-balance")
}

export async function closeBalance(orderId: number, finalNotes?: string, closedBy?: string) {
    const currentOrder = await db.query.orders.findFirst({
        where: eq(orders.id, orderId),
    })

    if (!currentOrder) throw new Error("Order not found")

    // Registrar o recebimento final
    if (currentOrder.remainingValue) {
        await db.insert(partialReceipts).values({
            orderId: orderId,
            receivedValue: currentOrder.remainingValue,
            remainingValueAfter: "0",
            receivedBy: closedBy,
            notes: finalNotes || "Saldo finalizado",
        })
    }

    // Atualizar status para recebido completo
    await db.update(orders)
        .set({
            status: 'RECEIVED_COMPLETE',
            remainingValue: null,
            lastUpdate: new Date()
        })
        .where(eq(orders.id, orderId))

    await db.insert(orderHistory).values({
        orderId: orderId,
        previousStatus: currentOrder.status,
        newStatus: 'RECEIVED_COMPLETE',
        notes: finalNotes ? `Saldo finalizado. ${finalNotes}` : 'Saldo finalizado - Pedido recebido completo',
    })

    revalidatePath(`/orders/${orderId}`)
    revalidatePath("/orders")
    revalidatePath("/pending-balance")
    revalidatePath("/")
}

export async function updatePartialReason(orderId: number, reason: string) {
    await db.update(orders)
        .set({
            partialReason: reason,
            lastUpdate: new Date()
        })
        .where(eq(orders.id, orderId))

    revalidatePath(`/orders/${orderId}`)
}
