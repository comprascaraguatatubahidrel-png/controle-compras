"use client"

import Link from "next/link"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { useSearchParams } from "next/navigation"

interface SortableHeaderProps {
    column: string
    children: React.ReactNode
}

export function SortableHeader({ column, children }: SortableHeaderProps) {
    const searchParams = useSearchParams()
    const currentSort = searchParams.get('sort')
    const currentOrder = searchParams.get('order')

    const isActive = currentSort === column
    const nextOrder = isActive && currentOrder !== 'desc' ? 'desc' : 'asc'

    // Build URL preserving other params
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', column)
    params.set('order', nextOrder)

    return (
        <Link
            href={`/orders?${params.toString()}`}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
            {children}
            {isActive ? (
                currentOrder === 'desc' ? (
                    <ArrowDown className="h-3 w-3" />
                ) : (
                    <ArrowUp className="h-3 w-3" />
                )
            ) : (
                <ArrowUpDown className="h-3 w-3 opacity-50" />
            )}
        </Link>
    )
}
