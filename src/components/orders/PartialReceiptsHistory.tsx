"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Clock, User } from "lucide-react"

interface PartialReceipt {
    id: number
    receivedValue: string
    remainingValueAfter: string
    receivedDate: Date
    receivedBy: string | null
    notes: string | null
}

interface PartialReceiptsHistoryProps {
    receipts: PartialReceipt[]
}

export function PartialReceiptsHistory({ receipts }: PartialReceiptsHistoryProps) {
    if (receipts.length === 0) {
        return (
            <p className="text-sm text-muted-foreground italic">
                Nenhum recebimento parcial registrado.
            </p>
        )
    }

    return (
        <div className="space-y-4">
            {receipts.map((receipt, index) => (
                <div
                    key={receipt.id}
                    className="relative pl-6 pb-4 border-l-2 border-amber-300 dark:border-amber-700 last:pb-0"
                >
                    <span className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-amber-500 dark:bg-amber-600" />

                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                                Recebido: R$ {receipt.receivedValue}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(receipt.receivedDate), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </span>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            Saldo restante após: R$ {receipt.remainingValueAfter}
                        </p>

                        {receipt.receivedBy && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <User className="h-3 w-3" />
                                Registrado por: {receipt.receivedBy}
                            </p>
                        )}

                        {receipt.notes && (
                            <p className="text-sm text-muted-foreground bg-muted/50 rounded px-2 py-1 mt-2">
                                {receipt.notes}
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
