"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, ComposedChart, Legend } from "recharts"

interface MonthlySpendChartProps {
    data: {
        month: string
        total: number
        count: number
    }[]
}

export function MonthlySpendChart({ data }: MonthlySpendChartProps) {
    return (
        <Card className="col-span-1 md:col-span-4">
            <CardHeader>
                <CardTitle>Gastos Mensais</CardTitle>
                <CardDescription>
                    Total comprado por mês nos últimos 12 meses.
                </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                        <XAxis
                            dataKey="month"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            yAxisId="left"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(value)}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip
                            cursor={{ fill: "transparent" }}
                            contentStyle={{
                                backgroundColor: "hsl(var(--background))",
                                borderColor: "hsl(var(--border))",
                            }}
                            itemStyle={{ color: "hsl(var(--foreground))" }}
                            formatter={(value: number | undefined, name: string | undefined) => [
                                name === 'total'
                                    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
                                    : (value || 0),
                                name === 'total' ? 'Total Comprado' : 'Qtd. Pedidos'
                            ]}
                        />
                        <Legend verticalAlign="top" height={36} />
                        <Bar
                            yAxisId="left"
                            dataKey="total"
                            name="Total Comprado"
                            fill="hsl(var(--primary))"
                            radius={[4, 4, 0, 0]}
                            barSize={40}
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="count"
                            name="Qtd. Pedidos"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
