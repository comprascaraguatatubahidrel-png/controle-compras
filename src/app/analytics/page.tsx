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
import { TopRequestorsChart } from "@/components/analytics/TopRequestorsChart"
import { ReceiptEfficiencyChart } from "@/components/analytics/ReceiptEfficiencyChart"

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

    // A. Monthly Spend & Volume (Last 12 Months)
    // Initialize map with last 12 months
    const monthlyDataMap = new Map<string, { total: number; count: number }>()
    const today = new Date()
    for (let i = 11; i >= 0; i--) {
        const d = subMonths(today, i)
        const key = format(d, 'MMM/yy', { locale: ptBR })
        monthlyDataMap.set(key, { total: 0, count: 0 })
    }

    // Aggregate
    allOrders.forEach(order => {
        const date = new Date(order.sentDate)
        const key = format(date, 'MMM/yy', { locale: ptBR })

        if (monthlyDataMap.has(key)) {
            const current = monthlyDataMap.get(key)!
            monthlyDataMap.set(key, {
                total: current.total + Number(order.totalValue || 0),
                count: current.count + 1
            })
        }
    })

    const monthlySpendData = Array.from(monthlyDataMap.entries()).map(([month, data]) => ({
        month: month.charAt(0).toUpperCase() + month.slice(1), // Capitalize
        total: data.total,
        count: data.count
    }))

    // B. Top Suppliers & Requestors
    const supplierMap = new Map<string, number>()
    const requestorMap = new Map<string, number>()

    allOrders.forEach(order => {
        // Supplier aggregation
        const supplierName = order.supplier.name
        supplierMap.set(supplierName, (supplierMap.get(supplierName) || 0) + Number(order.totalValue || 0))

        // Requestor aggregation
        const requestorName = order.requestedBy || 'Não Identificado'
        requestorMap.set(requestorName, (requestorMap.get(requestorName) || 0) + 1)
    })

    const topSuppliersData = Array.from(supplierMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 15)

    const topRequestorsData = Array.from(requestorMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10)

    // C. Receipt Efficiency (Complete vs Partial vs Pending)
    const efficiencyData = [
        { name: 'Recebido Total', value: 0, color: '#10b981' }, // RECEIVED_COMPLETE
        { name: 'Recebido Parcial', value: 0, color: '#ef4444' }, // RECEIVED_PARTIAL
        { name: 'Em Aberto/Pendência', value: 0, color: '#f59e0b' } // Others like WAITING_ARRIVAL, PENDING_ISSUE
    ]

    allOrders.forEach(order => {
        if (order.status === 'RECEIVED_COMPLETE') {
            efficiencyData[0].value++
        } else if (order.status === 'RECEIVED_PARTIAL') {
            efficiencyData[1].value++
        } else if (['WAITING_ARRIVAL', 'PENDING_ISSUE', 'MIRROR_ARRIVED', 'APPROVED'].includes(order.status)) {
            efficiencyData[2].value++
        }
    })

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-xl font-semibold md:text-2xl flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    Relatórios e Métricas
                </h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-md w-fit">
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
            <div className="grid gap-4 grid-cols-1 md:grid-cols-7">
                <MonthlySpendChart data={monthlySpendData} />
                <TopSuppliersChart data={topSuppliersData} />
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-7">
                <ReceiptEfficiencyChart data={efficiencyData} />
                <StatusDistributionChart data={statusDistributionData} />
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-7">
                <TopRequestorsChart data={topRequestorsData} />
                <div className="col-span-1 md:col-span-4 bg-muted/20 rounded-lg flex items-center justify-center border border-dashed p-8">
                    <p className="text-muted-foreground text-sm">Próximos indicadores em breve...</p>
                </div>
            </div>
        </div>
    )
}
