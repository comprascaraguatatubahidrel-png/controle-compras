"use client"

import { useState } from "react"
import { CheckCircle, Truck, AlertTriangle, ThumbsUp, CalendarClock } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"

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
    onStatusChange: (newStatus: any, notes?: string, date?: Date, remainingValue?: string, partialReason?: string) => void
}

export function OrderActions({ status, onStatusChange }: OrderActionsProps) {
    const [date, setDate] = useState<Date>()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [actionType, setActionType] = useState<"MIRROR" | "RECEIVE" | "PARTIAL" | "EXTEND" | null>(null)
    const [remainingValue, setRemainingValue] = useState("")
    const [partialReason, setPartialReason] = useState("")

    const reasonOptions = [
        "Produto em falta no fornecedor",
        "Entrega dividida por volume",
        "Problema na logística",
        "Produção atrasada",
        "Divergência na quantidade",
        "Outro"
    ]

    const handleAction = (type: "MIRROR" | "RECEIVE" | "EXTEND") => {
        setActionType(type)
        setIsDialogOpen(true)
        setRemainingValue("")
        setPartialReason("")
        setDate(undefined)
    }

    const confirmAction = () => {
        if (actionType === "MIRROR") {
            onStatusChange("WAITING_ARRIVAL", "Previsão de chegada definida", date)
            toast.success('Orçamento aprovado! Aguardando chegada.')
        } else if (actionType === "RECEIVE") {
            onStatusChange("RECEIVED_COMPLETE", "Pedido recebido completo")
            toast.success('Pedido recebido com sucesso!')
        } else if (actionType === "PARTIAL") {
            onStatusChange("RECEIVED_PARTIAL", "Recebido com saldo pendente", date, remainingValue, partialReason)
            toast.success('Pedido registrado com saldo pendente.')
        } else if (actionType === "EXTEND") {
            let note = ""
            if (status === "SENT") {
                note = "Prazo de retorno do espelho estendido"
            } else if (status === "WAITING_ARRIVAL") {
                note = "Previsão de chegada reagendada"
            }
            // Keep the same status, just update specific fields
            onStatusChange(status, note, date)
            toast.success('Prazo estendido com sucesso!')
        }
        setIsDialogOpen(false)
        setDate(undefined)
        setRemainingValue("")
        setPartialReason("")
    }

    const handlePartial = () => {
        setActionType("PARTIAL")
    }

    return (
        <div className="flex flex-wrap gap-2">
            {status === "SENT" && (
                <>
                    <Button onClick={() => handleAction("MIRROR")} variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                        <ThumbsUp className="mr-2 h-4 w-4" />
                        Aprovar Orçamento
                    </Button>
                    <Button onClick={() => handleAction("EXTEND")} variant="ghost" className="text-muted-foreground hover:text-primary">
                        <CalendarClock className="mr-2 h-4 w-4" />
                        Estender Prazo
                    </Button>
                </>
            )}

            {(status === "WAITING_ARRIVAL" || status === "RECEIVED_PARTIAL") && (
                <>
                    <Button onClick={() => handleAction("RECEIVE")}>
                        <Truck className="mr-2 h-4 w-4" />
                        Receber Pedido
                    </Button>
                    {status === "WAITING_ARRIVAL" && (
                        <Button onClick={() => handleAction("EXTEND")} variant="ghost" className="text-muted-foreground hover:text-primary">
                            <CalendarClock className="mr-2 h-4 w-4" />
                            Estender Prazo
                        </Button>
                    )}
                </>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === "MIRROR" && "Confirmar Espelho"}
                            {actionType === "RECEIVE" && "Recebimento do Pedido"}
                            {actionType === "PARTIAL" && "Saldo Pendente"}
                            {actionType === "EXTEND" && "Estender Prazo"}
                        </DialogTitle>
                        <DialogDescription>
                            {actionType === "MIRROR" && "Informe a data prevista de chegada combinada com o fornecedor."}
                            {actionType === "RECEIVE" && "O pedido chegou completo ou ficou algum saldo pendente?"}
                            {actionType === "PARTIAL" && "Informe o valor restante e a nova data prevista."}
                            {actionType === "EXTEND" && "Informe a nova data prevista."}
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
                        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {actionType === "PARTIAL" && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">Valor do Saldo (R$)</span>
                                            <span className="text-[10px] text-muted-foreground uppercase bg-muted px-1.5 py-0.5 rounded">Opcional</span>
                                        </div>
                                        <Input
                                            placeholder="Ex: 1500,00"
                                            value={remainingValue}
                                            onChange={(e) => {
                                                const val = e.target.value
                                                if (val === "") {
                                                    setRemainingValue("")
                                                    return
                                                }
                                                const rawValue = val.replace(/\D/g, "")
                                                if (rawValue === "") {
                                                    setRemainingValue("")
                                                    return
                                                }
                                                const decimalValue = (parseInt(rawValue) / 100).toFixed(2)
                                                setRemainingValue(decimalValue)
                                            }}
                                        />
                                        <p className="text-[11px] text-muted-foreground italic">
                                            Pode deixar em branco se não souber o valor exato agora.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">Motivo do Saldo</span>
                                            <span className="text-[10px] text-muted-foreground uppercase bg-muted px-1.5 py-0.5 rounded">Opcional</span>
                                        </div>
                                        <select
                                            value={partialReason}
                                            onChange={(e) => setPartialReason(e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        >
                                            <option value="">Selecione o motivo...</option>
                                            {reasonOptions.map((reason) => (
                                                <option key={reason} value={reason}>{reason}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-medium">
                                    {actionType === "MIRROR" ? "Data Prevista de Chegada" : "Nova Data Prevista"}
                                </span>
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
                                        locale={ptBR}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {actionType !== "RECEIVE" && (
                        <DialogFooter>
                            <Button onClick={confirmAction} disabled={!date}>
                                Confirmar
                            </Button>
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
