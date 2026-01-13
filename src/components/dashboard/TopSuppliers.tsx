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
        <Card className="h-full hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/50 bg-gradient-to-br from-white to-primary/5 dark:from-zinc-950 dark:to-primary/10">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-primary">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <TrendingUp className="h-5 w-5" />
                    </div>
                    Top Fornecedores
                </CardTitle>
                <CardDescription>
                    Maiores volumes de compra
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {sortedSuppliers.map((supplier: any, index) => (
                        <div key={supplier.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-xs ${index === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                        index === 1 ? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400' :
                                            index === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                                'bg-muted text-muted-foreground'
                                    }`}>
                                    {index + 1}
                                </div>
                                <div>
                                    <p className="text-sm font-medium leading-none">{supplier.name}</p>
                                    <p className="text-xs text-muted-foreground mt-1 font-medium">{supplier.count} pedidos</p>
                                </div>
                            </div>
                            <div className="font-bold text-sm text-right">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(supplier.total)}
                            </div>
                        </div>
                    ))}

                    {sortedSuppliers.length === 0 && (
                        <p className="text-center text-sm text-muted-foreground py-8 italic">
                            Sem dados suficientes para ranking.
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
