'use server'

import { db } from "@/db"
import { orders, orderHistory } from "@/db/schema"
import { revalidatePath } from "next/cache"
import { eq, desc, and, gte, lte, not } from "drizzle-orm"
import { startOfDay, endOfDay } from "date-fns"

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

    // Default: exclude RECEIVED_COMPLETE unless explicitly filtered
    // Don't exclude if user is specifically filtering by something
    if (!status && !filter && !search && !supplierId && !date) {
        whereClause.push(not(eq(orders.status, 'RECEIVED_COMPLETE')))
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

export async function createOrder(data: { code: string, supplierId: string, totalValue: string, observations?: string }) {
    // 1. Create Order
    const [newOrder] = await db.insert(orders).values({
        code: data.code,
        supplierId: parseInt(data.supplierId),
        totalValue: data.totalValue,
        observations: data.observations,
        status: 'SENT',
    }).returning()

    // 2. Add Initial History
    await db.insert(orderHistory).values({
        orderId: newOrder.id,
        newStatus: 'SENT',
        notes: 'Pedido criado',
    })

    revalidatePath("/orders")
    revalidatePath("/")
}

export async function updateOrderStatus(id: number, newStatus: "SENT" | "APPROVED" | "MIRROR_ARRIVED" | "WAITING_ARRIVAL" | "RECEIVED_COMPLETE" | "RECEIVED_PARTIAL", notes?: string, expectedDate?: Date) {

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
            lastUpdate: new Date()
        })
        .where(eq(orders.id, id))

    // Add History
    await db.insert(orderHistory).values({
        orderId: id,
        previousStatus: currentOrder.status,
        newStatus: newStatus,
        notes: notes || `Status alterado para ${newStatus}`,
    })

    revalidatePath(`/orders/${id}`)
    revalidatePath("/orders")
    revalidatePath("/")
}
