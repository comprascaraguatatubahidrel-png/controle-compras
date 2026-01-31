"use client"

import { TableRow } from "@/components/ui/table"
import { useRouter } from "next/navigation"

interface OrderTableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
    orderId: number
    children: React.ReactNode
}

export function OrderTableRow({ orderId, children, className, ...props }: OrderTableRowProps) {
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
                router.push(`/orders/${orderId}`)
            }}
            {...props}
        >
            {children}
        </TableRow>
    )
}
