import { OrderValueEdit } from "@/components/orders/OrderValueEdit"
import { ArrowLeft, Calendar, FileText, Truck, User, AlertTriangle } from "lucide-react"
import { OrderPrintButton } from "@/components/orders/OrderPrintButton"
import { OrderRequestedByEdit } from "@/components/orders/OrderRequestedByEdit"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { OrderActions } from "@/components/orders/OrderActions"
import { getOrderById, updateOrderStatus } from "@/actions/orders"
import { RemainingValueEdit } from "@/components/orders/RemainingValueEdit"
import { CloseBalanceModal } from "@/components/orders/CloseBalanceModal"
import { PartialReceiptsHistory } from "@/components/orders/PartialReceiptsHistory"
import { getPartialReceipts } from "@/actions/partial-receipts"

const statusMap: Record<string, { label: string; className: string }> = {
    CREATED: { label: "Aguardando Envio", className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400" },
    SENT: { label: "Enviado ao Fornecedor", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
    APPROVED: { label: "Orçamento Aprovado", className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
    MIRROR_ARRIVED: { label: "Espelho Chegou", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" },
    WAITING_ARRIVAL: { label: "Aguardando Chegada", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
    RECEIVED_COMPLETE: { label: "Recebido Completo", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" },
    RECEIVED_PARTIAL: { label: "Recebido com Saldo", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
    CANCELLED: { label: "Cancelado", className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400" },
}

import { OrderCancelButton } from "@/components/orders/OrderCancelButton"
import { OrderCreatedModal } from "@/components/orders/OrderCreatedModal"
import { OrderCheckButton } from "@/components/orders/OrderCheckButton"

// Wrapper for Client Component Logic (Actions)
import { OrderActionsWrapper } from "@/components/orders/OrderActionsWrapper"
import { OrderObservations } from "@/components/orders/OrderObservations"

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const order = await getOrderById(id)

    if (!order) {
        notFound()
    }

    // Buscar histórico de recebimentos parciais se o pedido tiver saldo
    const partialReceipts = order.status === 'RECEIVED_PARTIAL'
        ? await getPartialReceipts(order.id)
        : []

    return (
        <div className="flex flex-col gap-6">
            <OrderCreatedModal orderId={order.id} status={order.status} />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-b pb-4">
                <div className="flex items-center gap-4 flex-1">
                    <Button variant="outline" size="icon" asChild className="shrink-0">
                        <Link href="/orders">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-lg font-semibold md:text-2xl truncate">
                                Pedido {order.code}
                            </h1>
                            <Badge variant="outline" className={statusMap[order.status]?.className}>
                                {statusMap[order.status]?.label || order.status}
                            </Badge>
                            <OrderCheckButton orderId={order.id} initialChecked={order.checked} />
                        </div>
                        <p className="text-muted-foreground truncate">{order.supplier.name}</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    {order.status !== 'CANCELLED' && (
                        <OrderCancelButton orderId={order.id} />
                    )}

                    <OrderPrintButton />

                    {/* Actions Component */}
                    <OrderActionsWrapper orderId={order.id} currentStatus={order.status} />
                </div>
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
                            <OrderValueEdit orderId={order.id} initialValue={order.totalValue || "0"} />
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-4 w-4" /> Data do Envio
                            </span>
                            <span>{order.sentDate.toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-muted-foreground flex items-center gap-2">
                                <User className="h-4 w-4" /> Solicitado por
                            </span>
                            <OrderRequestedByEdit orderId={order.id} initialValue={order.requestedBy} />
                        </div>

                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-muted-foreground flex items-center gap-2">
                                <Truck className="h-4 w-4" /> Chegada Prevista
                            </span>
                            <span className={!order.expectedArrivalDate ? "text-muted-foreground italic" : ""}>
                                {order.expectedArrivalDate ? order.expectedArrivalDate.toLocaleDateString() : "Aguardando definição"}
                            </span>
                        </div>

                        <OrderObservations orderId={order.id} initialObservations={order.observations} />
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
                                    <p className="text-sm font-medium">{statusMap[item.newStatus]?.label || item.newStatus}</p>
                                    <p className="text-sm text-muted-foreground">{item.notes}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{item.changeDate.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Seção de Saldo Pendente - só aparece quando status = RECEIVED_PARTIAL */}
            {order.status === 'RECEIVED_PARTIAL' && (
                <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/10">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            <CardTitle className="text-amber-700 dark:text-amber-400">Saldo Pendente</CardTitle>
                        </div>
                        <CloseBalanceModal orderId={order.id} remainingValue={order.remainingValue} />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1">
                                <span className="text-sm text-muted-foreground">Valor do Saldo</span>
                                <div className="flex items-center gap-2">
                                    <RemainingValueEdit orderId={order.id} initialValue={order.remainingValue} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-sm text-muted-foreground">Motivo</span>
                                <p className="text-sm font-medium">
                                    {order.partialReason || <span className="italic text-muted-foreground">Não informado</span>}
                                </p>
                            </div>
                        </div>

                        {partialReceipts.length > 0 && (
                            <div className="pt-4 border-t">
                                <h4 className="text-sm font-semibold mb-3">Histórico de Recebimentos</h4>
                                <PartialReceiptsHistory receipts={partialReceipts} />
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
