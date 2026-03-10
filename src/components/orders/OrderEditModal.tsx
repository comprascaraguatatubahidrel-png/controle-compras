"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Check, ChevronsUpDown, CalendarIcon, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
import { cn } from "@/lib/utils"
import { updateOrder } from "@/actions/orders"
import { getSuppliers } from "@/actions/suppliers"

const editSchema = z.object({
    code: z.string().min(1, "Código é obrigatório."),
    supplierId: z.string().min(1, "Selecione um fornecedor."),
    totalValue: z.string().min(1, "Informe o valor."),
    status: z.string().min(1, "Selecione o status."),
    observations: z.string().optional(),
    expectedDate: z.date().optional().nullable(),
    requestedBy: z.string().optional(),
})

type EditFormValues = z.infer<typeof editSchema>

const statusOptions = [
    { value: "FEEDING", label: "Alimentando" },
    { value: "CREATED", label: "Aguardando Envio" },
    { value: "SENT", label: "Enviado ao Fornecedor" },
    { value: "APPROVED", label: "Orçamento Aprovado" },
    { value: "MIRROR_ARRIVED", label: "Espelho Chegou" },
    { value: "WAITING_ARRIVAL", label: "Aguardando Chegada" },
    { value: "RECEIVED_COMPLETE", label: "Recebido Completo" },
    { value: "RECEIVED_PARTIAL", label: "Recebido com Saldo" },
    { value: "PENDING_ISSUE", label: "Pendência" },
    { value: "CANCELLED", label: "Cancelado" },
]

interface OrderEditModalProps {
    order: {
        id: number
        code: string
        supplierId: number
        totalValue: string | null
        status: string
        observations: string | null
        expectedArrivalDate: Date | null
        requestedBy: string | null
    }
}

export function OrderEditModal({ order }: OrderEditModalProps) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [suppliers, setSuppliers] = useState<{ id: number; name: string }[]>([])
    const [supplierOpen, setSupplierOpen] = useState(false)

    const predefinedRequestors = ["Junior", "Thiago", "Fernando", "Marcelo", "Sophia"]
    const [isCustomRequestor, setIsCustomRequestor] = useState(false)

    const form = useForm<EditFormValues>({
        resolver: zodResolver(editSchema),
        defaultValues: {
            code: order.code,
            supplierId: order.supplierId.toString(),
            totalValue: order.totalValue || "0.00",
            status: order.status,
            observations: order.observations || "",
            expectedDate: order.expectedArrivalDate || undefined,
            requestedBy: order.requestedBy || "",
        },
    })

    useEffect(() => {
        if (isOpen) {
            getSuppliers().then(data => setSuppliers(data))
            // Check if requestedBy is custom
            const reqBy = order.requestedBy || ""
            if (reqBy && !predefinedRequestors.includes(reqBy)) {
                setIsCustomRequestor(true)
            }
            // Reset form with current order data when opening
            form.reset({
                code: order.code,
                supplierId: order.supplierId.toString(),
                totalValue: order.totalValue || "0.00",
                status: order.status,
                observations: order.observations || "",
                expectedDate: order.expectedArrivalDate || undefined,
                requestedBy: order.requestedBy || "",
            })
        }
    }, [isOpen])

    async function onSubmit(data: EditFormValues) {
        setIsLoading(true)
        try {
            const result = await updateOrder(order.id, {
                code: data.code,
                supplierId: parseInt(data.supplierId),
                totalValue: data.totalValue,
                status: data.status,
                observations: data.observations,
                expectedArrivalDate: data.expectedDate || null,
                requestedBy: data.requestedBy,
            })
            if (!result.success) {
                if (result.error === "DUPLICATE_ORDER_CODE") {
                    toast.error("Já existe outro pedido com este número!")
                } else {
                    toast.error("Erro ao atualizar o pedido.")
                }
                return
            }
            toast.success("Pedido atualizado com sucesso!")
            setIsOpen(false)
            router.refresh()
        } catch (error: any) {
            toast.error("Erro ao atualizar o pedido.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Pencil className="h-4 w-4" />
                    Editar Pedido
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar Pedido {order.code}</DialogTitle>
                    <DialogDescription>
                        Altere os campos desejados e clique em salvar.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Código */}
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Código do Pedido</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: 12345" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Fornecedor */}
                            <FormField
                                control={form.control}
                                name="supplierId"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Fornecedor</FormLabel>
                                        <Popover open={supplierOpen} onOpenChange={setSupplierOpen}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className={cn(
                                                            "w-full justify-between font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value
                                                            ? suppliers.find(s => s.id.toString() === field.value)?.name
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
                                                                        setSupplierOpen(false)
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
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Valor */}
                            <FormField
                                control={form.control}
                                name="totalValue"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Valor Total (R$)</FormLabel>
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

                            {/* Status */}
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {statusOptions.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Solicitado por */}
                            <FormField
                                control={form.control}
                                name="requestedBy"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Solicitado por</FormLabel>
                                        <div className="flex gap-2">
                                            {!isCustomRequestor ? (
                                                <Select
                                                    onValueChange={(val) => {
                                                        if (val === "OTHER") {
                                                            setIsCustomRequestor(true)
                                                            field.onChange("")
                                                        } else {
                                                            field.onChange(val)
                                                        }
                                                    }}
                                                    defaultValue={
                                                        predefinedRequestors.includes(field.value || "")
                                                            ? field.value
                                                            : field.value
                                                                ? "OTHER"
                                                                : undefined
                                                    }
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Quem solicitou?" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {predefinedRequestors.map((name) => (
                                                            <SelectItem key={name} value={name}>
                                                                {name}
                                                            </SelectItem>
                                                        ))}
                                                        <SelectItem value="OTHER">Outro (Digitar)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <div className="flex w-full gap-2">
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Digite o nome..."
                                                            {...field}
                                                            value={field.value || ""}
                                                        />
                                                    </FormControl>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            setIsCustomRequestor(false)
                                                            field.onChange("")
                                                        }}
                                                        title="Voltar para lista"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Data prevista */}
                            <FormField
                                control={form.control}
                                name="expectedDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Data Prevista de Chegada</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
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
                                                    selected={field.value || undefined}
                                                    onSelect={field.onChange}
                                                    disabled={(date) => date < new Date("1900-01-01")}
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

                        {/* Observações */}
                        <FormField
                            control={form.control}
                            name="observations"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Observações</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Observações sobre o pedido..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                disabled={isLoading}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Salvando..." : "Salvar Alterações"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
