import { searchAll } from "@/actions/search"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Package, Truck, FileText, ArrowRight } from "lucide-react"

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const { q } = await searchParams
    const query = q || ""
    const results = await searchAll(query)

    const orders = results.filter(r => r.type === 'order')
    const suppliers = results.filter(r => r.type === 'supplier')
    const invoices = results.filter(r => r.type === 'invoice')

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-lg font-semibold md:text-2xl">Resultados da Busca</h1>
                <p className="text-sm text-muted-foreground">
                    Exibindo resultados para &quot;{query}&quot;
                </p>
            </div>

            {results.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    Nenhum resultado encontrado para sua busca.
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Orders Column */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Package className="h-5 w-5" /> Pedidos ({orders.length})
                    </h2>
                    {orders.length === 0 ? (
                        <span className="text-sm text-muted-foreground">Nenhum pedido encontrado.</span>
                    ) : (
                        <div className="space-y-2">
                            {orders.map((result: any) => (
                                <Link key={result.id} href={result.url} className="flex flex-col gap-1 p-3 rounded-md border bg-card text-card-foreground hover:bg-accent transition-colors">
                                    <div className="flex justify-between items-start">
                                        <span className="font-medium text-sm">{result.title}</span>
                                        {result.status && <Badge variant="secondary" className="text-[10px]">{result.status}</Badge>}
                                    </div>
                                    <span className="text-xs text-muted-foreground line-clamp-2">{result.subtitle}</span>
                                    {result.date && <span className="text-xs text-muted-foreground mt-1">{new Date(result.date).toLocaleDateString()}</span>}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Suppliers Column */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Truck className="h-5 w-5" /> Fornecedores ({suppliers.length})
                    </h2>
                    {suppliers.length === 0 ? (
                        <span className="text-sm text-muted-foreground">Nenhum fornecedor encontrado.</span>
                    ) : (
                        <div className="space-y-2">
                            {suppliers.map((result: any) => (
                                <Link key={result.id} href={result.url} className="flex flex-col gap-1 p-3 rounded-md border bg-card text-card-foreground hover:bg-accent transition-colors">
                                    <span className="font-medium text-sm">{result.title}</span>
                                    <span className="text-xs text-muted-foreground">{result.subtitle}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Invoices Column */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <FileText className="h-5 w-5" /> Notas Recusadas ({invoices.length})
                    </h2>
                    {invoices.length === 0 ? (
                        <span className="text-sm text-muted-foreground">Nenhuma nota encontrada.</span>
                    ) : (
                        <div className="space-y-2">
                            {invoices.map((result: any) => (
                                <Link key={result.id} href={result.url} className="flex flex-col gap-1 p-3 rounded-md border bg-card text-card-foreground hover:bg-accent transition-colors">
                                    <div className="flex justify-between items-start">
                                        <span className="font-medium text-sm">{result.title}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">{result.subtitle}</span>
                                    {result.date && <span className="text-xs text-muted-foreground mt-1">{new Date(result.date).toLocaleDateString()}</span>}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
