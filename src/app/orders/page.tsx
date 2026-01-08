import Link from "next/link"
import { Search, Plus, Filter, MoreHorizontal, AlertTriangle } from "lucide-react"

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
import { OrderSearch } from "@/components/orders/OrderSearch"

const statusMap: Record<string, { label: string; className: string }> = {
  SENT: { label: "Enviado ao Fornecedor", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
  APPROVED: { label: "Orçamento Aprovado", className: "bg-green-100 text-green-800 hover:bg-green-100" },
  MIRROR_ARRIVED: { label: "Espelho Chegou", className: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100" },
  WAITING_ARRIVAL: { label: "Aguardando Chegada", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
  RECEIVED_COMPLETE: { label: "Recebido Completo", className: "bg-green-100 text-green-800 hover:bg-green-100" },
  RECEIVED_PARTIAL: { label: "Recebido com Saldo", className: "bg-orange-100 text-orange-800 hover:bg-orange-100" },
}

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ q?: string, status?: string, filter?: string }> }) {
  const { q, status, filter } = await searchParams
  const orders = await getOrders(q, status, filter)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Pedidos de Compra</h1>
        <Button asChild>
          <Link href="/orders/new">
            <Plus className="mr-2 h-4 w-4" /> Novo Pedido
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <OrderSearch />
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
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
                  Nenhum pedido encontrado.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    {order.code}
                  </TableCell>
                  <TableCell>{order.supplier.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusMap[order.status]?.className}>
                      {statusMap[order.status]?.label || order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {order.expectedArrivalDate ? order.expectedArrivalDate.toLocaleDateString() : "-"}
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
