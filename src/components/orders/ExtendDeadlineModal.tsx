"use client"

import { useState, useTransition } from "react"
import { CalendarClock } from "lucide-react"
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
import { updateOrderExpectedDate } from "@/actions/orders"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ExtendDeadlineModalProps {
    orderId: number
    currentDate: string | null
}

export function ExtendDeadlineModal({ orderId, currentDate }: ExtendDeadlineModalProps) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [newDate, setNewDate] = useState("")
    const [isPending, startTransition] = useTransition()

    const handleExtend = () => {
        if (!newDate) {
            toast.error("Selecione uma nova data")
            return
        }

        startTransition(async () => {
            try {
                // Parse the date at noon to avoid timezone issues
                const [year, month, day] = newDate.split("-").map(Number)
                const dateObj = new Date(year, month - 1, day, 12, 0, 0)
                await updateOrderExpectedDate(orderId, dateObj)
                toast.success("Prazo estendido com sucesso!")
                setIsOpen(false)
                setNewDate("")
                router.refresh()
            } catch (error) {
                toast.error("Erro ao estender prazo")
            }
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <CalendarClock className="h-4 w-4" />
                    Estender Prazo
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Estender Prazo</DialogTitle>
                    <DialogDescription>
                        {currentDate
                            ? `Data prevista atual: ${currentDate}`
                            : "Nenhuma data prevista definida"}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                            Selecione a nova data prevista para o recebimento do saldo pendente.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nova Data Prevista</label>
                        <Input
                            type="date"
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleExtend} disabled={isPending || !newDate}>
                        {isPending ? "Processando..." : "Confirmar Nova Data"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
