"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { updateOrderStatus } from "@/actions/orders"
import { toast } from "sonner"

interface OrderCreatedModalProps {
    orderId: number
    status: string
}

export function OrderCreatedModal({ orderId, status }: OrderCreatedModalProps) {
    const [open, setOpen] = useState(false)
    const router = useRouter()

    useEffect(() => {
        // Only show if status is explicitly CREATED (Pedido Criado)
        // Don't show for FEEDING orders
        if (status === 'CREATED') {
            setOpen(true)
        }
    }, [status])

    const handleYes = async () => {
        try {
            await updateOrderStatus(orderId, 'SENT')
            toast.success("Status atualizado para Enviado ao Fornecedor")
            setOpen(false)
            router.refresh()
        } catch (error) {
            toast.error("Erro ao atualizar status")
            console.error(error)
        }
    }

    const handleNo = () => {
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Pedido Criado</DialogTitle>
                    <DialogDescription>
                        O orçamento já foi enviado ao fornecedor?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex gap-2 sm:gap-0">
                    <Button variant="outline" onClick={handleNo}>
                        Não (Manter como Aguardando Envio)
                    </Button>
                    <Button onClick={handleYes}>
                        Sim (Marcar como Enviado)
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
