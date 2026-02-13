import { getSupplierById, updateSupplier } from "@/actions/suppliers"
import { SupplierForm } from "@/components/suppliers/SupplierForm"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function EditSupplierPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supplier = await getSupplierById(id)

    if (!supplier) {
        notFound()
    }

    async function handleSubmit(data: any) {
        "use server"
        await updateSupplier(Number(id), data)
        redirect(`/suppliers/${id}`)
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href={`/suppliers/${id}`}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-lg font-semibold md:text-2xl">Editar Fornecedor</h1>
            </div>

            <SupplierForm
                initialData={{
                    name: supplier.name,
                    brand: supplier.brand || "",
                    observations: supplier.observations || ""
                }}
                onSubmit={handleSubmit}
            />
        </div>
    )
}
