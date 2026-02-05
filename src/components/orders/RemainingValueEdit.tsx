"use client"

import { useState, useTransition } from "react"
import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { updateRemainingValue } from "@/actions/partial-receipts"
import { toast } from "sonner"

interface RemainingValueEditProps {
    orderId: number
    initialValue: string | null
}

export function RemainingValueEdit({ orderId, initialValue }: RemainingValueEditProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [value, setValue] = useState(initialValue || "")
    const [isPending, startTransition] = useTransition()

    const handleSave = () => {
        startTransition(async () => {
            try {
                await updateRemainingValue(orderId, value)
                toast.success("Valor do saldo atualizado!")
                setIsOpen(false)
            } catch (error) {
                toast.error("Erro ao atualizar valor")
            }
        })
    }

    const formatCurrency = (val: string) => {
        const rawValue = val.replace(/\D/g, "")
        if (rawValue === "") return ""
        const decimalValue = (parseInt(rawValue) / 100).toFixed(2)
        return decimalValue
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-sm font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700">
                    R$ {initialValue || "0.00"}
                    <Pencil className="h-3 w-3" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Editar Valor do Saldo</DialogTitle>
                    <DialogDescription>
                        Atualize o valor do saldo pendente deste pedido.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Novo Valor (R$)</label>
                        <Input
                            placeholder="Ex: 1500,00"
                            value={value}
                            onChange={(e) => setValue(formatCurrency(e.target.value))}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={isPending}>
                        {isPending ? "Salvando..." : "Salvar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
