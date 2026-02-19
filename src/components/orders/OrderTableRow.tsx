"use client"

import { TableRow } from "@/components/ui/table"
import { useRouter } from "next/navigation"

interface OrderTableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
    orderId: number
    children: React.ReactNode
    backUrl?: string
}

export function OrderTableRow({ orderId, children, className, backUrl, ...props }: OrderTableRowProps) {
    const router = useRouter()

    return (
        <TableRow
            className={`cursor-pointer hover:bg-muted/50 ${className || ''}`}
            onClick={(e) => {
                // Prevent navigation if clicking on interactive elements
                if (
                    (e.target as HTMLElement).closest('button') ||
                    (e.target as HTMLElement).closest('a') ||
                    (e.target as HTMLElement).closest('[role="menuitem"]') ||
                    (e.target as HTMLElement).closest('[role="combobox"]')
                ) {
                    return
                }
                const destination = backUrl
                    ? `/orders/${orderId}?back=${encodeURIComponent(backUrl)}`
                    : `/orders/${orderId}`
                router.push(destination)
            }}
            {...props}
        >
            {children}
        </TableRow>
    )
}
