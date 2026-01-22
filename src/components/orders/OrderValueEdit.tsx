"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil, Check, X } from "lucide-react"
import { updateOrderValue } from "@/actions/orders"
import { toast } from "sonner"

interface OrderValueEditProps {
    orderId: number
    initialValue: string
}

export function OrderValueEdit({ orderId, initialValue }: OrderValueEditProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [value, setValue] = useState(initialValue)
    const [isLoading, setIsLoading] = useState(false)

    const handleSave = async () => {
        setIsLoading(true)
        try {
            await updateOrderValue(orderId, value)
            setIsEditing(false)
            toast.success("Valor atualizado com sucesso")
        } catch (error) {
            console.error("Failed to update value", error)
            toast.error("Erro ao atualizar valor")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancel = () => {
        setValue(initialValue)
        setIsEditing(false)
    }

    if (isEditing) {
        return (
            <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">R$</span>
                <Input
                    value={value}
                    onChange={(e) => {
                        // Remove non-digits
                        const rawValue = e.target.value.replace(/\D/g, "")
                        // Convert to decimal (e.g. 1234 -> 12.34)
                        const decimalValue = (parseInt(rawValue) / 100).toFixed(2)
                        setValue(decimalValue)
                    }}
                    className="h-8 w-32"
                    disabled={isLoading}
                    autoFocus
                />
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSave}
                    disabled={isLoading}
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                >
                    <Check className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2 group">
            <span className="font-semibold">R$ {value}</span>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground"
            >
                <Pencil className="h-3 w-3" />
            </Button>
        </div>
    )
}
