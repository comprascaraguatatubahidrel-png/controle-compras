import Link from "next/link"
import { Plus, CheckCircle, Package } from "lucide-react"

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

export const dynamic = 'force-dynamic'

export default async function WaitingShipmentPage({ searchParams }: { searchParams: Promise<{ q?: string, supplierId?: string }> }) {
    const { q, supplierId } = await searchParams
    const orders = await getOrders(q, 'CREATED', undefined, supplierId)
    const suppliers = await getSuppliers()

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                        <Package className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold md:text-2xl">Aguardando Envio</h1>
                        <p className="text-sm text-muted-foreground">Pedidos criados aguardando envio ao fornecedor</p>
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
                            <TableHead>Valor</TableHead>
                            <TableHead>Solicitado por</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    Nenhum pedido aguardando envio no momento.
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <OrderTableRow key={order.id} orderId={order.id} backUrl="/waiting-shipment">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <span className="hover:underline">
                                                {order.code}
                                            </span>
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
                                        <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                                            Aguardando Envio
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
