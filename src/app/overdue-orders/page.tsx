import Link from "next/link"
import { Plus, AlertTriangle, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getOverdueOrders } from "@/actions/orders"
import { getSuppliers } from "@/actions/suppliers"
import { OrderSearch } from "@/components/orders/OrderSearch"
import { QuickActions } from "@/components/orders/QuickActions"
import { OrderTableRow } from "@/components/orders/OrderTableRow"
import { SupplierFilter } from "@/components/orders/SupplierFilter"
import { startOfDay, differenceInDays } from "date-fns"

export const dynamic = 'force-dynamic'

export default async function OverdueOrdersPage({ searchParams }: { searchParams: Promise<{ q?: string, supplierId?: string }> }) {
    const { q, supplierId } = await searchParams
    const orders = await getOverdueOrders(q, supplierId)
    const suppliers = await getSuppliers()
    const today = startOfDay(new Date())

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold md:text-2xl">Pedidos Atrasados</h1>
                        <p className="text-sm text-muted-foreground">Pedidos aguardando chegada com prazo vencido</p>
                    </div>
                </div>
                <Button asChild>
                    <Link href="/orders/new">
                        <Plus className="mr-2 h-4 w-4" /> Novo Pedido
                    </Link>
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <OrderSearch />
                <SupplierFilter suppliers={suppliers} />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Código</TableHead>
                            <TableHead>Fornecedor</TableHead>
                            <TableHead>Chegada Prevista</TableHead>
                            <TableHead>Dias de Atraso</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    Nenhum pedido atrasado no momento. 🎉
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => {
                                const expectedDate = order.expectedArrivalDate ? startOfDay(new Date(order.expectedArrivalDate)) : null
                                const daysOverdue = expectedDate ? differenceInDays(today, expectedDate) : 0
                                const isCritical = daysOverdue > 10

                                return (
                                    <OrderTableRow key={order.id} orderId={order.id} backUrl="/overdue-orders">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <span className="hover:underline">
                                                    {order.code}
                                                </span>
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
                                                {order.requestedBy && (
                                                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                                                        {order.requestedBy}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {expectedDate ? expectedDate.toLocaleDateString('pt-BR') : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    isCritical
                                                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 font-bold border-red-300 dark:border-red-700"
                                                        : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-300 dark:border-orange-700"
                                                }
                                            >
                                                {isCritical && <AlertTriangle className="h-3 w-3 mr-1" />}
                                                {daysOverdue} {daysOverdue === 1 ? 'dia' : 'dias'}
                                                {isCritical && ' — Crítico'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            R$ {order.totalValue}
                                        </TableCell>
                                        <TableCell>
                                            <QuickActions order={{ id: order.id, code: order.code, status: order.status }} />
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
