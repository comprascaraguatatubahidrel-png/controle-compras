"use client"

import { SupplierForm } from "@/components/suppliers/SupplierForm"
import { useRouter } from "next/navigation"

export default function NewSupplierPage() {
    const router = useRouter()

    async function onSubmit(data: any) {
        // Mock submission
        console.log("Submitting:", data)
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        // TODO: Call API/Server Action
        router.push("/suppliers")
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Cadastro de Fornecedor</h1>
            </div>

            <SupplierForm onSubmit={onSubmit} />
        </div>
    )
}
