"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useTransition } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useState } from "react"

interface Supplier {
    id: number
    name: string
}

interface SupplierFilterProps {
    suppliers: Supplier[]
}

export function SupplierFilter({ suppliers }: SupplierFilterProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const [isPending, startTransition] = useTransition()
    const [open, setOpen] = useState(false)

    const currentSupplierId = searchParams.get("supplierId") || "ALL"

    const handleSelect = (value: string) => {
        const params = new URLSearchParams(searchParams)
        if (value === "ALL") {
            params.delete("supplierId")
        } else {
            params.set("supplierId", value)
        }

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`)
        })
        setOpen(false)
    }

    const selectedSupplier = suppliers.find(s => s.id.toString() === currentSupplierId)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                >
                    {currentSupplierId === "ALL"
                        ? "Todos os Fornecedores"
                        : selectedSupplier?.name || "Fornecedor não encontrado"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Buscar fornecedor..." />
                    <CommandList>
                        <CommandEmpty>Fornecedor não encontrado.</CommandEmpty>
                        <CommandGroup>
                            <CommandItem
                                value="todos os fornecedores"
                                onSelect={() => handleSelect("ALL")}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        currentSupplierId === "ALL" ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                Todos os Fornecedores
                            </CommandItem>
                            {suppliers.map((supplier) => (
                                <CommandItem
                                    key={supplier.id}
                                    value={supplier.name}
                                    onSelect={() => handleSelect(supplier.id.toString())}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            currentSupplierId === supplier.id.toString() ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {supplier.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
