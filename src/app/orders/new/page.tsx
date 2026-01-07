"use client"

import { OrderForm } from "@/components/orders/OrderForm"

export default function NewOrderPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Lançamento de Pedido</h1>
            </div>

            <OrderForm />
        </div>
    )
}
