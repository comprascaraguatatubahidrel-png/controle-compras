import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertTriangle,
  Clock,
  DollarSign,
  Package,
} from "lucide-react"
import { Overview } from "@/components/dashboard/Overview"
import { RecentAlerts } from "@/components/dashboard/RecentAlerts"
import { db } from "@/db"
import { orders } from "@/db/schema"
import { eq, not, or, and, lt, lte, gte } from "drizzle-orm"
import { startOfDay, endOfDay } from "date-fns"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  // Fetch real data
  const allOrders = await db.query.orders.findMany({
    where: not(eq(orders.status, 'RECEIVED_COMPLETE')),
    with: {
      supplier: true,
    }
  })

  // Calculate Stats
  const totalOpenValue = allOrders.reduce((sum, order) => sum + Number(order.totalValue || 0), 0)

  const noMirrorCount = allOrders.filter(o => o.status === 'SENT').length

  const partialCount = allOrders.filter(o => o.status === 'RECEIVED_PARTIAL').length

  const today = new Date()
  const arrivingTodayCount = allOrders.filter(o => {
    if (!o.expectedArrivalDate) return false
    const expected = new Date(o.expectedArrivalDate)
    return expected >= startOfDay(today) && expected <= endOfDay(today)
  }).length

  const alertsCount = allOrders.filter(o => {
    // Alert 1: Espelho atrasado (SENT > 2 days)
    if (o.status === 'SENT') {
      const twoDaysAgo = new Date()
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
      if (o.sentDate < twoDaysAgo) return true
    }

    // Alert 2 & 3: Delayed arrival or overdue partial
    if (!o.expectedArrivalDate) return false
    return new Date(o.expectedArrivalDate) < startOfDay(today)
  }).length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Dados em Tempo Real v1.2</span>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total em Aberto</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalOpenValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Pedidos não concluídos
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aguar. Espelho</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{noMirrorCount}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando aprovação
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cheg. Hoje</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{arrivingTodayCount}</div>
            <p className="text-xs text-muted-foreground">
              Previsão para hoje
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Pendente</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{partialCount}</div>
            <p className="text-xs text-muted-foreground">
              Recebidos com saldo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section (Active) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Compras por Marca (Últimos 6 meses)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview orders={allOrders} />
          </CardContent>
        </Card>
        <Card className="col-span-3 hover:shadow-md transition-shadow border-l-4 border-l-destructive/50">
          <CardHeader>
            <CardTitle>Alertas Críticos</CardTitle>
            <CardDescription>
              Pedidos precisando de atenção imediata.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentAlerts orders={allOrders} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
