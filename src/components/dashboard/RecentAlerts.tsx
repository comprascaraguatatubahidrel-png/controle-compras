import { AlertTriangle, Clock } from "lucide-react"

interface RecentAlertsProps {
    orders: any[]
}

export function RecentAlerts({ orders }: RecentAlertsProps) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const alerts = orders.filter(o => {
        if (!o.expectedArrivalDate) return false
        const expected = new Date(o.expectedArrivalDate)
        return expected < today
    }).slice(0, 5)

    const arrivingToday = orders.filter(o => {
        if (!o.expectedArrivalDate) return false
        const expected = new Date(o.expectedArrivalDate)
        expected.setHours(0, 0, 0, 0)
        return expected.getTime() === today.getTime()
    }).slice(0, 5)

    if (alerts.length === 0 && arrivingToday.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-4 text-center text-muted-foreground">
                <p>Nenhum alerta para o momento.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {alerts.map((order) => (
                <div key={order.id} className="flex items-start gap-4 rounded-md border p-3 border-l-4 border-l-destructive bg-muted/40">
                    <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                            Pedido Atrasado
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Pedido #{order.code} ({order.supplier?.brand || "S/M"}).
                        </p>
                    </div>
                </div>
            ))}

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
