'use client'

import { useState, useCallback, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Filter, X, Calendar as CalendarIcon, Check } from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"

interface Supplier {
    id: number;
    name: string;
}

interface OrderFiltersProps {
    suppliers: Supplier[];
}

const statusMap: Record<string, string> = {
    SENT: "Enviado ao Fornecedor",
    APPROVED: "Orçamento Aprovado",
    MIRROR_ARRIVED: "Espelho Chegou",
    WAITING_ARRIVAL: "Aguardando Chegada",
    RECEIVED_COMPLETE: "Recebido Completo",
    RECEIVED_PARTIAL: "Recebido com Saldo",
    CANCELLED: "Cancelado",
}

export function OrderFilters({ suppliers }: OrderFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    const [openSupplier, setOpenSupplier] = useState(false)

    // Local state for filters to allow batch applying or instant updates
    // For this implementation, we'll update on individual changes to keep it simple and responsive
    const currentStatus = searchParams.get("status") || "ALL"
    const currentSupplier = searchParams.get("supplierId") || "ALL"
    const currentDate = searchParams.get("date")

    const createQueryString = useCallback(
        (params: Record<string, string | null>) => {
            const newSearchParams = new URLSearchParams(searchParams.toString())

            Object.entries(params).forEach(([key, value]) => {
                if (value === null || value === "ALL") {
                    newSearchParams.delete(key)
                } else {
                    newSearchParams.set(key, value)
                }
            })

            return newSearchParams.toString()
        },
        [searchParams]
    )

    const handleStatusChange = (value: string) => {
        startTransition(() => {
            router.push(`/orders?${createQueryString({ status: value })}`)
        })
    }

    const handleSupplierChange = (value: string) => {
        startTransition(() => {
            router.push(`/orders?${createQueryString({ supplierId: value })}`)
        })
        setOpenSupplier(false)
    }

    const handleDateChange = (date: Date | undefined) => {
        startTransition(() => {
            router.push(`/orders?${createQueryString({ date: date ? date.toISOString() : null })}`)
        })
    }

    const clearFilters = () => {
        startTransition(() => {
            router.push("/orders")
        })
    }

    const hasFilters = currentStatus !== "ALL" || currentSupplier !== "ALL" || currentDate

    return (
        <div className="flex items-center gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2 dashed">
                        <Filter className="h-4 w-4" />
                        Filtros
                        {hasFilters && (
                            <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                                {[
                                    currentStatus !== "ALL",
                                    currentSupplier !== "ALL",
                                    !!currentDate
                                ].filter(Boolean).length}
                            </span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="start">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium leading-none">Status</h4>
                            <Select value={currentStatus} onValueChange={handleStatusChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Todos</SelectItem>
                                    {Object.entries(statusMap).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-medium leading-none">Fornecedor</h4>
                            <Popover open={openSupplier} onOpenChange={setOpenSupplier}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openSupplier}
                                        className="w-full justify-between"
                                    >
                                        {currentSupplier !== "ALL"
                                            ? suppliers.find((s) => s.id.toString() === currentSupplier)?.name
                                            : "Selecione o fornecedor..."}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Buscar fornecedor..." />
                                        <CommandList>
                                            <CommandEmpty>Nenhum fornecedor encontrado.</CommandEmpty>
                                            <CommandGroup>
                                                <CommandItem
                                                    value="ALL"
                                                    onSelect={() => handleSupplierChange("ALL")}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            currentSupplier === "ALL" ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    Todos
                                                </CommandItem>
                                                {suppliers.map((supplier) => (
                                                    <CommandItem
                                                        key={supplier.id}
                                                        value={supplier.name}
                                                        onSelect={() => handleSupplierChange(supplier.id.toString())}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                currentSupplier === supplier.id.toString() ? "opacity-100" : "opacity-0"
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
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-medium leading-none">Data de Chegada</h4>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !currentDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {currentDate ? format(new Date(currentDate), "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={currentDate ? new Date(currentDate) : undefined}
                                        onSelect={handleDateChange}
                                        initialFocus
                                        locale={ptBR}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {hasFilters && (
                            <Button
                                variant="ghost"
                                className="w-full"
                                onClick={clearFilters}
                            >
                                <X className="mr-2 h-4 w-4" />
                                Limpar Filtros
                            </Button>
                        )}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
