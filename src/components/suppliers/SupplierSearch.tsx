"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTransition, useState, useEffect } from "react"

export function SupplierSearch() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "")

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            startTransition(() => {
                const params = new URLSearchParams(searchParams)
                if (searchTerm) {
                    params.set("q", searchTerm)
                } else {
                    params.delete("q")
                }
                router.replace(`/suppliers?${params.toString()}`)
            })
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [searchTerm, router, searchParams])

    return (
        <div className="relative flex-1">
            <Search className={`absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground ${isPending ? 'animate-pulse' : ''}`} />
            <Input
                type="search"
                placeholder="Buscar por nome ou marca..."
                className="w-full pl-8 md:w-[300px] lg:w-[400px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
    )
}
