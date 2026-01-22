import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { RepresentativeForm } from "@/components/representatives/RepresentativeForm"
import { getSuppliers } from "@/actions/suppliers"

export default async function NewRepresentativePage() {
    const suppliers = await getSuppliers()

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/representatives">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-lg font-semibold md:text-2xl">Novo Representante</h1>
            </div>

            <RepresentativeForm suppliers={suppliers} />
        </div>
    )
}
