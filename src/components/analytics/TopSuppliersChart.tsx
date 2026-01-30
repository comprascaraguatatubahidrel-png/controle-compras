"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts"

interface TopSuppliersChartProps {
    data: {
        name: string
        value: number
    }[]
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];

export function TopSuppliersChart({ data }: TopSuppliersChartProps) {
    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Top Fornecedores</CardTitle>
                <CardDescription>
                    Os 5 fornecedores com maior volume de compras.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart layout="vertical" data={data} margin={{ top: 0, right: 0, bottom: 0, left: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--muted))" />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={100}
                            stroke="#888888"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: "transparent" }}
                            contentStyle={{
                                backgroundColor: "hsl(var(--background))",
                                borderColor: "hsl(var(--border))",
                            }}
                            itemStyle={{ color: "hsl(var(--foreground))" }}
                            formatter={(value: number | undefined) => [
                                new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0),
                                "Total"
                            ]}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
