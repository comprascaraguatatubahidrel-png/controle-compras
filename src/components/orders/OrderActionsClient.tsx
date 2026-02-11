'use client'

import { useState } from "react"
import { Trash2, RotateCcw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteOrder, restoreOrder } from "@/actions/orders"
import { toast } from "sonner"

interface OrderActionsClientProps {
    orderId: number
    orderCode: string
}

export function OrderActionsClient({ orderId, orderCode }: OrderActionsClientProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [isRestoring, setIsRestoring] = useState(false)

    const handleDelete = async () => {
        if (!window.confirm(`Tem certeza que deseja excluir permanentemente o pedido ${orderCode}? Esta ação não pode ser desfeita e removerá todo o histórico. Fazendo isso, você poderá reutilizar este número de pedido.`)) {
            return
        }

        try {
            setIsDeleting(true)
            await deleteOrder(orderId)
            toast.success("Pedido excluído", {
                description: `O pedido ${orderCode} foi excluído permanentemente.`
            })
        } catch (error) {
            toast.error("Erro ao excluir", {
                description: "Ocorreu um erro ao excluir o pedido."
            })
        } finally {
            setIsDeleting(false)
        }
    }

    const handleRestore = async () => {
        try {
            setIsRestoring(true)
            await restoreOrder(orderId)
            toast.success("Pedido restaurado", {
                description: `O pedido ${orderCode} foi restaurado para o status 'Criado'.`
            })
        } catch (error) {
            toast.error("Erro ao restaurar", {
                description: "Ocorreu um erro ao restaurar o pedido."
            })
        } finally {
            setIsRestoring(false)
        }
    }

    return (
        <div className="flex items-center justify-end gap-2">
            <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                onClick={handleRestore}
                disabled={isRestoring || isDeleting}
            >
                {isRestoring ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                    <RotateCcw className="h-3.5 w-3.5" />
                )}
                Restaurar
            </Button>

            <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                onClick={handleDelete}
                disabled={isRestoring || isDeleting}
            >
                {isDeleting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                )}
                Excluir
            </Button>
        </div>
    )
}
