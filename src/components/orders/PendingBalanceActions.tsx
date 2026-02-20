"use client"

import { CloseBalanceModal } from "./CloseBalanceModal"

interface PendingBalanceActionsProps {
    orderId: number
    remainingValue: string | null
}

export function PendingBalanceActions({ orderId, remainingValue }: PendingBalanceActionsProps) {
    return (
        <div className="flex items-center justify-end">
            <CloseBalanceModal orderId={orderId} remainingValue={remainingValue} />
        </div>
    )
}
