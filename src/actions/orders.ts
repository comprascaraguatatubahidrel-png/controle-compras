'use server'

import { db } from "@/db"
import { orders, orderHistory, partialReceipts, suppliers } from "@/db/schema"
import { revalidatePath } from "next/cache"
import { eq, desc, and, gte, lte, not, or } from "drizzle-orm"
import { startOfDay, endOfDay, subDays } from "date-fns"

export async function getOrders(search?: string, status?: string, filter?: string, supplierId?: string, date?: string) {
    const today = new Date()

    let whereClause: any[] = []

    if (status && status !== 'ALL') {
        whereClause.push(eq(orders.status, status as any))
    }

    if (supplierId && supplierId !== 'ALL') {
        whereClause.push(eq(orders.supplierId, parseInt(supplierId)))
    }

    if (filter === 'arriving_today' || date) {
        const targetDate = date ? new Date(date) : today
        whereClause.push(
            and(
                gte(orders.expectedArrivalDate, startOfDay(targetDate)),
                lte(orders.expectedArrivalDate, endOfDay(targetDate)),
                not(eq(orders.status, 'RECEIVED_COMPLETE')),
                not(eq(orders.status, 'CANCELLED')),
                not(eq(orders.status, 'FEEDING'))
            )
        )
    }

    // Default: exclude RECEIVED_COMPLETE, CANCELLED and FEEDING unless explicitly filtered
    // Don't exclude if user is specifically filtering by something
    if (!status && !filter && !search && !supplierId && !date) {
        whereClause.push(not(eq(orders.status, 'RECEIVED_COMPLETE')))
        whereClause.push(not(eq(orders.status, 'CANCELLED')))
        whereClause.push(not(eq(orders.status, 'FEEDING')))
    }

    // Fetch orders with supplier relationship
    const results = await db.query.orders.findMany({
        where: whereClause.length > 0 ? and(...whereClause) : undefined,
        with: {
            supplier: true,
        },
        orderBy: [desc(orders.sentDate)]
    })

    // If there's a search query, filter by code or supplier name
    if (search) {
        const searchLower = search.toLowerCase()
        return results.filter(order =>
            order.code.toLowerCase().includes(searchLower) ||
            order.supplier.name.toLowerCase().includes(searchLower)
        )
    }

    return results
}

export async function getPendencies(search?: string, supplierId?: string, date?: string) {
    const today = new Date()

    const fifteenDaysAgo = subDays(today, 15)

    // Core Pendency Logic
    // 1. Explicit PENDING_ISSUE
    // 2. SENT but older than 15 days
    // 3. WAITING_ARRIVAL but expected date was more than 15 days ago
    const pendencyConditions = or(
        eq(orders.status, 'PENDING_ISSUE'),
        and(
            eq(orders.status, 'SENT'),
            lte(orders.sentDate, fifteenDaysAgo)
        ),
        and(
            eq(orders.status, 'WAITING_ARRIVAL'),
            lte(orders.expectedArrivalDate, fifteenDaysAgo)
        )
    )

    let whereClause: any[] = [pendencyConditions]

    // Filters
    if (supplierId && supplierId !== 'ALL') {
        whereClause.push(eq(orders.supplierId, parseInt(supplierId)))
    }

    if (date) {
        const filterDate = new Date(date)
        whereClause.push(
            and(
                gte(orders.sentDate, startOfDay(filterDate)),
                lte(orders.sentDate, endOfDay(filterDate))
            )
        )
    }

    const results = await db.query.orders.findMany({
        where: and(...whereClause),
        with: {
            supplier: true,
        },
        orderBy: [desc(orders.sentDate)]
    })

    if (search) {
        const searchLower = search.toLowerCase()
        return results.filter(order =>
            order.code.toLowerCase().includes(searchLower) ||
            order.supplier.name.toLowerCase().includes(searchLower)
        )
    }

    return results
}

export async function getOrderById(id: number | string) {
    const orderId = Number(id)
    if (isNaN(orderId)) return null;

    const order = await db.query.orders.findFirst({
        where: eq(orders.id, orderId),
        with: {
            supplier: true,
            history: {
                orderBy: [desc(orderHistory.changeDate)]
            }
        },
    })
    return order
}

