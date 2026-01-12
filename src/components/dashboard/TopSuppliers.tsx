import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

interface TopSuppliersProps {
    orders: any[]
}

export function TopSuppliers({ orders }: TopSuppliersProps) {
    // Calcular total por fornecedor
    const supplierStats = orders.reduce((acc: any, order) => {
        if (!order.supplier) return acc

        const id = order.supplier.id
        if (!acc[id]) {
            acc[id] = {
                id,
                name: order.supplier.name,
                brand: order.supplier.brand,
                total: 0,
                count: 0
            }
        }

        acc[id].total += Number(order.totalValue || 0)
        acc[id].count += 1
        return acc
    }, {})

    // Converter para array e ordenar
    const sortedSuppliers = Object.values(supplierStats)
        .sort((a: any, b: any) => b.total - a.total)
        .slice(0, 5)

    return (
        <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Top Fornecedores
                </CardTitle>
                <CardDescription>
                    Maiores volumes de compra
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {sortedSuppliers.map((supplier: any, index) => (
                        <div key={supplier.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-bold text-xs">
                                    {index + 1}
                                </div>
                                <div>
                                    <p className="text-sm font-medium leading-none">{supplier.name}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{supplier.count} pedidos</p>
                                </div>
                            </div>
                            <div className="font-bold text-sm">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(supplier.total)}
                            </div>
                        </div>
                    ))}

                    {sortedSuppliers.length === 0 && (
                        <p className="text-center text-sm text-muted-foreground py-4">
                            Sem dados suficientes.
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
