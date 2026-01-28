import Link from "next/link"
import { FileX } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { getOrders } from "@/actions/orders"

export default async function CancelledOrdersPage() {
    // Fetch only cancelled orders
    const orders = await getOrders(undefined, 'CANCELLED')

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl flex items-center gap-2">
                    <FileX className="h-6 w-6" /> Pedidos Cancelados
                </h1>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Código</TableHead>
                            <TableHead>Fornecedor</TableHead>
                            <TableHead>Data Cancelamento</TableHead>
                            <TableHead>Cancelado Por</TableHead>
                            <TableHead>Motivo</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    Nenhum pedido cancelado encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">
                                        {order.code}
                                    </TableCell>
                                    <TableCell>{order.supplier.name}</TableCell>
                                    <TableCell>
                                        {order.lastUpdate ? order.lastUpdate.toLocaleDateString() : "-"}
                                    </TableCell>
                                    <TableCell>{order.cancelledBy || "-"}</TableCell>
                                    <TableCell className="max-w-xs truncate" title={order.cancellationReason || ""}>
                                        {order.cancellationReason || "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/orders/${order.id}`}>Ver Detalhes</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
