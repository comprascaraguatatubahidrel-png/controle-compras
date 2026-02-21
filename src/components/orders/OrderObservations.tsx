"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, Check, X } from "lucide-react"
import { updateOrderObservations } from "@/actions/orders"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface OrderObservationsProps {
    orderId: number
    initialObservations?: string | null
}

export function OrderObservations({ orderId, initialObservations }: OrderObservationsProps) {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [observations, setObservations] = useState(initialObservations || "")
    const [isLoading, setIsLoading] = useState(false)

    const handleSave = async () => {
        setIsLoading(true)
        try {
            await updateOrderObservations(orderId, observations)
            setIsEditing(false)
            toast.success('Observação atualizada!')
            router.refresh()
        } catch (error) {
            console.error("Failed to update observations", error)
            toast.error('Erro ao atualizar observação.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancel = () => {
        setObservations(initialObservations || "")
        setIsEditing(false)
    }

    if (isEditing) {
        return (
            <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between">
                    <p className="font-medium">Observações</p>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={handleCancel} disabled={isLoading} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                            <X className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleSave} disabled={isLoading} className="h-8 w-8 text-muted-foreground hover:text-primary">
                            <Check className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <Textarea
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    placeholder="Adicione uma observação..."
                    className="resize-none min-h-[100px]"
                    disabled={isLoading}
                />
            </div>
        )
    }

    return (
        <div className="group relative pt-2">
            <div className="flex items-center justify-between mb-1">
                <p className="font-medium">Observações</p>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditing(true)}
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Pencil className="h-3 w-3" />
                </Button>
            </div>
            <div
                className={cn(
                    "text-sm text-muted-foreground bg-muted p-3 rounded-md min-h-[60px] whitespace-pre-wrap",
                    !observations && "italic"
                )}
            >
                {observations || "Sem observações."}
            </div>
        </div>
    )
}
