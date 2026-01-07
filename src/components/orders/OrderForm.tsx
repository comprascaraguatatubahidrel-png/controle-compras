"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { SupplierForm } from "@/components/suppliers/SupplierForm"
import { createOrder } from "@/actions/orders"
import { getSuppliers, createSupplier } from "@/actions/suppliers"

const orderSchema = z.object({
  code: z.string().min(1, "Código do pedido é obrigatório."),
  supplierId: z.string().min(1, "Selecione um fornecedor."),
  totalValue: z.string().min(1, "Informe o valor do pedido."),
  observations: z.string().optional(),
})

type OrderFormValues = z.infer<typeof orderSchema>

export function OrderForm() {
  const router = useRouter()
  const [suppliers, setSuppliers] = useState<{ id: number, name: string }[]>([])
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false) // loading for submit

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      code: "",
      supplierId: "",
      totalValue: "",
      observations: "",
    },
  })

  useEffect(() => {
    // Fetch suppliers on mount
    getSuppliers().then(data => {
      setSuppliers(data)
    })
  }, [])

  // Handle new supplier creation from Modal
  const handleCreateSupplier = async (data: any) => {
    await createSupplier({ name: data.name })
    const updatedSuppliers = await getSuppliers()
    setSuppliers(updatedSuppliers)

    // Auto-select the new supplier (find the one with highest ID roughly, or just created)
    // Since we sort by CreatedAt desc in action, it should be first
    if (updatedSuppliers.length > 0) {
      form.setValue("supplierId", updatedSuppliers[0].id.toString())
    }

    setIsSupplierDialogOpen(false)
  }

  async function onSubmit(data: OrderFormValues) {
    setIsLoading(true)
    try {
      await createOrder(data)
      router.push("/orders")
    } catch (error) {
      console.error("Failed to create order", error)
      // could allow error handling here
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Novo Pedido</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pedido System Code */}
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código do Pedido (Sistema Interno)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Supplier Select with Quick Add */}
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fornecedor</FormLabel>
                    <div className="flex gap-2">
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {suppliers.map((s) => (
                            <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Dialog open={isSupplierDialogOpen} onOpenChange={setIsSupplierDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon" type="button" title="Novo Fornecedor">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Novo Fornecedor</DialogTitle>
                            <DialogDescription>
                              Cadastre um novo fornecedor para usar neste pedido.
                            </DialogDescription>
                          </DialogHeader>
                          <SupplierForm onSubmit={handleCreateSupplier} />
                        </DialogContent>
                      </Dialog>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Value */}
            <FormField
              control={form.control}
              name="totalValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Total (R$)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0,00"
                      type="number"
                      step="0.01"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Apenas para referência e relatórios</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Observations */}
            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Alguma observação importante sobre este pedido?"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4 pt-4">
              <Button variant="outline" type="button" asChild>
                <Link href="/orders">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Lançar Pedido"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

