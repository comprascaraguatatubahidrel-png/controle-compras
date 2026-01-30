"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface MonthlySpendChartProps {
    data: {
        month: string
        total: number
    }[]
}

export function MonthlySpendChart({ data }: MonthlySpendChartProps) {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Gastos Mensais</CardTitle>
                <CardDescription>
                    Total comprado por mês nos últimos 12 meses.
                </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                        <XAxis
                            dataKey="month"
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
                            tickFormatter={(value) => `R$${value / 1000}k`}
                        />
                        <Tooltip
                            cursor={{ fill: "transparent" }}
                            contentStyle={{
                                backgroundColor: "hsl(var(--background))",
                                borderColor: "hsl(var(--border))",
                            }}
                            itemStyle={{ color: "hsl(var(--foreground))" }}
                            formatter={(value: number) => [
                                new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value),
                                "Total"
                            ]}
                        />
                        <Bar
                            dataKey="total"
                            fill="hsl(var(--primary))"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
