import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, ShoppingCart, TrendingUp, Calendar } from "lucide-react"
import { db } from "@/db"
import { orders } from "@/db/schema"
import { not, eq, desc } from "drizzle-orm"
import { startOfMonth, format, subMonths } from "date-fns"
import { ptBR } from "date-fns/locale"
import { MonthlySpendChart } from "@/components/analytics/MonthlySpendChart"
import { TopSuppliersChart } from "@/components/analytics/TopSuppliersChart"
import { StatusDistributionChart } from "@/components/analytics/StatusDistributionChart"

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
    // 1. Fetch Data
    const allOrders = await db.query.orders.findMany({
        where: not(eq(orders.status, 'CANCELLED')),
        with: {
            supplier: true,
        },
        orderBy: [desc(orders.sentDate)]
    })

    // 2. Calculate KPI Metrics
    const totalSpent = allOrders.reduce((sum, order) => sum + Number(order.totalValue || 0), 0)
    const totalOrders = allOrders.length
    const averageTicket = totalOrders > 0 ? totalSpent / totalOrders : 0

    // 3. Prepare Chart Data

    // A. Monthly Spend (Last 12 Months)
    // Initialize map with last 12 months
    const monthlyDataMap = new Map<string, number>()
    const today = new Date()
    for (let i = 11; i >= 0; i--) {
        const d = subMonths(today, i)
        const key = format(d, 'MMM/yy', { locale: ptBR })
        monthlyDataMap.set(key, 0)
    }

    // Aggregate
    allOrders.forEach(order => {
        // Use sentDate or createdAt. Assuming sentDate is reliable for financial tracking as per user flow.
        const date = order.sentDate ? new Date(order.sentDate) : new Date(order.createdAt)
        const key = format(date, 'MMM/yy', { locale: ptBR })

        // Only count if it falls within our tracked months (it should if logic is correct, but safe to check)
        if (monthlyDataMap.has(key)) {
            monthlyDataMap.set(key, (monthlyDataMap.get(key) || 0) + Number(order.totalValue || 0))
        }
    })

    const monthlySpendData = Array.from(monthlyDataMap.entries()).map(([month, total]) => ({
        month: month.charAt(0).toUpperCase() + month.slice(1), // Capitalize
        total
    }))

    // B. Top Suppliers
    const supplierMap = new Map<string, number>()
    allOrders.forEach(order => {
        const name = order.supplier.name
        supplierMap.set(name, (supplierMap.get(name) || 0) + Number(order.totalValue || 0))
    })

    const topSuppliersData = Array.from(supplierMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)

    // C. Status Distribution
    const statusMap = new Map<string, number>()
    const statusColors: Record<string, string> = {
        CREATED: '#94a3b8',       // gray-400
        SENT: '#3b82f6',          // blue-500
        APPROVED: '#a855f7',      // purple-500
        MIRROR_ARRIVED: '#f59e0b', // amber-500
        WAITING_ARRIVAL: '#eab308', // yellow-500
        RECEIVED_COMPLETE: '#10b981', // emerald-500
        RECEIVED_PARTIAL: '#ef4444', // red-500
        PENDING_ISSUE: '#f43f5e',   // rose-500
        CANCELLED: '#64748b'        // slate-500
    }

    // Friendly labels
    const statusLabels: Record<string, string> = {
        CREATED: 'Aguardando Envio',
        SENT: 'Enviado',
        APPROVED: 'Aprovado',
        MIRROR_ARRIVED: 'Espelho Chegou',
        WAITING_ARRIVAL: 'Em Trânsito',
        RECEIVED_COMPLETE: 'Recebido',
        RECEIVED_PARTIAL: 'Parcial',
        PENDING_ISSUE: 'Pendência',
        CANCELLED: 'Cancelado'
    }

    allOrders.forEach(order => {
        const status = order.status
        statusMap.set(status, (statusMap.get(status) || 0) + 1)
    })

    const statusDistributionData = Array.from(statusMap.entries()).map(([status, value]) => ({
        name: statusLabels[status] || status,
        value,
        color: statusColors[status] || '#cbd5e1'
    })).filter(item => item.value > 0)


    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    Relatórios e Métricas
                </h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Últimos 12 meses</span>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Comprado</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSpent)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Volume total transacionado
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalOrders}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Pedidos realizados no período
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(averageTicket)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Média de valor por pedido
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-7">
                <MonthlySpendChart data={monthlySpendData} />
                <TopSuppliersChart data={topSuppliersData} />
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                <div className="col-span-3"> {/* Spacer or another chart could go here */}
                    <StatusDistributionChart data={statusDistributionData} />
                </div>
                {/* Future Chart */}
            </div>
        </div>
    )
}
