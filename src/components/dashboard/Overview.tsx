"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface OverviewProps {
    orders: any[]
}

export function Overview({ orders }: OverviewProps) {
    // Process data for Chart: "Compras por Marca"
    const dataByBrand = orders.reduce((acc: any, order) => {
        const brand = order.supplier?.brand || "Sem Marca"
        const value = Number(order.totalValue || 0)

        const existing = acc.find((item: any) => item.name === brand)
        if (existing) {
            existing.total += value
        } else {
            acc.push({ name: brand, total: value })
        }
        return acc
    }, [])

    // Sort by total value desc
    dataByBrand.sort((a: any, b: any) => b.total - a.total).slice(0, 10)

    if (orders.length === 0) {
        return (
            <div className="flex h-[350px] items-center justify-center text-muted-foreground">
                Nenhum dado disponível
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={dataByBrand}>
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `R$${value}`}
                />
                <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0))}
                />
                <Bar
                    dataKey="total"
                    fill="var(--primary)"
                    radius={[4, 4, 0, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    )
}
