import Link from "next/link"
import { ArrowLeft, AlertTriangle, Clock, Search, CheckCircle } from "lucide-react"
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
import { SupplierFilter } from "@/components/orders/SupplierFilter"
import { ExportButton } from "@/components/common/ExportButton"

import { PendingBalanceActions } from "@/components/orders/PendingBalanceActions"
import { OrderTableRow } from "@/components/orders/OrderTableRow"

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

    // Prepare export data
    const exportData = orders.map(order => ({
        code: order.code,
        supplier: order.supplier.name,
        originalValue: order.totalValue,
        pendingValue: order.remainingValue,
        expectedDate: order.expectedArrivalDate ? new Date(order.expectedArrivalDate) : null,
        daysOverdue: getDaysOverdue(order.expectedArrivalDate),
        reason: order.partialReason || ""
    }))

    const exportHeaders = [
        { key: "code", label: "Código" },
        { key: "supplier", label: "Fornecedor" },
        { key: "originalValue", label: "Valor Original (R$)" },
        { key: "pendingValue", label: "Saldo Pendente (R$)" },
        { key: "expectedDate", label: "Data Prevista" },
        { key: "daysOverdue", label: "Dias Atraso" },
        { key: "reason", label: "Motivo" }
    ]

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
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
                <ExportButton data={exportData} headers={exportHeaders} filename="saldos_pendentes" />
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
                <SupplierFilter suppliers={suppliers} />
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
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    Nenhum pedido com saldo pendente encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => {
                                const daysOverdue = getDaysOverdue(order.expectedArrivalDate)
                                const isOverdue = daysOverdue > 0

                                return (
                                    <OrderTableRow key={order.id} orderId={order.id} backUrl="/pending-balance" className={isOverdue ? "bg-red-50/50 dark:bg-red-950/10" : ""}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <span>{order.code}</span>
                                                {order.checked && (
                                                    <div title="Conferido pelo gerente">
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                    </div>
                                                )}
                                            </div>
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
                                        <TableCell className="text-right">
                                            <PendingBalanceActions orderId={order.id} remainingValue={order.remainingValue} currentExpectedDate={order.expectedArrivalDate ? order.expectedArrivalDate.toLocaleDateString('pt-BR') : null} />
                                        </TableCell>
                                    </OrderTableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
