'use client'

import { useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cancelOrder } from "@/actions/orders"
import { toast } from "sonner"
import { FileX } from "lucide-react"

export function OrderCancelButton({ orderId }: { orderId: number }) {
    const [open, setOpen] = useState(false)
    const [reason, setReason] = useState("")
    const [cancelledBy, setCancelledBy] = useState("")
    const [loading, setLoading] = useState(false)

    const handleCancel = async () => {
        if (!reason || !cancelledBy) {
            toast.error("Preencha todos os campos")
            return
        }

        try {
            setLoading(true)
            await cancelOrder(orderId, reason, cancelledBy)
            toast.success("Pedido cancelado com sucesso")
            setOpen(false)
        } catch (error) {
            toast.error("Erro ao cancelar pedido")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive">
                    <FileX className="mr-2 h-4 w-4" />
                    Cancelar
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Cancelar Pedido</DialogTitle>
                    <DialogDescription>
                        Tem certeza que deseja cancelar este pedido? Esta ação não pode ser desfeita.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="cancelledBy">Cancelado por</Label>
                        <Input
                            id="cancelledBy"
                            value={cancelledBy}
                            onChange={(e) => setCancelledBy(e.target.value)}
                            placeholder="Seu nome"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="reason">Motivo do Cancelamento</Label>
                        <Textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Descreva o motivo..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        Voltar
                    </Button>
                    <Button variant="destructive" onClick={handleCancel} disabled={loading}>
                        {loading ? "Cancelando..." : "Confirmar Cancelamento"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
