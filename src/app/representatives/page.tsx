import Link from "next/link"
import { Plus, MoreHorizontal, Eye, Edit, Trash2, Phone, Mail } from "lucide-react"

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
import { getRepresentatives } from "@/actions/representatives"

export default async function RepresentativesPage() {
    const representatives = await getRepresentatives()

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Representantes</h1>
                <Button asChild>
                    <Link href="/representatives/new">
                        <Plus className="mr-2 h-4 w-4" /> Novo Representante
                    </Link>
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Contato</TableHead>
                            <TableHead>Fornecedor</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {representatives.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                    Nenhum representante cadastrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            representatives.map((rep) => (
                                <TableRow key={rep.id}>
                                    <TableCell className="font-medium">{rep.name}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            {rep.phone && (
                                                <span className="flex items-center gap-1 text-sm">
                                                    <Phone className="h-3 w-3 text-muted-foreground" />
                                                    {rep.phone}
                                                </span>
                                            )}
                                            {rep.email && (
                                                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <Mail className="h-3 w-3" />
                                                    {rep.email}
                                                </span>
                                            )}
                                            {!rep.phone && !rep.email && (
                                                <span className="text-sm text-muted-foreground italic">-</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{rep.supplier.name}</TableCell>
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
                                                    <Link href={`/representatives/${rep.id}/edit`}>
                                                        <Edit className="mr-2 h-4 w-4" /> Editar
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
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
