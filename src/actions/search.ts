'use server'

import { db } from "@/db"
import { orders, suppliers, refusedInvoices, representatives } from "@/db/schema"
import { eq, like, or, ilike, desc } from "drizzle-orm"

export type SearchResult = {
    type: 'order' | 'supplier' | 'invoice' | 'representative'
    id: string | number
    title: string
    subtitle: string
    status?: string
    url: string
    date?: Date
}

export async function searchAll(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return []

    const searchStr = `%${query}%`
    const results: SearchResult[] = []

    // 1. Search Orders (Code, Supplier Name via join not easy with simple query, so we rely on fetching and filtering or complex query)
    // Drizzle query API is easier for relations.
    const ordersFound = await db.query.orders.findMany({
        where: or(
            ilike(orders.code, searchStr),
            ilike(orders.observations, searchStr)
        ),
        with: {
            supplier: true
        },
        limit: 10,
        orderBy: [desc(orders.sentDate)]
    })

    ordersFound.forEach(order => {
        results.push({
            type: 'order',
            id: order.id,
            title: `Pedido ${order.code} - ${order.supplier.name}`,
            subtitle: order.observations || 'Sem observações',
            status: order.status,
            url: `/orders/${order.id}`,
            date: order.sentDate
        })
    })

    // 2. Search Suppliers
    const suppliersFound = await db.query.suppliers.findMany({
        where: or(
            ilike(suppliers.name, searchStr),
            ilike(suppliers.brand, searchStr)
        ),
        limit: 5
    })

    suppliersFound.forEach(sup => {
        results.push({
            type: 'supplier',
            id: sup.id,
            title: sup.name,
            subtitle: sup.brand ? `Marca: ${sup.brand}` : 'Fornecedor',
            url: `/suppliers/${sup.id}`,
            date: sup.updatedAt
        })
    })

    // 3. Search Refused Invoices
    const invoicesFound = await db.query.refusedInvoices.findMany({
        where: or(
            ilike(refusedInvoices.invoiceNumber, searchStr),
            ilike(refusedInvoices.reason, searchStr)
        ),
        with: {
            supplier: true
        },
        limit: 5
    })

    invoicesFound.forEach(inv => {
        results.push({
            type: 'invoice',
            id: inv.id,
            title: `NF Recusada #${inv.invoiceNumber}`,
            subtitle: `${inv.supplier.name} - ${inv.reason}`,
            url: `/refused-invoices?highlight=${inv.id}`,
            date: inv.returnDate
        })
    })

    return results
}
