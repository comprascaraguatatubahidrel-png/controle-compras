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

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card x-chunk="dashboard-01-chunk-0" className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total em Aberto</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 0,00</div>
            <p className="text-xs text-muted-foreground">
              Pedidos enviador e não concluídos
            </p>
          </CardContent>
        </Card>
        <Card x-chunk="dashboard-01-chunk-1" className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sem Espelho</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Aguardando confirmação
            </p>
          </CardContent>
        </Card>
        <Card x-chunk="dashboard-01-chunk-2" className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chegam Hoje</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Previsão para hoje
            </p>
          </CardContent>
        </Card>
        <Card x-chunk="dashboard-01-chunk-3" className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">0</div>
            <p className="text-xs text-muted-foreground">
              Pedidos atrasados ou com problemas
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
            <Overview />
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
            <RecentAlerts />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
