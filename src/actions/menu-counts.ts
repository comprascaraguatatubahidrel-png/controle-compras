import { db } from "@/db"
import { orders, refusedInvoices } from "@/db/schema"
import { eq, not, or, and } from "drizzle-orm"
import { unstable_noStore as noStore } from "next/cache"

export async function getMenuCounts() {
    noStore()
    const allOrders = await db.query.orders.findMany()
    const today = new Date()
    const todayStart = new Date(today.setHours(0, 0, 0, 0))
    const todayEnd = new Date(today.setHours(23, 59, 59, 999))

    return {
        orders: allOrders.filter(o => !['RECEIVED_COMPLETE', 'CANCELLED', 'FEEDING'].includes(o.status)).length,
        waitingShipment: allOrders.filter(o => o.status === 'CREATED').length,
        waitingMirror: allOrders.filter(o => o.status === 'SENT').length,
        arrivingToday: allOrders.filter(o => {
            if (!o.expectedArrivalDate) return false
            const d = new Date(o.expectedArrivalDate)
            return d >= todayStart && d <= todayEnd && !['RECEIVED_COMPLETE', 'CANCELLED'].includes(o.status)
        }).length,
        cancelledOrders: allOrders.filter(o => o.status === 'CANCELLED').length,
        receivedOrders: allOrders.filter(o => o.status === 'RECEIVED_COMPLETE').length,
        refusedInvoices: (await db.query.refusedInvoices.findMany()).length,
        pendingBalance: allOrders.filter(o => o.status === 'RECEIVED_PARTIAL').length,
        feedingOrders: allOrders.filter(o => o.status === 'FEEDING').length
    }
}

