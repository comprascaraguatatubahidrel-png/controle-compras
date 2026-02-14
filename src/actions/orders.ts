'use server'

import { db } from "@/db"
import { orders, orderHistory, partialReceipts, suppliers } from "@/db/schema"
import { revalidatePath } from "next/cache"
import { eq, desc, and, gte, lte, not, or } from "drizzle-orm"
import { auth } from "@/auth"
import { startOfDay, endOfDay, subDays } from "date-fns"

export async function getOrders(search?: string, status?: string, filter?: string, supplierId?: string, date?: string) {
    const today = new Date()
    const session = await auth();
    const storeId = session?.user?.storeId || 1; // Fallback to Matriz

    let whereClause: any[] = [eq(orders.storeId, storeId as number)]

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
    const session = await auth();
    const storeId = session?.user?.storeId || 1;

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

    let whereClause: any[] = [
        pendencyConditions,
        eq(orders.storeId, storeId as number)
    ]

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

    const session = await auth();
    const storeId = session?.user?.storeId || 1;

    const order = await db.query.orders.findFirst({
        where: and(
            eq(orders.id, orderId),
            eq(orders.storeId, storeId as number)
        ),
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
    const session = await auth();
    const storeId = session?.user?.storeId || 1; // Fallback to ensure service doesn't stop

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
        storeId: storeId as number
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
    revalidatePath("/pendencies")
    revalidatePath("/")
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
    revalidatePath("/pending-balance")
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
    // 1. Delete history first due to foreign key constraints if they aren't CASCADE
    // Actually in schema.ts they don't have onDelete: 'cascade' explicitly mentioned 
    // but Drizzle might handle it if configured. Looking at schema.ts, it's just references().
    await db.delete(orderHistory).where(eq(orderHistory.orderId, id))

    // 2. Delete partial receipts if any
    await db.delete(partialReceipts).where(eq(partialReceipts.orderId, id))

    // 3. Delete the order
    await db.delete(orders).where(eq(orders.id, id))

    revalidatePath("/orders")
    revalidatePath("/cancelled-orders")
    revalidatePath("/")
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
    revalidatePath("/")
}

export async function getFeedingOrders(search?: string, supplierId?: string) {
    const session = await auth();
    const storeId = session?.user?.storeId || 1;

    let whereClause: any[] = [
        eq(orders.status, 'FEEDING'),
        eq(orders.storeId, storeId as number)
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
