"use client"

import { ThumbsUp, Truck, MoreHorizontal } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { updateOrderStatus } from "@/actions/orders"
import Link from "next/link"

interface QuickActionsProps {
    order: {
        id: number
        code: string
        status: string
    }
}

export function QuickActions({ order }: QuickActionsProps) {
    const router = useRouter()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [date, setDate] = useState<Date>()
    const [isLoading, setIsLoading] = useState(false)

    const handleApprove = () => {
        setIsDialogOpen(true)
    }

    const confirmApprove = async () => {
        if (!date) return
        setIsLoading(true)
        try {
            await updateOrderStatus(order.id, "WAITING_ARRIVAL", "Orçamento aprovado via ação rápida", date)
            toast.success(`Pedido ${order.code} aprovado!`)
            setIsDialogOpen(false)
            router.refresh()
        } catch (error) {
            toast.error('Erro ao aprovar pedido.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleReceive = async () => {
        setIsLoading(true)
        try {
            await updateOrderStatus(order.id, "RECEIVED_COMPLETE", "Recebido via ação rápida")
            toast.success(`Pedido ${order.code} recebido!`)
            router.refresh()
        } catch (error) {
            toast.error('Erro ao receber pedido.')
        } finally {
            setIsLoading(false)
        }
    }

    const showApproveButton = order.status === "SENT"
    const showReceiveButton = order.status === "WAITING_ARRIVAL" || order.status === "RECEIVED_PARTIAL"

    return (
        <div className="flex items-center gap-1 justify-end">
            {showApproveButton && (
                <Button
                    size="sm"
                    variant="outline"
                    className="h-8 border-green-500/50 text-green-600 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950/20"
                    onClick={handleApprove}
                    disabled={isLoading}
                >
                    <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                    Aprovar
                </Button>
            )}

            {showReceiveButton && (
                <Button
                    size="sm"
                    variant="outline"
                    className="h-8 border-blue-500/50 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/20"
                    onClick={handleReceive}
                    disabled={isLoading}
                >
                    <Truck className="h-3.5 w-3.5 mr-1" />
                    Receber
                </Button>
            )}

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                        <Link href={`/orders/${order.id}`}>Ver Detalhes</Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Aprovar Orçamento</DialogTitle>
                        <DialogDescription>
                            Selecione a data prevista de chegada para o pedido {order.code}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {date && (
                            <p className="text-sm text-muted-foreground mb-2">
                                Selecionado: {format(date, "PPP", { locale: ptBR })}
                            </p>
                        )}
                        <div className="flex justify-center border rounded-md p-2">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                                locale={ptBR}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={confirmApprove} disabled={!date || isLoading}>
                            {isLoading ? "Salvando..." : "Confirmar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
