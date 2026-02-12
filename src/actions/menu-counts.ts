import { db } from "@/db"
import { orders, refusedInvoices } from "@/db/schema"
import { eq, not, or, and } from "drizzle-orm"

export async function getMenuCounts() {
    // Count active orders (excluding completed, cancelled, and feeding)
    const activeOrders = await db.query.orders.findMany({
        where: and(
            not(eq(orders.status, 'RECEIVED_COMPLETE')),
            not(eq(orders.status, 'CANCELLED')),
            not(eq(orders.status, 'FEEDING'))
        )
    })

    const ordersCount = activeOrders.length // Include all active orders

    // Count cancelled orders
    const cancelledOrders = await db.query.orders.findMany({
        where: eq(orders.status, 'CANCELLED')
    })
    const cancelledCount = cancelledOrders.length

    // Count orders with pending balance
    const pendingBalanceOrders = await db.query.orders.findMany({
        where: eq(orders.status, 'RECEIVED_PARTIAL')
    })
    const pendingBalanceCount = pendingBalanceOrders.length

    // Count feeding orders
    const feedingOrders = await db.query.orders.findMany({
        where: eq(orders.status, 'FEEDING')
    })
    const feedingCount = feedingOrders.length

    // Count refused invoices
    const refusedInvoicesCount = await db.query.refusedInvoices.findMany()

    return {
        orders: ordersCount,
        cancelledOrders: cancelledCount,
        refusedInvoices: refusedInvoicesCount.length,
        pendingBalance: pendingBalanceCount,
        feedingOrders: feedingCount
    }
}

