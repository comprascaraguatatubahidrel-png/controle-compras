'use server'

import { db } from "@/db"
import { orders, orderHistory, suppliers } from "@/db/schema"
import { revalidatePath } from "next/cache"
import { eq, desc, or, ilike } from "drizzle-orm"

export async function getOrders(search?: string) {
    if (search) {
        return await db.select({
            id: orders.id,
            code: orders.code,
            supplierId: orders.supplierId,
            totalValue: orders.totalValue,
            status: orders.status,
            sentDate: orders.sentDate,
            expectedArrivalDate: orders.expectedArrivalDate,
            observations: orders.observations,
            lastUpdate: orders.lastUpdate,
            supplier: {
                id: suppliers.id,
                name: suppliers.name,
                brand: suppliers.brand,
                observations: suppliers.observations,
                createdAt: suppliers.createdAt,
                updatedAt: suppliers.updatedAt,
            }
        })
            .from(orders)
            .innerJoin(suppliers, eq(orders.supplierId, suppliers.id))
            .where(
                or(
                    ilike(orders.code, `%${search}%`),
                    ilike(suppliers.name, `%${search}%`)
                )
            )
            .orderBy(desc(orders.sentDate))
    }

    return await db.query.orders.findMany({
        with: {
            supplier: true,
        },
        orderBy: [desc(orders.sentDate)],
    })
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
