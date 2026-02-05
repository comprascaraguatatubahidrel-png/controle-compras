import { db } from "@/db"
import { orders, refusedInvoices } from "@/db/schema"
import { eq, not, or, and } from "drizzle-orm"

export async function getMenuCounts() {
    // Count active orders (excluding completed and cancelled)
    const activeOrders = await db.query.orders.findMany({
        where: and(
            not(eq(orders.status, 'RECEIVED_COMPLETE')),
            not(eq(orders.status, 'CANCELLED'))
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

    // Count refused invoices
    const refusedInvoicesCount = await db.query.refusedInvoices.findMany()

    return {
        orders: ordersCount,
        cancelledOrders: cancelledCount,
        refusedInvoices: refusedInvoicesCount.length,
        pendingBalance: pendingBalanceCount
    }
}

