"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { deleteSupplier } from "@/actions/suppliers"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface DeleteSupplierButtonProps {
    supplierId: number
    supplierName: string
}

export function DeleteSupplierButton({ supplierId, supplierName }: DeleteSupplierButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const result = await deleteSupplier(supplierId)
            if (result.success) {
                toast.success("Fornecedor excluído com sucesso")
            } else {
                toast.error(result.error || "Erro ao excluir fornecedor")
            }
        } catch (error) {
            console.error("Erro ao excluir fornecedor:", error)
            toast.error("Erro ao excluir fornecedor")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive cursor-pointer flex items-center">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Excluir Fornecedor</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tem certeza que deseja excluir o fornecedor <strong>{supplierName}</strong>? Esta ação não pode ser desfeita. Todos os pedidos, representantes, notas recusadas e histórico vinculados a este fornecedor também serão excluídos.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isDeleting ? "Excluindo..." : "Excluir"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
