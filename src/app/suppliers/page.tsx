import Link from "next/link"
import { Plus, Filter, MoreHorizontal, Eye, Edit } from "lucide-react"

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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { getSuppliers } from "@/actions/suppliers"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { DeleteSupplierButton } from "@/components/suppliers/DeleteSupplierButton"
import { SupplierSearch } from "@/components/suppliers/SupplierSearch"

export default async function SuppliersPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const search = typeof params.q === 'string' ? params.q : undefined

    const suppliers = await getSuppliers(search)

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Fornecedores</h1>
                <Button asChild>
                    <Link href="/suppliers/new">
                        <Plus className="mr-2 h-4 w-4" /> Novo Fornecedor
                    </Link>
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <SupplierSearch />
                <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Marca Representada</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Último Pedido</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {suppliers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    Nenhum fornecedor cadastrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            suppliers.map((supplier) => {
                                const hasOrders = supplier.orders.length > 0
                                const lastOrder = hasOrders
                                    ? supplier.orders.sort((a, b) => new Date(b.sentDate).getTime() - new Date(a.sentDate).getTime())[0]
                                    : null

                                return (
                                    <TableRow key={supplier.id}>
                                        <TableCell className="font-medium">{supplier.name}</TableCell>
                                        <TableCell>{supplier.brand || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant={hasOrders ? "outline" : "secondary"}>
                                                {hasOrders ? "Ativo" : "Novo"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {lastOrder
                                                ? format(new Date(lastOrder.sentDate), "dd/MM/yyyy", { locale: ptBR })
                                                : "-"}
                                        </TableCell>
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
                                                        <Link href={`/suppliers/${supplier.id}`} className="cursor-pointer flex items-center">
                                                            <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/suppliers/${supplier.id}/edit`} className="cursor-pointer flex items-center">
                                                            <Edit className="mr-2 h-4 w-4" /> Editar
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DeleteSupplierButton
                                                        supplierId={supplier.id}
                                                        supplierName={supplier.name}
                                                    />
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
