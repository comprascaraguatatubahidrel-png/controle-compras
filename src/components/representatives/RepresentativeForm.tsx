"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createRepresentative } from "@/actions/representatives"
import { toast } from "sonner"

interface RepresentativeFormProps {
    suppliers: { id: number; name: string }[]
}

export function RepresentativeForm({ suppliers }: RepresentativeFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [email, setEmail] = useState("")
    const [supplierId, setSupplierId] = useState("")

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!name || !supplierId) {
            toast.error("Preencha os campos obrigatórios")
            return
        }

        setIsLoading(true)
        try {
            await createRepresentative({
                name,
                phone: phone || undefined,
                email: email || undefined,
                supplierId,
            })
            toast.success("Representante cadastrado com sucesso")
            router.push("/representatives")
        } catch (error) {
            console.error(error)
            toast.error("Erro ao cadastrar representante")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>Dados do Representante</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome *</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nome do representante"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="supplier">Fornecedor *</Label>
                        <Select value={supplierId} onValueChange={setSupplierId}>
                            <SelectTrigger id="supplier">
                                <SelectValue placeholder="Selecione o fornecedor" />
                            </SelectTrigger>
                            <SelectContent>
                                {suppliers.map((supplier) => (
                                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                        {supplier.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefone</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="(00) 00000-0000"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@exemplo.com"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Cadastrar
                        </Button>
                        <Button type="button" variant="outline" asChild>
                            <Link href="/representatives">Cancelar</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    )
}
