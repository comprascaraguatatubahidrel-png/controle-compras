"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShoppingCart, AlertTriangle, FileX, Ban, Truck, Users, Package, Menu, Layers, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"
import { GlobalSearch } from "@/components/layout/GlobalSearch"

interface MenuCounts {
    orders: number
    waitingShipment: number
    waitingMirror: number
    arrivingToday: number
    refusedInvoices: number
    cancelledOrders: number
    pendingBalance: number
    feedingOrders: number
}

interface AppLayoutClientProps {
    children: React.ReactNode
    counts: MenuCounts
}

interface NavItemProps {
    href: string
    icon: React.ReactNode
    children: React.ReactNode
    count?: number
    variant?: "desktop" | "mobile"
    isActive?: boolean
}

function NavItem({ href, icon, children, count, variant = "desktop", isActive }: NavItemProps) {
    if (variant === "mobile") {
        return (
            <Link
                href={href}
                className={cn(
                    "mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 transition-all",
                    isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                )}
            >
                {icon}
                <span className="flex-1">{children}</span>
                {count !== undefined && count > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/20 px-1.5 text-xs font-semibold text-primary">
                        {count > 99 ? "99+" : count}
                    </span>
                )}
            </Link>
        )
    }

    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                isActive
                    ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary"
                    : "text-muted-foreground hover:text-primary"
            )}
        >
            {icon}
            <span className="flex-1">{children}</span>
            {count !== undefined && count > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/20 px-1.5 text-xs font-semibold text-primary">
                    {count > 99 ? "99+" : count}
                </span>
            )}
        </Link>
    )
}

export function AppLayoutClient({ children, counts }: AppLayoutClientProps) {
    const pathname = usePathname()

    const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href))

    const navItems = [
        { href: "/", icon: <LayoutDashboard className="h-4 w-4" />, iconMobile: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard", count: undefined },
        { href: "/orders", icon: <ShoppingCart className="h-4 w-4" />, iconMobile: <ShoppingCart className="h-5 w-5" />, label: "Todos Pedidos", count: counts.orders },
        { href: "/waiting-shipment", icon: <Package className="h-4 w-4 text-gray-500" />, iconMobile: <Package className="h-5 w-5 text-gray-500" />, label: "Aguardando Envio", count: counts.waitingShipment },
        { href: "/feeding-orders", icon: <Layers className="h-4 w-4 text-teal-500" />, iconMobile: <Layers className="h-5 w-5 text-teal-500" />, label: "Alimentando", count: counts.feedingOrders },
        { href: "/waiting-mirror", icon: <Clock className="h-4 w-4 text-blue-500" />, iconMobile: <Clock className="h-5 w-5 text-blue-500" />, label: "Aguardando Espelho", count: counts.waitingMirror },
        { href: "/arriving-today", icon: <Package className="h-4 w-4 text-purple-500" />, iconMobile: <Package className="h-5 w-5 text-purple-500" />, label: "Chega Hoje", count: counts.arrivingToday },
        { href: "/pending-balance", icon: <AlertTriangle className="h-4 w-4 text-amber-500" />, iconMobile: <AlertTriangle className="h-5 w-5 text-amber-500" />, label: "Saldos Pendentes", count: counts.pendingBalance },
        { href: "/refused-invoices", icon: <FileX className="h-4 w-4" />, iconMobile: <FileX className="h-5 w-5" />, label: "NFs Recusadas", count: counts.refusedInvoices },
        { href: "/cancelled-orders", icon: <Ban className="h-4 w-4" />, iconMobile: <Ban className="h-5 w-5" />, label: "Pedidos Cancelados", count: counts.cancelledOrders },
        { href: "/suppliers", icon: <Truck className="h-4 w-4" />, iconMobile: <Truck className="h-5 w-5" />, label: "Fornecedores", count: undefined },
        { href: "/representatives", icon: <Users className="h-4 w-4" />, iconMobile: <Users className="h-5 w-5" />, label: "Representantes", count: undefined },
        { href: "/analytics", icon: <LayoutDashboard className="h-4 w-4 text-emerald-500" />, iconMobile: <LayoutDashboard className="h-5 w-5" />, label: "Relatórios", count: undefined },
    ]

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-muted/40 md:block">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                        <Link href="/" className="flex items-center gap-2 font-semibold">
                            <Package className="h-6 w-6" />
                            <span className="">Gestão de Compras</span>
                        </Link>
                    </div>
                    <div className="flex-1">
                        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                            {navItems.map((item) => (
                                <NavItem
                                    key={item.href}
                                    href={item.href}
                                    icon={item.icon}
                                    count={item.count}
                                    isActive={isActive(item.href)}
                                >
                                    {item.label}
                                </NavItem>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>
            <div className="flex flex-col min-w-0">
                <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="shrink-0 md:hidden"
                            >
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col">
                            <nav className="grid gap-2 text-lg font-medium">
                                <Link
                                    href="/"
                                    className="flex items-center gap-2 text-lg font-semibold"
                                >
                                    <Package className="h-6 w-6" />
                                    <span className="sr-only">Gestão de Compras</span>
                                </Link>
                                {navItems.map((item) => (
                                    <NavItem
                                        key={item.href}
                                        href={item.href}
                                        icon={item.iconMobile}
                                        count={item.count}
                                        variant="mobile"
                                        isActive={isActive(item.href)}
                                    >
                                        {item.label}
                                    </NavItem>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>
                    <div className="w-full flex-1">
                        <GlobalSearch />
                    </div>
                    <ModeToggle />
                    <Button variant="secondary" size="icon" className="rounded-full">
                        <div className="h-5 w-5 rounded-full bg-primary" />
                        <span className="sr-only">Toggle user menu</span>
                    </Button>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
