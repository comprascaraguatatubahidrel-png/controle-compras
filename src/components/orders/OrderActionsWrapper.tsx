"use client"

import { OrderActions } from "@/components/orders/OrderActions"
import { updateOrderStatus } from "@/actions/orders"
import { useRouter } from "next/navigation"

export function OrderActionsWrapper({ orderId, currentStatus }: { orderId: number, currentStatus: any }) {
    const router = useRouter()

    const handleStatusChange = async (newStatus: any, notes?: string, date?: Date, remainingValue?: string, partialReason?: string) => {
        await updateOrderStatus(orderId, newStatus, notes, date, remainingValue, partialReason)
        router.refresh()
    }

    return (
        <OrderActions status={currentStatus} onStatusChange={handleStatusChange} />
    )
}

