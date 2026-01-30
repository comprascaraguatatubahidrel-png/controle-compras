import Link from "next/link"
import { Search, Plus, MoreHorizontal, AlertTriangle, CheckCircle } from "lucide-react"

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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getPendencies } from "@/actions/orders"
import { getSuppliers } from "@/actions/suppliers"
import { OrderSearch } from "@/components/orders/OrderSearch"
import { OrderFilters } from "@/components/orders/OrderFilters"
import { ExportButton } from "@/components/orders/ExportButton"

export default async function PendenciesPage({ searchParams }: { searchParams: Promise<{ q?: string, supplierId?: string, date?: string }> }) {
    const { q, supplierId, date } = await searchParams
    // Use specialized getPendencies action
    const orders = await getPendencies(q, supplierId, date)
    const suppliers = await getSuppliers()

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                    Pendências
                </h1>
                <div className="flex gap-2">
                    {/* <ExportButton orders={orders} /> */}
                    <Button asChild>
                        <Link href="/pendencies/new">
                            <Plus className="mr-2 h-4 w-4" /> Nova Pendência
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* We reuse OrderSearch since it just sets 'q' query param */}
                <OrderSearch />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Código</TableHead>
                            <TableHead>Fornecedor</TableHead>
                            <TableHead>Observação (Pendência)</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    Nenhum registro de pendência encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        {order.code}
                                        {order.checked && (
                                            <div title="Conferido pelo gerente">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>{order.supplier.name}</TableCell>
                                    <TableCell className="max-w-[300px] truncate" title={order.observations || ''}>
                                        {order.observations || '-'}
                                    </TableCell>
                                    <TableCell>
                                        {order.expectedArrivalDate ? order.expectedArrivalDate.toLocaleDateString() : order.sentDate.toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>R$ {order.totalValue}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/orders/${order.id}`}>Ver Detalhes</Link>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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
