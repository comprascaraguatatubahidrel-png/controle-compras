import Link from "next/link"
import { ArrowLeft, AlertTriangle, Clock, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { getPendingBalanceOrders } from "@/actions/partial-receipts"
import { getSuppliers } from "@/actions/suppliers"
import { OrderSearch } from "@/components/orders/OrderSearch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = 'force-dynamic'

function getDaysOverdue(expectedDate: Date | null): number {
    if (!expectedDate) return 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const expected = new Date(expectedDate)
    expected.setHours(0, 0, 0, 0)
    const diffTime = today.getTime() - expected.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
}

export default async function PendingBalancePage({ searchParams }: { searchParams: Promise<{ q?: string, supplierId?: string }> }) {
    const { q, supplierId } = await searchParams
    const orders = await getPendingBalanceOrders(q, supplierId)
    const suppliers = await getSuppliers()

    // Calcular totais
    const totalPendingValue = orders.reduce((sum, order) => sum + Number(order.remainingValue || 0), 0)
    const totalOrders = orders.length
    const overdueOrders = orders.filter(order => getDaysOverdue(order.expectedArrivalDate) > 0).length

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-lg font-semibold md:text-2xl">Saldos Pendentes</h1>
                    <p className="text-sm text-muted-foreground">Pedidos com saldo a receber</p>
                </div>
            </div>

            {/* Cards de resumo */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalOrders}</div>
                        <p className="text-xs text-muted-foreground">com saldo pendente</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Valor Total Pendente</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                            R$ {totalPendingValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground">aguardando recebimento</p>
                    </CardContent>
                </Card>

                <Card className={overdueOrders > 0 ? "border-red-200 dark:border-red-900" : ""}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Atrasados</CardTitle>
                        <AlertTriangle className={`h-4 w-4 ${overdueOrders > 0 ? "text-red-500" : "text-muted-foreground"}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${overdueOrders > 0 ? "text-red-600 dark:text-red-400" : ""}`}>
                            {overdueOrders}
                        </div>
                        <p className="text-xs text-muted-foreground">passaram da data prevista</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filtros */}
            <div className="flex items-center gap-4">
                <OrderSearch />
                <select
                    className="flex h-10 w-full max-w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    defaultValue={supplierId || "ALL"}
                >
                    <option value="ALL">Todos os Fornecedores</option>
                    {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                    ))}
                </select>
            </div>

            {/* Tabela */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Código</TableHead>
                            <TableHead>Fornecedor</TableHead>
                            <TableHead>Valor Original</TableHead>
                            <TableHead>Saldo Pendente</TableHead>
                            <TableHead>Data Prevista</TableHead>
                            <TableHead>Atraso</TableHead>
                            <TableHead>Motivo</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    Nenhum pedido com saldo pendente encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => {
                                const daysOverdue = getDaysOverdue(order.expectedArrivalDate)
                                const isOverdue = daysOverdue > 0

                                return (
                                    <TableRow key={order.id} className={isOverdue ? "bg-red-50/50 dark:bg-red-950/10" : ""}>
                                        <TableCell className="font-medium">
                                            <Link href={`/orders/${order.id}`} className="hover:underline text-primary">
                                                {order.code}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{order.supplier.name}</span>
                                                {order.supplier.brand && (
                                                    <span className="text-xs text-muted-foreground">{order.supplier.brand}</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>R$ {order.totalValue}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 font-semibold">
                                                R$ {order.remainingValue || "0.00"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {order.expectedArrivalDate ? order.expectedArrivalDate.toLocaleDateString('pt-BR') : "-"}
                                        </TableCell>
                                        <TableCell>
                                            {isOverdue ? (
                                                <Badge variant="destructive" className="text-xs">
                                                    {daysOverdue} {daysOverdue === 1 ? "dia" : "dias"}
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">No prazo</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">
                                                {order.partialReason || "-"}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
