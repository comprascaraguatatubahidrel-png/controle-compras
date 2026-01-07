import { ArrowLeft, Calendar, FileText, Truck } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { OrderActions } from "@/components/orders/OrderActions"
import { getOrderById, updateOrderStatus } from "@/actions/orders"

const statusMap: Record<string, { label: string; className: string }> = {
    SENT: { label: "Enviado ao Fornecedor", className: "bg-blue-100 text-blue-800" },
    WAITING_ARRIVAL: { label: "Aguardando Chegada", className: "bg-yellow-100 text-yellow-800" },
    RECEIVED_COMPLETE: { label: "Recebido Completo", className: "bg-green-100 text-green-800" },
    RECEIVED_PARTIAL: { label: "Recebido com Saldo", className: "bg-orange-100 text-orange-800" },
}

// Wrapper for Client Component Logic (Actions)
import { OrderActionsWrapper } from "@/components/orders/OrderActionsWrapper"

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const order = await getOrderById(id)

    if (!order) {
        notFound()
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/orders">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-lg font-semibold md:text-2xl">
                            Pedido {order.code}
                        </h1>
                        <Badge variant="outline" className={statusMap[order.status]?.className}>
                            {statusMap[order.status]?.label}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground">{order.supplier.name}</p>
                </div>

                {/* Actions Component */}
                <OrderActionsWrapper orderId={order.id} currentStatus={order.status} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* General Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Detalhes do Pedido</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-muted-foreground flex items-center gap-2">
                                <FileText className="h-4 w-4" /> Valor Total
                            </span>
                            <span className="font-semibold">R$ {order.totalValue}</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-4 w-4" /> Data do Envio
                            </span>
                            <span>{order.sentDate.toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-muted-foreground flex items-center gap-2">
                                <Truck className="h-4 w-4" /> Chegada Prevista
                            </span>
                            <span className={!order.expectedArrivalDate ? "text-muted-foreground italic" : ""}>
                                {order.expectedArrivalDate ? order.expectedArrivalDate.toLocaleDateString() : "Aguardando definição"}
                            </span>
                        </div>

                        <div className="pt-2">
                            <p className="font-medium mb-1">Observações</p>
                            <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                                {order.observations || "Sem observações."}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Histórico de Movimentações</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6 border-l-2 border-muted pl-4 ml-2">
                            {order.history.map((item: any, index: number) => (
                                <div key={index} className="relative">
                                    <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-primary" />
                                    <p className="text-sm font-medium">{item.newStatus}</p>
                                    <p className="text-sm text-muted-foreground">{item.notes}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{item.changeDate.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
