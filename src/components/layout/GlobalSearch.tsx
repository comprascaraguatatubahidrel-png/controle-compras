"use client"

import * as React from "react"
import { Calculator, Calendar, CreditCard, Settings, Smile, User, Search, Package, FileText, Truck, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { searchAll, SearchResult } from "@/actions/search"
import { Button } from "@/components/ui/button"
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function GlobalSearch() {
    const router = useRouter()
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState("")
    const [results, setResults] = React.useState<SearchResult[]>([])
    const [loading, setLoading] = React.useState(false)

    // Manual debounce
    React.useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2) {
                setLoading(true)
                try {
                    const data = await searchAll(query)
                    setResults(data)
                    setOpen(true)
                } catch (error) {
                    console.error(error)
                } finally {
                    setLoading(false)
                }
            } else {
                setResults([])
                setOpen(false)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [query])

    const handleSelect = (url: string) => {
        setOpen(false)
        setQuery("")
        router.push(url)
    }

    return (
        <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Buscar pedidos, fornecedores..."
                className="w-full pl-8 bg-background"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && query.length > 0) {
                        setOpen(false)
                        router.push(`/search?q=${encodeURIComponent(query)}`)
                    }
                }}
                onFocus={() => query.length >= 2 && setOpen(true)}
            // onBlur={() => setTimeout(() => setOpen(false), 200)} // Delay to allow click
            />

            {open && results.length > 0 && (
                <div className="absolute top-full z-50 mt-2 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95">
                    <div className="max-h-[300px] overflow-y-auto p-1">
                        {loading && <div className="p-2 text-sm text-muted-foreground">Buscando...</div>}

                        {!loading && results.map((result) => (
                            <div
                                key={`${result.type}-${result.id}`}
                                className={cn(
                                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                    "justify-between"
                                )}
                                onClick={() => handleSelect(result.url)}
                            >
                                <div className="flex items-center gap-2 overflow-hidden">
                                    {result.type === 'order' && <Package className="h-4 w-4 text-primary" />}
                                    {result.type === 'supplier' && <Truck className="h-4 w-4 text-blue-500" />}
                                    {result.type === 'invoice' && <FileText className="h-4 w-4 text-red-500" />}

                                    <div className="flex flex-col truncate">
                                        <span className="font-medium truncate">{result.title}</span>
                                        <span className="text-xs text-muted-foreground truncate">{result.subtitle}</span>
                                    </div>
                                </div>

                                {result.status && (
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground ml-2 px-1 border rounded">
                                        {result.status}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {open && query.length >= 2 && results.length === 0 && !loading && (
                <div className="absolute top-full z-50 mt-2 w-full rounded-md border bg-popover p-4 text-center text-sm text-muted-foreground shadow-md">
                    Nenhum resultado encontrado.
                </div>
            )}
        </div>
    )
}
