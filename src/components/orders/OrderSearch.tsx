"use client"

import { Search, X } from "lucide-react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/lib/useDebounce"

export function OrderSearch() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const [isPending, startTransition] = useTransition()

    const initialQuery = searchParams.get("q") || ""
    const [inputValue, setInputValue] = useState(initialQuery)
    const debouncedValue = useDebounce(inputValue, 300)

    useEffect(() => {
        const params = new URLSearchParams(searchParams)
        if (debouncedValue) {
            params.set("q", debouncedValue)
        } else {
            params.delete("q")
        }

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`)
        })
    }, [debouncedValue, router, searchParams, pathname])

    return (
        <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Buscar por código ou fornecedor..."
                className="w-full pl-8 md:w-[300px] lg:w-[400px]"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
            />
            {inputValue && (
                <button
                    onClick={() => setInputValue("")}
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
            {isPending && (
                <div className="absolute right-10 top-2.5">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
            )}
        </div>
    )
}

