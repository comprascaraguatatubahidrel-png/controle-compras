"use client"

import { useState, useTransition } from "react"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { closeBalance } from "@/actions/partial-receipts"
import { toast } from "sonner"

interface CloseBalanceModalProps {
    orderId: number
    remainingValue: string | null
}

export function CloseBalanceModal({ orderId, remainingValue }: CloseBalanceModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [notes, setNotes] = useState("")
    const [isPending, startTransition] = useTransition()

    const handleClose = () => {
        startTransition(async () => {
            try {
                await closeBalance(orderId, notes || undefined)
                toast.success("Saldo fechado! Pedido marcado como completo.")
                setIsOpen(false)
            } catch (error) {
                toast.error("Erro ao fechar saldo")
            }
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Fechar Saldo
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>Fechar Saldo Pendente</DialogTitle>
                    <DialogDescription>
                        Confirme que o saldo de R$ {remainingValue || "0.00"} foi recebido.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-900">
                        <p className="text-sm text-emerald-700 dark:text-emerald-400">
                            Ao confirmar, o pedido será marcado como <strong>Recebido Completo</strong> e o saldo pendente será zerado.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Observações (opcional)</label>
                        <Textarea
                            placeholder="Ex: Recebido conforme acordado, nota fiscal 12345..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleClose} disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700">
                        {isPending ? "Processando..." : "Confirmar Recebimento"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
