import Link from "next/link"
import { Plus, Package, CheckCircle } from "lucide-react"

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
import { getOrders } from "@/actions/orders"
import { getSuppliers } from "@/actions/suppliers"
import { OrderSearch } from "@/components/orders/OrderSearch"
import { QuickActions } from "@/components/orders/QuickActions"
import { OrderTableRow } from "@/components/orders/OrderTableRow"
import { SupplierFilter } from "@/components/orders/SupplierFilter"

const statusMap: Record<string, { label: string; className: string }> = {
    SENT: { label: "Enviado ao Fornecedor", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
    APPROVED: { label: "Orçamento Aprovado", className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
    MIRROR_ARRIVED: { label: "Espelho Chegou", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" },
    WAITING_ARRIVAL: { label: "Aguardando Chegada", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
    RECEIVED_PARTIAL: { label: "Recebido com Saldo", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
    CREATED: { label: "Aguardando Envio", className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400" },
}

export const dynamic = 'force-dynamic'

export default async function ArrivingTodayPage({ searchParams }: { searchParams: Promise<{ q?: string, supplierId?: string }> }) {
    const { q, supplierId } = await searchParams
    const orders = await getOrders(q, undefined, 'arriving_today', supplierId)
    const suppliers = await getSuppliers()

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                        <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold md:text-2xl">Chega Hoje</h1>
                        <p className="text-sm text-muted-foreground">Pedidos com previsão de chegada para hoje</p>
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
                            <TableHead>Status</TableHead>
                            <TableHead>Chegada Prevista</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    Nenhum pedido previsto para chegar hoje.
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <OrderTableRow key={order.id} orderId={order.id} backUrl="/arriving-today">
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
                                        <Badge variant="outline" className={statusMap[order.status]?.className}>
                                            {statusMap[order.status]?.label || order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {order.expectedArrivalDate ? new Date(order.expectedArrivalDate).toLocaleDateString('pt-BR') : '-'}
                                    </TableCell>
                                    <TableCell>
                                        R$ {order.totalValue}
                                    </TableCell>
                                    <TableCell>
                                        <QuickActions order={{ id: order.id, code: order.code, status: order.status }} />
                                    </TableCell>
                                </OrderTableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
