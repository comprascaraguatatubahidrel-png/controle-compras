import { AlertTriangle, Clock } from "lucide-react"

export function RecentAlerts() {
    return (
        <div className="space-y-4">
            <div className="flex items-start gap-4 rounded-md border p-3 border-l-4 border-l-destructive bg-muted/40">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
                <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                        Espelho Atrasado
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Pedido #REQ-005 (Deca) enviado há 3 dias.
                    </p>
                </div>
            </div>
            <div className="flex items-start gap-4 rounded-md border p-3 border-l-4 border-l-yellow-500 bg-muted/40">
                <Clock className="mt-0.5 h-5 w-5 text-yellow-600" />
                <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                        Chegada Prevista Hoje
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Pedido #REQ-002 (Docol).
                    </p>
                </div>
            </div>
            <div className="flex items-start gap-4 rounded-md border p-3 border-l-4 border-l-orange-500 bg-muted/40">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-orange-600" />
                <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                        Saldo Pendente Atrasado
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Pedido #REQ-003 (Tigre) venceu ontem.
                    </p>
                </div>
            </div>
        </div>
    )
}
