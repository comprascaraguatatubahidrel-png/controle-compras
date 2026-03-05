"use client"

import { CloseBalanceModal } from "./CloseBalanceModal"
import { ExtendDeadlineModal } from "./ExtendDeadlineModal"

interface PendingBalanceActionsProps {
    orderId: number
    remainingValue: string | null
    currentExpectedDate: string | null
}

export function PendingBalanceActions({ orderId, remainingValue, currentExpectedDate }: PendingBalanceActionsProps) {
    return (
        <div className="flex items-center justify-end gap-2">
            <ExtendDeadlineModal orderId={orderId} currentDate={currentExpectedDate} />
            <CloseBalanceModal orderId={orderId} remainingValue={remainingValue} />
        </div>
    )
}
