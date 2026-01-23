"use client"

import { useState } from "react"
import { CheckCircle, Truck, AlertTriangle, ThumbsUp } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"

interface OrderActionsProps {
    status: "SENT" | "APPROVED" | "MIRROR_ARRIVED" | "WAITING_ARRIVAL" | "RECEIVED_COMPLETE" | "RECEIVED_PARTIAL"
    onStatusChange: (newStatus: any, notes?: string, date?: Date, remainingValue?: string) => void
}

export function OrderActions({ status, onStatusChange }: OrderActionsProps) {
    const [date, setDate] = useState<Date>()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [actionType, setActionType] = useState<"MIRROR" | "RECEIVE" | "PARTIAL" | null>(null)
    const [remainingValue, setRemainingValue] = useState("")

    const handleAction = (type: "MIRROR" | "RECEIVE") => {
        setActionType(type)
        setIsDialogOpen(true)
        setRemainingValue("")
        setDate(undefined)
    }

    const confirmAction = () => {
        if (actionType === "MIRROR") {
            onStatusChange("WAITING_ARRIVAL", "Previsão de chegada definida", date)
        } else if (actionType === "RECEIVE") {
            onStatusChange("RECEIVED_COMPLETE", "Pedido recebido completo")
        } else if (actionType === "PARTIAL") {
            onStatusChange("RECEIVED_PARTIAL", "Recebido com saldo pendente", date, remainingValue)
        }
        setIsDialogOpen(false)
        setDate(undefined)
        setRemainingValue("")
    }

    const handlePartial = () => {
        setActionType("PARTIAL")
    }

    return (
        <div className="flex gap-2">
            {status === "SENT" && (
                <Button onClick={() => handleAction("MIRROR")} variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Aprovar Orçamento
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
                            {actionType === "PARTIAL" && "Informe o valor restante e a nova data prevista."}
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
                        <div className="py-4 space-y-4">
                            {actionType === "PARTIAL" && (
                                <div className="space-y-2">
                                    <span className="text-sm font-medium">Valor do Saldo (R$)</span>
                                    <Input
                                        placeholder="Ex: 1500,00"
                                        value={remainingValue}
                                        onChange={(e) => {
                                            const rawValue = e.target.value.replace(/\D/g, "")
                                            const decimalValue = (parseInt(rawValue) / 100).toFixed(2)
                                            setRemainingValue(decimalValue)
                                        }}
                                    />
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-medium">Data Prevista de Chegada</span>
                                {date && (
                                    <p className="text-sm text-muted-foreground">
                                        Selecionado: {format(date, "PPP", { locale: ptBR })}
                                    </p>
                                )}
                                <div className="flex justify-center border rounded-md p-2">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {actionType !== "RECEIVE" && (
                        <DialogFooter>
                            <Button onClick={confirmAction} disabled={!date || (actionType === "PARTIAL" && !remainingValue)}>
                                Confirmar
                            </Button>
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
