import Link from "next/link"
import { Search, Plus, MoreHorizontal, FileX } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getRefusedInvoices } from "@/actions/refused-invoices"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default async function RefusedInvoicesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const { q } = await searchParams
    const invoices = await getRefusedInvoices(q)

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl flex items-center gap-2">
                    <FileX className="h-6 w-6 text-red-500" />
                    Notas Fiscais Recusadas
                </h1>
                <div className="flex gap-2">
                    <Button asChild>
                        <Link href="/refused-invoices/new">
                            <Plus className="mr-2 h-4 w-4" /> Nova Devolução
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <form className="flex-1 sm:grow-0">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            name="q"
                            defaultValue={q}
                            placeholder="Buscar por NF, fornecedor..."
                            className="w-full rounded-lg bg-background pl-8 md:w-[336px]"
                        />
                    </div>
                </form>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Número NF</TableHead>
                            <TableHead>Fornecedor</TableHead>
                            <TableHead>Data Devolução</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Motivo</TableHead>
                            <TableHead>Boleto</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    Nenhuma nota fiscal recusada encontrada.
                                </TableCell>
                            </TableRow>
                        ) : (
                            invoices.map((inv) => (
                                <TableRow key={inv.id}>
                                    <TableCell className="font-medium">
                                        {inv.invoiceNumber}
                                    </TableCell>
                                    <TableCell>{inv.supplier.name}</TableCell>
                                    <TableCell>
                                        {inv.returnDate.toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>R$ {inv.value}</TableCell>
                                    <TableCell className="max-w-[200px] truncate" title={inv.reason}>
                                        {inv.reason}
                                    </TableCell>
                                    <TableCell>{inv.boletoNumber || '-'}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
