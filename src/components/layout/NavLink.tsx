"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface NavLinkProps {
    href: string
    icon: LucideIcon
    children: React.ReactNode
    count?: number
    variant?: "desktop" | "mobile"
}

export function NavLink({ href, icon: Icon, children, count, variant = "desktop" }: NavLinkProps) {
    const pathname = usePathname()
    const isActive = pathname === href || (href !== "/" && pathname.startsWith(href))

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
                <Icon className="h-5 w-5" />
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
            <Icon className="h-4 w-4" />
            <span className="flex-1">{children}</span>
            {count !== undefined && count > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/20 px-1.5 text-xs font-semibold text-primary">
                    {count > 99 ? "99+" : count}
                </span>
            )}
        </Link>
    )
}
