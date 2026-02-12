import Link from "next/link"
import { Search, Plus, MoreHorizontal, AlertTriangle, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { getOrders } from "@/actions/orders"
import { getSuppliers } from "@/actions/suppliers"
import { OrderSearch } from "@/components/orders/OrderSearch"
import { OrderFilters } from "@/components/orders/OrderFilters"
import { ExportButton } from "@/components/orders/ExportButton"
import { QuickActions } from "@/components/orders/QuickActions"
import { SortableHeader } from "@/components/orders/SortableHeader"
import { OrderTableRow } from "@/components/orders/OrderTableRow"
import { PendingBalanceIndicator } from "@/components/orders/PendingBalanceIndicator"

const statusMap: Record<string, { label: string; className: string }> = {
  FEEDING: { label: "Alimentando", className: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400" },
  CREATED: { label: "Aguardando Envio", className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400" },
  SENT: { label: "Enviado ao Fornecedor", className: "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400" },
  APPROVED: { label: "Orçamento Aprovado", className: "bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400" },
  MIRROR_ARRIVED: { label: "Espelho Chegou", className: "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400" },
  WAITING_ARRIVAL: { label: "Aguardando Chegada", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400" },
  RECEIVED_COMPLETE: { label: "Recebido Completo", className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400" },
  RECEIVED_PARTIAL: { label: "Recebido com Saldo", className: "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400" },
  CANCELLED: { label: "Cancelado", className: "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400" },
}

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ q?: string, status?: string, filter?: string, supplierId?: string, date?: string, sort?: string, order?: string }> }) {
  const { q, status, filter, supplierId, date, sort, order: sortOrder } = await searchParams
  let orders = await getOrders(q, status, filter, supplierId, date)
  const suppliers = await getSuppliers()

  // Server-side sorting based on URL params
  if (sort) {
    orders = [...orders].sort((a, b) => {
      let comparison = 0
      switch (sort) {
        case 'code':
          comparison = a.code.localeCompare(b.code)
          break
        case 'supplier':
          comparison = a.supplier.name.localeCompare(b.supplier.name)
          break
        case 'date':
          const dateA = a.expectedArrivalDate ? new Date(a.expectedArrivalDate).getTime() : 0
          const dateB = b.expectedArrivalDate ? new Date(b.expectedArrivalDate).getTime() : 0
          comparison = dateA - dateB
          break
        case 'value':
          comparison = Number(a.totalValue || 0) - Number(b.totalValue || 0)
          break
      }
      return sortOrder === 'desc' ? -comparison : comparison
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Pedidos de Compra</h1>
        <div className="flex gap-2">
          <ExportButton orders={orders} />
          <Button asChild>
            <Link href="/orders/new">
              <Plus className="mr-2 h-4 w-4" /> Novo Pedido
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <OrderSearch />
        <OrderFilters suppliers={suppliers} />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortableHeader column="code">Código</SortableHeader>
              </TableHead>
              <TableHead>
                <SortableHeader column="supplier">Fornecedor</SortableHeader>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <SortableHeader column="date">Chegada Prevista</SortableHeader>
              </TableHead>
              <TableHead>
                <SortableHeader column="value">Valor</SortableHeader>
              </TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum pedido encontrado.
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
                    {order.expectedArrivalDate ? order.expectedArrivalDate.toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span>R$ {order.totalValue}</span>
                      {order.status === 'RECEIVED_PARTIAL' && order.remainingValue && (
                        <PendingBalanceIndicator
                          remainingValue={order.remainingValue}
                          expectedArrivalDate={order.expectedArrivalDate}
                        />
                      )}
                    </div>
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
