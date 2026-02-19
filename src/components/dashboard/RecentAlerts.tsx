import { AlertTriangle, ArrowRight, Clock } from "lucide-react"
import Link from "next/link"

interface RecentAlertsProps {
    orders: any[]
}

export function RecentAlerts({ orders }: RecentAlertsProps) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const alerts = orders.filter(o => {
        // Skip finalized orders — never show as alerts
        if (o.status === 'RECEIVED_COMPLETE' || o.status === 'CANCELLED') return false

        // Delayed arrival
        if (o.expectedArrivalDate && new Date(o.expectedArrivalDate) < today) return true

        // Mirror delayed
        if (o.status === 'SENT') {
            const threeDaysAgo = new Date()
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
            if (new Date(o.sentDate) < threeDaysAgo) return true
        }

        return false
    }).sort((a, b) => Number(b.totalValue || 0) - Number(a.totalValue || 0))

    const arrivingToday = orders.filter(o => {
        if (o.status === 'RECEIVED_COMPLETE' || o.status === 'CANCELLED') return false
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
        <div className="space-y-3">
            {alerts.map((order) => {
                const isMirrorDelay = order.status === 'SENT' && (new Date(order.sentDate) < new Date(Date.now() - 3 * 24 * 60 * 60 * 1000))
                const isPartial = order.status === 'RECEIVED_PARTIAL'

                let title = "Pedido Atrasado"
                let actionText = "Estender Prazo"
                if (isMirrorDelay) {
                    title = "Espelho Atrasado"
                    actionText = "Aprovar Orçamento"
                }
                if (isPartial) {
                    title = "Saldo Pendente"
                    actionText = "Ver Pedido"
                }

                return (
                    <Link
                        key={order.id}
                        href={`/orders/${order.id}`}
                        className="group flex items-center gap-4 rounded-lg border p-3 border-l-4 border-l-red-500 bg-red-50/50 hover:bg-red-50 dark:bg-red-950/10 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                    >
                        <div className="h-9 w-9 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-full flex items-center justify-center shrink-0">
                            <AlertTriangle className="h-4 w-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col gap-0.5 mb-1.5">
                                <p className="text-sm font-bold text-red-900 dark:text-red-200 truncate leading-none">
                                    {order.supplier?.brand || order.supplier?.name || "Fornecedor S/M"}
                                </p>
                                <p className="text-xs font-semibold text-red-700 dark:text-red-400">
                                    Pedido {order.code}
                                </p>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                                    <span className="text-xs font-medium text-foreground/80 tracking-tight truncate">
                                        {title}
                                    </span>
                                </div>
                                <span className="text-xs font-medium text-red-600 dark:text-red-400 whitespace-nowrap bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded-full">
                                    R$ {order.totalValue}
                                </span>
                            </div>
                        </div>

                        <ArrowRight className="h-4 w-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
                    </Link>
                )
            })}

            {arrivingToday.map((order) => (
                <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="group flex items-center gap-4 rounded-lg border p-3 border-l-4 border-l-yellow-500 bg-yellow-50/50 hover:bg-yellow-50 dark:bg-yellow-950/10 dark:hover:bg-yellow-950/20 transition-all cursor-pointer"
                >
                    <div className="h-9 w-9 bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full flex items-center justify-center shrink-0">
                        <Clock className="h-4 w-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-0.5 mb-1.5">
                            <p className="text-sm font-bold text-yellow-900 dark:text-yellow-200 truncate leading-none">
                                {order.supplier?.brand || order.supplier?.name || "Fornecedor S/M"}
                            </p>
                            <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400">
                                Pedido {order.code}
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                            <span className="text-xs font-medium text-foreground/80 tracking-tight truncate">
                                Chegada Hoje
                            </span>
                        </div>
                    </div>

                    <ArrowRight className="h-4 w-4 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
                </Link>
            ))}
        </div>
    )
}
