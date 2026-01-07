"use client"

import { use } from "react"
import Link from "next/link"
import { ArrowLeft, Edit, Phone, Mail, Plus, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

// Mock Data
const mockSupplier = {
    id: "1",
    name: "Deca",
    brand: "Deca",
    observations: "Entregas costumam atrasar 2 dias.",
    active: true,
    representatives: [
        { id: 1, name: "João Silva", phone: "(11) 99999-9999", email: "joao@deca.com.br" },
        { id: 2, name: "Maria Oliveira", phone: "(12) 98888-8888", email: "maria@deca.com.br" },
    ]
}

export default function SupplierDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params using React.use()
    const { id } = use(params)

    // In real app, fetch supplier by ID
    const supplier = mockSupplier

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
                        <Badge variant="outline">{supplier.brand}</Badge>
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
                            <span className="text-sm font-medium text-muted-foreground">Marca Representada</span>
                            <p>{supplier.brand}</p>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-muted-foreground">Observações</span>
                            <p>{supplier.observations}</p>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-muted-foreground">Status</span>
                            <p>
                                <Badge variant={supplier.active ? "default" : "secondary"}>
                                    {supplier.active ? "Ativo" : "Inativo"}
                                </Badge>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Representatives */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Representantes</CardTitle>
                        <Button size="sm" variant="outline">
                            <Plus className="h-4 w-4" /> Adicionar
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {supplier.representatives.map((rep) => (
                            <div key={rep.id} className="flex items-start justify-between rounded-lg border p-3">
                                <div className="flex gap-3">
                                    <div className="mt-1 bg-muted p-2 rounded-full">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{rep.name}</p>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                            <Phone className="h-3 w-3" /> {rep.phone}
                                        </div>
                                        {rep.email && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                                                <Mail className="h-3 w-3" /> {rep.email}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
