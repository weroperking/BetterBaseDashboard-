"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Database,
  Users,
  FileText,
  Key,
  Settings,
  ChevronLeft,
  LogOut,
} from "lucide-react"
import { useConnectionStore } from "@/lib/store"

const sidebarItems = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Tables",
    href: "/dashboard/tables",
    icon: Database,
  },
  {
    title: "Auth",
    href: "/dashboard/auth",
    icon: Users,
  },
  {
    title: "Logs",
    href: "/dashboard/logs",
    icon: FileText,
  },
  {
    title: "API",
    href: "/dashboard/api",
    icon: Key,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { getActive, setActive } = useConnectionStore()
  const activeConnection = getActive()

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-14 items-center border-b px-4">
        <span className="font-semibold text-lg">BetterBase</span>
      </div>

      {activeConnection && (
        <div className="border-b p-3">
          <div className="rounded-md bg-muted p-2">
            <p className="text-sm font-medium truncate">{activeConnection.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {activeConnection.url}
            </p>
          </div>
        </div>
      )}

      <nav className="flex-1 space-y-1 p-2">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-2">
        <Link
          href="/connect"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Switch Project
        </Link>
      </div>
    </div>
  )
}