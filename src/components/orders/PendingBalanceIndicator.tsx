"use client"

import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"

interface PendingBalanceIndicatorProps {
    remainingValue: string | null
    expectedArrivalDate: Date | null
}

export function PendingBalanceIndicator({ remainingValue, expectedArrivalDate }: PendingBalanceIndicatorProps) {
    if (!remainingValue || Number(remainingValue) === 0) return null

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let isOverdue = false
    if (expectedArrivalDate) {
        const expected = new Date(expectedArrivalDate)
        expected.setHours(0, 0, 0, 0)
        isOverdue = expected < today
    }

    return (
        <div className="flex items-center gap-1.5">
            <Badge
                variant="outline"
                className={`text-xs font-semibold ${isOverdue
                        ? "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                        : "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
                    }`}
            >
                {isOverdue && <AlertTriangle className="h-3 w-3 mr-1" />}
                Saldo: R$ {remainingValue}
            </Badge>
        </div>
    )
}
