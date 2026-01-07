"use client"

import { useState } from "react"
import { Calendar as CalendarIcon, CheckCircle, Truck, AlertTriangle } from "lucide-react"
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
    status: "SENT" | "WAITING_ARRIVAL" | "RECEIVED_COMPLETE" | "RECEIVED_PARTIAL"
    onStatusChange: (newStatus: string) => void
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
        // Mock logic
        if (actionType === "MIRROR") {
            console.log("Mirror confirmed with date:", date)
            onStatusChange("WAITING_ARRIVAL")
        } else if (actionType === "RECEIVE") {
            // Logic for complete
            console.log("Received Complete")
            onStatusChange("RECEIVED_COMPLETE")
        } else if (actionType === "PARTIAL") {
            console.log("Received Partial, new date:", date)
            onStatusChange("RECEIVED_PARTIAL") // Or waiting arrival again? 
            // System definition: "Se ficou saldo -> Recebido com Saldo -> Campo obrigatório: Nova data -> Status muda auto para Aguardando Chegada"
        }
        setIsDialogOpen(false)
    }

    const handlePartial = () => {
        setActionType("PARTIAL")
        // Dialog remains open but content changes or we open a new one. 
        // For simplicity, let's switch to partial input in the same dialog or separate flow.
        // Re-using dialog state effectively.
    }

    return (
        <div className="flex gap-2">
            {status === "SENT" && (
                <Button onClick={() => handleAction("MIRROR")}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Espelho Recebido
                </Button>
            )}

            {(status === "WAITING_ARRIVAL" || status === "RECEIVED_PARTIAL") && ( // RECEIVED_PARTIAL logic might be different if it loops back to WAITING
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
