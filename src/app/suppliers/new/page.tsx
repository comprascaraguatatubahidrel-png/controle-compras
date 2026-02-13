import { SupplierForm } from "@/components/suppliers/SupplierForm"
import { createSupplier } from "@/actions/suppliers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NewSupplierPage() {
    async function onSubmit(data: any) {
        "use server"
        await createSupplier(data)
        redirect("/suppliers")
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/suppliers">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-lg font-semibold md:text-2xl">Cadastro de Fornecedor</h1>
            </div>

            <SupplierForm onSubmit={onSubmit} />
        </div>
    )
}