export async function createOrder(data: { code: string, supplierId: string, totalValue: string, observations?: string, initialStatus?: "CREATED" | "SENT" | "PENDING_ISSUE" | "FEEDING", expectedArrivalDate?: Date, requestedBy?: string }) {
    const status = data.initialStatus || 'CREATED'
    // 1. Create Order
    const [newOrder] = await db.insert(orders).values({
        code: data.code,
        supplierId: parseInt(data.supplierId),
        totalValue: data.totalValue,
        observations: data.observations,
        status: status,
        expectedArrivalDate: data.expectedArrivalDate,
        requestedBy: data.requestedBy,
    }).returning()

    // 2. Add Initial History
    const notesMap: Record<string, string> = {
        'FEEDING': 'Pedido criado (Alimentando)',
        'PENDING_ISSUE': 'Pendência registrada',
        'SENT': 'Enviado ao fornecedor',
    }
    await db.insert(orderHistory).values({
        orderId: newOrder.id,
        newStatus: status,
        notes: notesMap[status] || 'Pedido criado (Aguardando envio)',
    })

    revalidatePath("/orders")
    revalidatePath("/feeding-orders")
    revalidatePath("/waiting-shipment")
    revalidatePath("/waiting-mirror")
    revalidatePath("/arriving-today")
    revalidatePath("/pendencies")
    revalidatePath("/")
    revalidatePath("/", "layout")
    return newOrder
}

export async function updateOrderStatus(id: number, newStatus: "FEEDING" | "CREATED" | "SENT" | "APPROVED" | "MIRROR_ARRIVED" | "WAITING_ARRIVAL" | "RECEIVED_COMPLETE" | "RECEIVED_PARTIAL" | "PENDING_ISSUE" | "CANCELLED", notes?: string, expectedDate?: Date, remainingValue?: string, partialReason?: string) {

    // Get current status for history
    const currentOrder = await db.query.orders.findFirst({
        where: eq(orders.id, id),
    })

    if (!currentOrder) throw new Error("Order not found")

    // Update Order
    await db.update(orders)
        .set({
            status: newStatus,
            expectedArrivalDate: expectedDate || currentOrder.expectedArrivalDate,
            remainingValue: remainingValue || null,
            partialReason: newStatus === "RECEIVED_PARTIAL" ? (partialReason || null) : null,
            lastUpdate: new Date()
        })
        .where(eq(orders.id, id))

    let finalNotes = notes || `Status alterado para ${newStatus}`
    if (newStatus === "RECEIVED_PARTIAL" && remainingValue) {
        finalNotes = `${notes || 'Recebido com saldo'}. Saldo restante: R$ ${remainingValue}`
        if (partialReason) {
            finalNotes += `. Motivo: ${partialReason}`
        }
    }

    // Add History
    await db.insert(orderHistory).values({
        orderId: id,
        previousStatus: currentOrder.status,
        newStatus: newStatus,
        notes: finalNotes,
    })

    revalidatePath(`/orders/${id}`)
    revalidatePath("/orders")
    revalidatePath("/feeding-orders")
    revalidatePath("/waiting-shipment")
    revalidatePath("/waiting-mirror")
    revalidatePath("/arriving-today")
    revalidatePath("/received-orders")
    revalidatePath("/pending-balance")
    revalidatePath("/")
    revalidatePath("/", "layout")
}

export async function cancelOrder(id: number, reason: string, cancelledBy: string) {
    const currentOrder = await db.query.orders.findFirst({
        where: eq(orders.id, id),
    })

    if (!currentOrder) throw new Error("Order not found")

    // Update Order
    await db.update(orders)
        .set({
            status: 'CANCELLED',
            cancellationReason: reason,
            cancelledBy: cancelledBy,
            lastUpdate: new Date()
        })
        .where(eq(orders.id, id))

    // Add History
    await db.insert(orderHistory).values({
        orderId: id,
        previousStatus: currentOrder.status,
        newStatus: 'CANCELLED',
        notes: `Pedido cancelado por ${cancelledBy}. Motivo: ${reason}`,
    })

    revalidatePath(`/orders/${id}`)
    revalidatePath("/orders")
    revalidatePath("/cancelled-orders")
    revalidatePath("/")
    revalidatePath("/", "layout")
}

