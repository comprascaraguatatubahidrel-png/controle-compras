"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface ReceiptEfficiencyChartProps {
    data: {
        name: string
        value: number
        color: string
    }[]
}

export function ReceiptEfficiencyChart({ data }: ReceiptEfficiencyChartProps) {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Eficiência de Recebimento</CardTitle>
                <CardDescription>
                    Proporção de pedidos recebidos vs pendentes.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--background))",
                                borderColor: "hsl(var(--border))",
                            }}
                            itemStyle={{ color: "hsl(var(--foreground))" }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            align="center"
                            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
