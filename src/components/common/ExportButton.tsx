"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface ExportButtonProps {
    data: any[]
    filename?: string
    label?: string
    headers?: { key: string, label: string }[]
}

export function ExportButton({ data, filename = "dados", label = "Exportar", headers }: ExportButtonProps) {
    const handleExport = () => {
        if (!data || data.length === 0) {
            alert("Não há dados para exportar.")
            return
        }

        // 1. Determine headers
        const keys = headers ? headers.map(h => h.key) : Object.keys(data[0])
        const headerLabels = headers ? headers.map(h => h.label) : keys

        // 2. Generate CSV content
        const separator = ";"
        const csvContent = [
            headerLabels.join(separator), // Header row
            ...data.map(row => keys.map(key => {
                const value = row[key]
                // Handle formatting
                if (value === null || value === undefined) return ""
                if (typeof value === "string") {
                    // Cleanup newlines and quotes
                    // In CSV, double quotes are escaped by another double quote
                    return `"${value.replace(/"/g, '""').replace(/\n/g, ' ')}"`
                }
                if (value instanceof Date) {
                    return value.toLocaleDateString('pt-BR')
                }
                return value
            }).join(separator))
        ].join("\n")

        // 3. Create download link
        // Add BOM for Excel UTF-8 compatibility
        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            {label}
        </Button>
    )
}
