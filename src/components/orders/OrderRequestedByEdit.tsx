"use client"

import { useState } from "react"
import { Check, Pencil, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { updateOrderRequestedBy } from "@/actions/orders"
import { useRouter } from "next/navigation"

interface OrderRequestedByEditProps {
    orderId: number
    initialValue?: string | null
}

export function OrderRequestedByEdit({ orderId, initialValue }: OrderRequestedByEditProps) {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [value, setValue] = useState(initialValue || "")
    const [isCustomRequestor, setIsCustomRequestor] = useState(false)

    // Check if initial value is custom or predefined to set initial state correctly
    const predefinedRequestors = ["Thiago", "Fernando", "Junior", "Marcelo", "Sophia"]
    const isInitiallyCustom = initialValue && !predefinedRequestors.includes(initialValue)

    const handleStartEdit = () => {
        setValue(initialValue || "")
        setIsCustomRequestor(!!isInitiallyCustom)
        setIsEditing(true)
    }

    const handleCancel = () => {
        setIsEditing(false)
        setValue(initialValue || "")
        setIsCustomRequestor(!!isInitiallyCustom)
    }

    const handleSave = async () => {
        if (!value.trim()) {
            toast.error("O nome não pode ser vazio")
            return
        }

        setIsLoading(true)
        try {
            await updateOrderRequestedBy(orderId, value)
            toast.success("Nome atualizado com sucesso!")
            setIsEditing(false)
            router.refresh()
        } catch (error) {
            toast.error("Erro ao atualizar o nome")
        } finally {
            setIsLoading(false)
        }
    }

    if (isEditing) {
        return (
            <div className="flex items-center gap-2">
                {!isCustomRequestor ? (
                    <Select
                        value={predefinedRequestors.includes(value) ? value : 'OTHER'}
                        onValueChange={(val) => {
                            if (val === 'OTHER') {
                                setIsCustomRequestor(true)
                                setValue("")
                            } else {
                                setValue(val)
                            }
                        }}
                    >
                        <SelectTrigger className="h-8 w-[180px]">
                            <SelectValue placeholder="Quem solicitou?" />
                        </SelectTrigger>
                        <SelectContent>
                            {predefinedRequestors.map((name) => (
                                <SelectItem key={name} value={name}>{name}</SelectItem>
                            ))}
                            <SelectItem value="OTHER">Outro (Digitar nome)</SelectItem>
                        </SelectContent>
                    </Select>
                ) : (
                    <div className="flex items-center gap-2">
                        <Input
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="h-8 w-[180px]"
                            placeholder="Digite o nome..."
                            autoFocus
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                                setIsCustomRequestor(false)
                                setValue("")
                            }}
                            title="Voltar para lista"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                <Button size="icon" variant="ghost" onClick={handleSave} disabled={isLoading} className="h-8 w-8">
                    <Check className="h-4 w-4 text-green-500" />
                </Button>
                <Button size="icon" variant="ghost" onClick={handleCancel} disabled={isLoading} className="h-8 w-8">
                    <X className="h-4 w-4 text-red-500" />
                </Button>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2 group">
            <span>{initialValue || "Não informado"}</span>
            <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleStartEdit}
            >
                <Pencil className="h-3 w-3" />
            </Button>
        </div>
    )
}
