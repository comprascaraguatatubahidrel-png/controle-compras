"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface Order {
    id: number
    code: string
    supplier: { name: string }
    status: string
    totalValue: string | null
    sentDate: Date
    expectedArrivalDate: Date | null
}

interface ExportButtonProps {
    orders: Order[]
}

const statusLabels: Record<string, string> = {
    SENT: "Enviado ao Fornecedor",
    APPROVED: "Orçamento Aprovado",
    MIRROR_ARRIVED: "Espelho Chegou",
    WAITING_ARRIVAL: "Aguardando Chegada",
    RECEIVED_COMPLETE: "Recebido Completo",
    RECEIVED_PARTIAL: "Recebido com Saldo",
}

export function ExportButton({ orders }: ExportButtonProps) {
    const handleExport = () => {
        // CSV Header
        const headers = ["Código", "Fornecedor", "Status", "Valor (R$)", "Data Envio", "Chegada Prevista"]

        // CSV Rows
        const rows = orders.map(order => [
            order.code,
            order.supplier.name,
            statusLabels[order.status] || order.status,
            order.totalValue || "0",
            order.sentDate.toLocaleDateString("pt-BR"),
            order.expectedArrivalDate ? order.expectedArrivalDate.toLocaleDateString("pt-BR") : "-"
        ])

        // Combine headers and rows
        const csvContent = [
            headers.join(";"),
            ...rows.map(row => row.join(";"))
        ].join("\n")

        // Create blob and download
        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)

        link.setAttribute("href", url)
        link.setAttribute("download", `pedidos_${new Date().toISOString().split("T")[0]}.csv`)
        link.style.visibility = "hidden"

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
        </Button>
    )
}
