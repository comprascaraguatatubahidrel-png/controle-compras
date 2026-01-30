"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Circle } from "lucide-react"
import { toggleOrderChecked } from "@/actions/orders"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface OrderCheckButtonProps {
    orderId: number
    initialChecked: boolean
}

export function OrderCheckButton({ orderId, initialChecked }: OrderCheckButtonProps) {
    const [checked, setChecked] = useState(initialChecked)
    const [isLoading, setIsLoading] = useState(false)

    const handleToggle = async () => {
        setIsLoading(true)
        try {
            const newState = !checked
            await toggleOrderChecked(orderId, newState)
            setChecked(newState)
            toast.success(newState ? "Pedido marcado como conferido" : "Marcação de conferido removida")
        } catch (error) {
            toast.error("Erro ao atualizar status de conferência")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            disabled={isLoading}
            className={cn(
                "flex items-center gap-2 transition-colors",
                checked ? "text-green-600 hover:text-green-700 hover:bg-green-50" : "text-muted-foreground hover:text-foreground"
            )}
            title={checked ? "Conferido pelo gerente" : "Marcar como conferido"}
        >
            {checked ? (
                <>
                    <CheckCircle className="h-5 w-5 fill-current" />
                    <span className="font-semibold">Conferido</span>
                </>
            ) : (
                <>
                    <Circle className="h-5 w-5" />
                    <span className="text-sm">Conferir</span>
                </>
            )}
        </Button>
    )
}
