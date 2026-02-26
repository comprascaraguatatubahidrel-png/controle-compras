import { use } from "react"
import Link from "next/link"
import { ArrowLeft, Edit, Phone, Mail, Plus, User } from "lucide-react"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { getSupplierById } from "@/actions/suppliers"

export default async function SupplierDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supplier = await getSupplierById(id)

    if (!supplier) {
        notFound()
    }

    // Checking active status based on recent orders (mock logic for now, similar to list)
    const hasOrders = supplier.orders.length > 0

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/suppliers">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-lg font-semibold md:text-2xl flex items-center gap-2">
                        {supplier.name}
                        {supplier.brand && <Badge variant="outline">{supplier.brand}</Badge>}
                    </h1>
                </div>
                <Button asChild>
                    <Link href={`/suppliers/${id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" /> Editar
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Supplier Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Dados do Fornecedor</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <span className="text-sm font-medium text-muted-foreground">Razão Social / Outro Nome</span>
                            <p>{supplier.brand || '-'}</p>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-muted-foreground">Observações</span>
                            <p>{supplier.observations || '-'}</p>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-muted-foreground">Status</span>
                            <p>
                                <Badge variant={hasOrders ? "default" : "secondary"}>
                                    {hasOrders ? "Ativo" : "Novo"}
                                </Badge>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Representatives */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Representantes</CardTitle>
                        <Button size="sm" variant="outline" asChild>
                            <Link href={`/representatives/new?supplierId=${id}`}>
                                <Plus className="h-4 w-4" /> Adicionar
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {supplier.representatives.length === 0 ? (
                            <p className="text-muted-foreground text-sm">Nenhum representante cadastrado.</p>
                        ) : (
                            supplier.representatives.map((rep) => (
                                <div key={rep.id} className="flex items-start justify-between rounded-lg border p-3">
                                    <div className="flex gap-3">
                                        <div className="mt-1 bg-muted p-2 rounded-full">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{rep.name}</p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                <Phone className="h-3 w-3" /> {rep.phone || '-'}
                                            </div>
                                            {rep.email && (
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                                                    <Mail className="h-3 w-3" /> {rep.email}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" asChild>
                                        <Link href={`/representatives/${rep.id}/edit`}>
                                            <Edit className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
