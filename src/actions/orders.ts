'use server'

import { db } from "@/db"
import { orders, orderHistory } from "@/db/schema"
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

    if (date) {
        const filterDate = new Date(date)
        whereClause.push(
            and(
                gte(orders.expectedArrivalDate, startOfDay(filterDate)),
                lte(orders.expectedArrivalDate, endOfDay(filterDate))
            )
        )
    }

    if (filter === 'arriving_today') {
        whereClause.push(
            and(
                gte(orders.expectedArrivalDate, startOfDay(today)),
                lte(orders.expectedArrivalDate, endOfDay(today))
            )
        )
    }

    // Default: exclude RECEIVED_COMPLETE and CANCELLED unless explicitly filtered
    // Don't exclude if user is specifically filtering by something
    if (!status && !filter && !search && !supplierId && !date) {
        whereClause.push(not(eq(orders.status, 'RECEIVED_COMPLETE')))
        whereClause.push(not(eq(orders.status, 'CANCELLED')))
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
        // For pendencies, date filter might mean "Created On" or "Expected On". 
        // Let's assume user wants to filter by Sent Date usually, or Created Date.
        // But for consistency with getOrders, let's use expectedArrivalDate IF it exists, otherwise SentDate might be better?
        // Actually, the UI for filter just sends 'date'.
        // Let's stick to modifying the query to check if ANY of the date fields match, or just specific one.
        // Given the context, usually people filter by when it was supposed to arrive or when it was sent.
        // Let's try to filter by sentDate for now as it's always present.
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

export async function createOrder(data: { code: string, supplierId: string, totalValue: string, observations?: string, initialStatus?: "CREATED" | "SENT" | "PENDING_ISSUE", expectedArrivalDate?: Date }) {
    const status = data.initialStatus || 'CREATED'
    // 1. Create Order
    const [newOrder] = await db.insert(orders).values({
        code: data.code,
        supplierId: parseInt(data.supplierId),
        totalValue: data.totalValue,
        observations: data.observations,
        status: status,
        expectedArrivalDate: data.expectedArrivalDate,
    }).returning()

    // 2. Add Initial History
    await db.insert(orderHistory).values({
        orderId: newOrder.id,
        newStatus: status,
        notes: status === 'PENDING_ISSUE' ? 'Pendência registrada' : (status === 'SENT' ? 'Enviado ao fornecedor' : 'Pedido criado (Aguardando envio)'),
    })

    revalidatePath("/orders")
    revalidatePath("/pendencies")
    revalidatePath("/")
    return newOrder
}

export async function updateOrderStatus(id: number, newStatus: "CREATED" | "SENT" | "APPROVED" | "MIRROR_ARRIVED" | "WAITING_ARRIVAL" | "RECEIVED_COMPLETE" | "RECEIVED_PARTIAL" | "PENDING_ISSUE" | "CANCELLED", notes?: string, expectedDate?: Date, remainingValue?: string) {

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
            lastUpdate: new Date()
        })
        .where(eq(orders.id, id))

    let finalNotes = notes || `Status alterado para ${newStatus}`
    if (newStatus === "RECEIVED_PARTIAL" && remainingValue) {
        finalNotes = `${notes || 'Recebido com saldo'}. Saldo restante: R$ ${remainingValue}`
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
    revalidatePath("/")
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
