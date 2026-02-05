"use client"

import { OrderActions } from "@/components/orders/OrderActions"
import { updateOrderStatus } from "@/actions/orders"

export function OrderActionsWrapper({ orderId, currentStatus }: { orderId: number, currentStatus: any }) {

    const handleStatusChange = async (newStatus: any, notes?: string, date?: Date, remainingValue?: string, partialReason?: string) => {
        await updateOrderStatus(orderId, newStatus, notes, date, remainingValue, partialReason)
    }

    return (
        <OrderActions status={currentStatus} onStatusChange={handleStatusChange} />
    )
}

