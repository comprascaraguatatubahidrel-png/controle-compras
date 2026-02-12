import Link from "next/link"
import { Plus, CheckCircle, Layers } from "lucide-react"

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
import { getFeedingOrders } from "@/actions/orders"
import { getSuppliers } from "@/actions/suppliers"
import { OrderSearch } from "@/components/orders/OrderSearch"
import { QuickActions } from "@/components/orders/QuickActions"
import { OrderTableRow } from "@/components/orders/OrderTableRow"

export const dynamic = 'force-dynamic'

export default async function FeedingOrdersPage({ searchParams }: { searchParams: Promise<{ q?: string, supplierId?: string }> }) {
    const { q, supplierId } = await searchParams
    const orders = await getFeedingOrders(q, supplierId)

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-full">
                        <Layers className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold md:text-2xl">Pedidos Alimentando</h1>
                        <p className="text-sm text-muted-foreground">Pedidos acumulando valor mínimo para envio</p>
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
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Código</TableHead>
                            <TableHead>Fornecedor</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Solicitado por</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    Nenhum pedido alimentando no momento.
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <OrderTableRow key={order.id} orderId={order.id}>
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
                                        <span>{order.supplier.name}</span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400">
                                            Alimentando
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        R$ {order.totalValue}
                                    </TableCell>
                                    <TableCell>
                                        {order.requestedBy || (
                                            <span className="text-muted-foreground italic text-sm">-</span>
                                        )}
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
