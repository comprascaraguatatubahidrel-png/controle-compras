"use client"

import { useState } from "react"
import { Calendar as CalendarIcon, CheckCircle, Truck, AlertTriangle, ThumbsUp, FileCheck } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface OrderActionsProps {
    status: "SENT" | "APPROVED" | "MIRROR_ARRIVED" | "WAITING_ARRIVAL" | "RECEIVED_COMPLETE" | "RECEIVED_PARTIAL"
    onStatusChange: (newStatus: any, notes?: string, date?: Date) => void
}

export function OrderActions({ status, onStatusChange }: OrderActionsProps) {
    const [date, setDate] = useState<Date>()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [actionType, setActionType] = useState<"MIRROR" | "RECEIVE" | "PARTIAL" | null>(null)

    const handleAction = (type: "MIRROR" | "RECEIVE") => {
        setActionType(type)
        setIsDialogOpen(true)
    }

    const confirmAction = () => {
        if (actionType === "MIRROR") {
            onStatusChange("WAITING_ARRIVAL", "Previsão de chegada definida", date)
        } else if (actionType === "RECEIVE") {
            onStatusChange("RECEIVED_COMPLETE", "Pedido recebido completo")
        } else if (actionType === "PARTIAL") {
            onStatusChange("RECEIVED_PARTIAL", "Recebido com saldo pendente", date)
        }
        setIsDialogOpen(false)
        setDate(undefined)
    }

    const handlePartial = () => {
        setActionType("PARTIAL")
    }

    return (
        <div className="flex gap-2">
            {status === "SENT" && (
                <Button onClick={() => onStatusChange("APPROVED", "Pedido aprovado")} variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Aprovar Pedido
                </Button>
            )}

            {status === "APPROVED" && (
                <Button onClick={() => onStatusChange("MIRROR_ARRIVED", "Espelho do cliente chegou")} variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                    <FileCheck className="mr-2 h-4 w-4" />
                    Espelho do Cliente Chegou
                </Button>
            )}

            {status === "MIRROR_ARRIVED" && (
                <Button onClick={() => handleAction("MIRROR")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Informar Previsão
                </Button>
            )}

            {(status === "WAITING_ARRIVAL" || status === "RECEIVED_PARTIAL") && (
                <Button onClick={() => handleAction("RECEIVE")}>
                    <Truck className="mr-2 h-4 w-4" />
                    Receber Pedido
                </Button>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === "MIRROR" && "Confirmar Espelho"}
                            {actionType === "RECEIVE" && "Recebimento do Pedido"}
                            {actionType === "PARTIAL" && "Saldo Pendente"}
                        </DialogTitle>
                        <DialogDescription>
                            {actionType === "MIRROR" && "Informe a data prevista de chegada combinada com o fornecedor."}
                            {actionType === "RECEIVE" && "O pedido chegou completo ou ficou algum saldo pendente?"}
                            {actionType === "PARTIAL" && "Informe a nova data prevista para o saldo restante."}
                        </DialogDescription>
                    </DialogHeader>

                    {actionType === "RECEIVE" ? (
                        <div className="flex flex-col gap-4 py-4">
                            <Button onClick={confirmAction} className="w-full">
                                <CheckCircle className="mr-2 h-4 w-4" /> Sim, Veio Completo
                            </Button>
                            <Button variant="secondary" onClick={handlePartial} className="w-full">
                                <AlertTriangle className="mr-2 h-4 w-4" /> Não, Ficou Saldo
                            </Button>
                        </div>
                    ) : (
                        <div className="py-4">
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-medium">Data Prevista</span>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[240px] justify-start text-left font-normal",
                                                !date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    )}

                    {actionType !== "RECEIVE" && (
                        <DialogFooter>
                            <Button onClick={confirmAction} disabled={!date}>Confirmar</Button>
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