export async function updateOrderObservations(id: number, observations: string) {
    await db.update(orders)
        .set({
            observations: observations,
            lastUpdate: new Date()
        })
        .where(eq(orders.id, id))

    revalidatePath(`/orders/${id}`)
    revalidatePath("/orders")
}

export async function updateOrderRequestedBy(id: number, requestedBy: string) {
    await db.update(orders)
        .set({
            requestedBy: requestedBy,
            lastUpdate: new Date()
        })
        .where(eq(orders.id, id))

    revalidatePath(`/orders/${id}`)
    revalidatePath("/orders")
}


export async function updateOrderValue(id: number, newValue: string) {
    const currentOrder = await db.query.orders.findFirst({
        where: eq(orders.id, id),
    })

    if (!currentOrder) throw new Error("Order not found")

    await db.update(orders)
        .set({
            totalValue: newValue,
            lastUpdate: new Date()
        })
        .where(eq(orders.id, id))

    await db.insert(orderHistory).values({
        orderId: id,
        previousStatus: currentOrder.status,
        newStatus: currentOrder.status,
        notes: `Valor alterado de R$ ${currentOrder.totalValue || '0.00'} para R$ ${newValue}`,
    })

    revalidatePath(`/orders/${id}`)
    revalidatePath("/orders")
}

export async function toggleOrderChecked(id: number, isChecked: boolean) {
    await db.update(orders)
        .set({
            checked: isChecked,
            lastUpdate: new Date()
        })
        .where(eq(orders.id, id))

    revalidatePath(`/orders/${id}`)
    revalidatePath("/orders")
}

export async function deleteOrder(id: number) {
    await db.delete(orderHistory).where(eq(orderHistory.orderId, id))
    await db.delete(partialReceipts).where(eq(partialReceipts.orderId, id))
    await db.delete(orders).where(eq(orders.id, id))

    revalidatePath("/orders")
    revalidatePath("/feeding-orders")
    revalidatePath("/waiting-shipment")
    revalidatePath("/waiting-mirror")
    revalidatePath("/arriving-today")
    revalidatePath("/received-orders")
    revalidatePath("/cancelled-orders")
    revalidatePath("/pending-balance")
    revalidatePath("/")
    revalidatePath("/", "layout")
}

export async function restoreOrder(id: number) {
    const currentOrder = await db.query.orders.findFirst({
        where: eq(orders.id, id),
    })

    if (!currentOrder) throw new Error("Order not found")

    // Update Order to CREATED status
    await db.update(orders)
        .set({
            status: 'CREATED',
            cancellationReason: null,
            cancelledBy: null,
            lastUpdate: new Date()
        })
        .where(eq(orders.id, id))

    // Add History
    await db.insert(orderHistory).values({
        orderId: id,
        previousStatus: 'CANCELLED',
        newStatus: 'CREATED',
        notes: `Pedido restaurado para o status inicial.`,
    })

    revalidatePath(`/orders/${id}`)
    revalidatePath("/orders")
    revalidatePath("/cancelled-orders")
    revalidatePath("/waiting-shipment")
    revalidatePath("/")
    revalidatePath("/", "layout")
}

export async function getFeedingOrders(search?: string, supplierId?: string) {
    let whereClause: any[] = [
        eq(orders.status, 'FEEDING'),
    ]

    if (supplierId && supplierId !== 'ALL') {
        whereClause.push(eq(orders.supplierId, parseInt(supplierId)))
    }

    const results = await db.query.orders.findMany({
        where: and(...whereClause),
        with: {
            supplier: true,
        },
        orderBy: [desc(orders.sentDate)]
    })

    if (search) {
        const searchLower = search.toLowerCase()
        return results.filter(order =>
            order.code.toLowerCase().includes(searchLower) ||
            order.supplier.name.toLowerCase().includes(searchLower)
        )
    }

    return results
}
