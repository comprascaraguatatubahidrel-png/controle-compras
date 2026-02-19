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
  Layers,
} from "lucide-react"
import { RecentAlerts } from "@/components/dashboard/RecentAlerts"
import { TopSuppliers } from "@/components/dashboard/TopSuppliers"
import { db } from "@/db"
import { orders } from "@/db/schema"
import { eq, not, or, and, lt, lte, gte } from "drizzle-orm"
import { startOfDay, endOfDay } from "date-fns"
import Link from "next/link"
import { auth } from "@/auth"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  // Fetch real data
  const allOrders = await db.query.orders.findMany({
    with: {
      supplier: true,
    }
  })

  // Calculate Stats
  const totalOpenValue = allOrders
    .filter(o => o.status !== 'CANCELLED')
    .reduce((sum, order) => sum + Number(order.totalValue || 0), 0)

  // Status Counts
  const feedingCount = allOrders.filter(o => o.status === 'FEEDING').length
  const createdCount = allOrders.filter(o => o.status === 'CREATED').length
  const noMirrorCount = allOrders.filter(o => o.status === 'SENT').length
  const partialCount = allOrders.filter(o => o.status === 'RECEIVED_PARTIAL').length

  const today = new Date()
  const arrivingTodayCount = allOrders.filter(o => {
    if (!o.expectedArrivalDate) return false
    const expected = new Date(o.expectedArrivalDate)
    return expected >= startOfDay(today) && expected <= endOfDay(today)
  }).length

  const alertsCount = allOrders.filter(o => {
    // Skip finalized orders
    if (o.status === 'RECEIVED_COMPLETE' || o.status === 'CANCELLED') return false

    // Alert 1: Espelho atrasado (SENT > 3 days)
    if (o.status === 'SENT') {
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
      if (o.sentDate < threeDaysAgo) return true
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
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-5">
        {/* REPLACED: Total Open -> Waiting Shipment */}
        <Link href="/waiting-shipment" className="block group">
          <Card className="hover:shadow-lg transition-all duration-300 hover:border-gray-500/50 cursor-pointer overflow-hidden relative border-l-4 border-l-gray-500 bg-gradient-to-br from-white to-gray-50/50 dark:from-zinc-950 dark:to-gray-950/10">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Package className="h-12 w-12 text-gray-500" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-400">Aguardando Envio</CardTitle>
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                <Package className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate tracking-tight text-gray-950 dark:text-gray-50">
                {createdCount}
              </div>
              <p className="text-xs text-gray-600/80 dark:text-gray-400/70 mt-1 font-medium">
                Pedidos criados
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/feeding-orders" className="block group">
          <Card className="hover:shadow-lg transition-all duration-300 hover:border-teal-500/50 cursor-pointer overflow-hidden relative border-l-4 border-l-teal-500 bg-gradient-to-br from-white to-teal-50/50 dark:from-zinc-950 dark:to-teal-950/10">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Layers className="h-12 w-12 text-teal-500" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-teal-700 dark:text-teal-400">Alimentando</CardTitle>
              <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-full">
                <Layers className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate tracking-tight text-teal-950 dark:text-teal-50">
                {feedingCount}
              </div>
              <p className="text-xs text-teal-600/80 dark:text-teal-400/70 mt-1 font-medium">
                Acumulando valor mínimo
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/waiting-mirror" className="block group">
          <Card className="hover:shadow-lg transition-all duration-300 hover:border-blue-500/50 cursor-pointer overflow-hidden relative border-l-4 border-l-blue-500 bg-gradient-to-br from-white to-blue-50/50 dark:from-zinc-950 dark:to-blue-950/10">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Clock className="h-12 w-12 text-blue-500" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">Aguar. Espelho</CardTitle>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate tracking-tight text-blue-950 dark:text-blue-50">
                {noMirrorCount}
              </div>
              <p className="text-xs text-blue-600/80 dark:text-blue-400/70 mt-1 font-medium">
                Aguardando aprovação
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/arriving-today" className="block group">
          <Card className="hover:shadow-lg transition-all duration-300 hover:border-purple-500/50 cursor-pointer overflow-hidden relative border-l-4 border-l-purple-500 bg-gradient-to-br from-white to-purple-50/50 dark:from-zinc-950 dark:to-purple-950/10">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Package className="h-12 w-12 text-purple-500" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-400">Cheg. Hoje</CardTitle>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate tracking-tight text-purple-950 dark:text-purple-50">
                {arrivingTodayCount}
              </div>
              <p className="text-xs text-purple-600/80 dark:text-purple-400/70 mt-1 font-medium">
                Previsão para hoje
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/orders?status=RECEIVED_PARTIAL" className="block group">
          <Card className="hover:shadow-lg transition-all duration-300 hover:border-amber-500/50 cursor-pointer overflow-hidden relative border-l-4 border-l-amber-500 bg-gradient-to-br from-white to-amber-50/50 dark:from-zinc-950 dark:to-amber-950/10">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <AlertTriangle className="h-12 w-12 text-amber-500" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-400">Saldo Pendente</CardTitle>
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate tracking-tight text-amber-950 dark:text-amber-50">
                {partialCount}
              </div>
              <p className="text-xs text-amber-600/80 dark:text-amber-400/70 mt-1 font-medium">
                Recebidos com saldo
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Alerts & Top Suppliers Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <Card className="hover:shadow-md transition-shadow border-l-4 border-l-destructive/50 h-full">
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
        <div className="col-span-3">
          <TopSuppliers orders={allOrders} />
        </div>
      </div>
    </div>
  )
}
