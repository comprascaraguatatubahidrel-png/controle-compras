"use client"

import { OrderActions } from "@/components/orders/OrderActions"
import { updateOrderStatus } from "@/actions/orders"

export function OrderActionsWrapper({ orderId, currentStatus }: { orderId: number, currentStatus: any }) {

    const handleStatusChange = async (newStatus: any, notes?: string, date?: Date) => {
        await updateOrderStatus(orderId, newStatus, notes, date)
    }

    return (
        <OrderActions status={currentStatus} onStatusChange={handleStatusChange} />
    )
}
