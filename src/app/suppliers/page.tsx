import Link from "next/link"
import { Search, Plus, Filter, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"

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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

// Mock data
const suppliers = [
    { id: 1, name: "Deca", brand: "Deca", active: true, lastOrder: "2024-01-05" },
    { id: 2, name: "Docol", brand: "Docol", active: true, lastOrder: "2023-12-20" },
    { id: 3, name: "Tigre", brand: "Tigre", active: true, lastOrder: "2024-01-02" },
    { id: 4, name: "Amanco", brand: "Amanco", active: false, lastOrder: "2023-10-15" },
]

export default function SuppliersPage() {
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
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar por nome ou marca..."
                        className="w-full pl-8 md:w-[300px] lg:w-[400px]"
                    />
                </div>
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
                        {suppliers.map((supplier) => (
                            <TableRow key={supplier.id}>
                                <TableCell className="font-medium">{supplier.name}</TableCell>
                                <TableCell>{supplier.brand}</TableCell>
                                <TableCell>
                                    <Badge variant={supplier.active ? "outline" : "secondary"}>
                                        {supplier.active ? "Ativo" : "Inativo"}
                                    </Badge>
                                </TableCell>
                                <TableCell>{supplier.lastOrder}</TableCell>
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
                                            <DropdownMenuItem>
                                                <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Edit className="mr-2 h-4 w-4" /> Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
