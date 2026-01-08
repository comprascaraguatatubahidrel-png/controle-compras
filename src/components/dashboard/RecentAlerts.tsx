import { AlertTriangle, Clock } from "lucide-react"

interface RecentAlertsProps {
    orders: any[]
}

export function RecentAlerts({ orders }: RecentAlertsProps) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const alerts = orders.filter(o => {
        // Delayed arrival
        if (o.expectedArrivalDate && new Date(o.expectedArrivalDate) < today) return true

        // Mirror delayed
        if (o.status === 'SENT') {
            const twoDaysAgo = new Date()
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
            if (new Date(o.sentDate) < twoDaysAgo) return true
        }

        return false
    }).sort((a, b) => Number(b.totalValue || 0) - Number(a.totalValue || 0))

    const arrivingToday = orders.filter(o => {
        if (!o.expectedArrivalDate) return false
        const expected = new Date(o.expectedArrivalDate)
        expected.setHours(0, 0, 0, 0)
        return expected.getTime() === today.getTime()
    })

    if (alerts.length === 0 && arrivingToday.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-4 text-center text-muted-foreground">
                <p>Nenhum alerta para o momento.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {alerts.map((order) => {
                const isMirrorDelay = order.status === 'SENT' && (new Date(order.sentDate) < new Date(Date.now() - 2 * 24 * 60 * 60 * 1000))
                const isPartial = order.status === 'RECEIVED_PARTIAL'

                let title = "Pedido Atrasado"
                if (isMirrorDelay) title = "Espelho Atrasado"
                if (isPartial) title = "Saldo Pendente"

                return (
                    <div key={order.id} className="flex items-start gap-4 rounded-md border p-3 border-l-4 border-l-destructive bg-muted/40">
                        <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">
                                {title}
                            </p>
                            <p className="text-sm text-muted-foreground font-semibold">
                                R$ {order.totalValue}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Pedido #{order.code} ({order.supplier?.brand || "S/M"}).
                            </p>
                        </div>
                    </div>
                )
            })}

            {arrivingToday.map((order) => (
                <div key={order.id} className="flex items-start gap-4 rounded-md border p-3 border-l-4 border-l-yellow-500 bg-muted/40">
                    <Clock className="mt-0.5 h-5 w-5 text-yellow-600" />
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                            Chegada Prevista Hoje
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Pedido #{order.code} ({order.supplier?.brand || "S/M"}).
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}
