"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check, ChevronsUpDown, Plus, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { SupplierForm } from "@/components/suppliers/SupplierForm"
import { createRefusedInvoice } from "@/actions/refused-invoices"
import { getSuppliers, createSupplier } from "@/actions/suppliers"
import { cn } from "@/lib/utils"

const formSchema = z.object({
    invoiceNumber: z.string().min(1, "Número da NF é obrigatório."),
    supplierId: z.string().min(1, "Selecione um fornecedor."),
    value: z.string().min(1, "Informe o valor."),
    returnDate: z.date({
        message: "Data da devolução é obrigatória.",
    }),
    reason: z.string().min(1, "Informe o motivo da devolução."),
    boletoNumber: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function RefusedInvoiceForm() {
    const router = useRouter()
    const [suppliers, setSuppliers] = useState<{ id: number, name: string }[]>([])
    const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            invoiceNumber: "",
            supplierId: "",
            value: "",
            reason: "",
            boletoNumber: "",
        },
    })

    useEffect(() => {
        getSuppliers().then(data => {
            setSuppliers(data)
        })
    }, [])

    const handleCreateSupplier = async (data: any) => {
        await createSupplier({ name: data.name })
        const updatedSuppliers = await getSuppliers()
        setSuppliers(updatedSuppliers)

        if (updatedSuppliers.length > 0) {
            form.setValue("supplierId", updatedSuppliers[0].id.toString())
        }

        setIsSupplierDialogOpen(false)
    }

    async function onSubmit(data: FormValues) {
        setIsLoading(true)
        try {
            await createRefusedInvoice(data)
            router.push("/refused-invoices")
        } catch (error) {
            console.error("Failed to create refused invoice", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Nova Nota Fiscal Recusada</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="invoiceNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Número da NF</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: 12345" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="supplierId"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Fornecedor</FormLabel>
                                        <div className="flex gap-2">
                                            <Popover open={open} onOpenChange={setOpen}>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            aria-expanded={open}
                                                            className={cn(
                                                                "flex-1 justify-between font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value
                                                                ? suppliers.find(
                                                                    (s) => s.id.toString() === field.value
                                                                )?.name
                                                                : "Selecione..."}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[300px] p-0" align="start">
                                                    <Command>
                                                        <CommandInput placeholder="Buscar fornecedor..." />
                                                        <CommandList>
                                                            <CommandEmpty>Nenhum fornecedor encontrado.</CommandEmpty>
                                                            <CommandGroup>
                                                                {suppliers.map((s) => (
                                                                    <CommandItem
                                                                        key={s.id}
                                                                        value={s.name}
                                                                        onSelect={() => {
                                                                            form.setValue("supplierId", s.id.toString())
                                                                            setOpen(false)
                                                                        }}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                s.id.toString() === field.value
                                                                                    ? "opacity-100"
                                                                                    : "opacity-0"
                                                                            )}
                                                                        />
                                                                        {s.name}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>

                                            <Dialog open={isSupplierDialogOpen} onOpenChange={setIsSupplierDialogOpen}>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="icon" type="button" title="Novo Fornecedor">
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Novo Fornecedor</DialogTitle>
                                                        <DialogDescription>
                                                            Cadastre um novo fornecedor.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <SupplierForm onSubmit={handleCreateSupplier} />
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="value"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Valor (R$)</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="0,00"
                                                value={field.value}
                                                onChange={(e) => {
                                                    const rawValue = e.target.value.replace(/\D/g, "")
                                                    const decimalValue = (parseInt(rawValue) / 100).toFixed(2)
                                                    field.onChange(decimalValue)
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="returnDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Data da Devolução</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP", { locale: ptBR })
                                                        ) : (
                                                            <span>Selecione uma data</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date > new Date() || date < new Date("1900-01-01")
                                                    }
                                                    initialFocus
                                                    locale={ptBR}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="boletoNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Número do Boleto (Opcional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Número do boleto" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Motivo da Devolução</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Descreva o motivo..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-4 pt-4">
                            <Button variant="outline" type="button" asChild>
                                <Link href="/refused-invoices">Cancelar</Link>
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Salvando..." : "Salvar"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
