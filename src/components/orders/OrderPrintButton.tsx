"use client"

import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

export function OrderPrintButton() {
    return (
        <Button variant="outline" size="sm" className="hidden md:flex print:hidden" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
        </Button>
    )
}
