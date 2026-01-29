import { getMenuCounts } from "@/actions/menu-counts"
import { AppLayoutClient } from "./AppLayoutClient"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const counts = await getMenuCounts()

    return <AppLayoutClient counts={counts}>{children}</AppLayoutClient>
}
