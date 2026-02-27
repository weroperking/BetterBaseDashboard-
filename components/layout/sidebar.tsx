"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Database,
  Users,
  FileText,
  Key,
  Settings,
  LogOut,
  Shield,
  Code2,
  Webhook,
  HardDrive,
  Cpu,
  Zap,
  Activity,
  ChevronDown,
  Menu,
  X,
} from "lucide-react"
import { useConnectionStore } from "@/lib/store"
import { useState } from "react"

// Main navigation items - following Supabase dashboard structure
const mainNavItems = [
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
    title: "Storage",
    href: "/dashboard/storage",
    icon: HardDrive,
  },
  {
    title: "Functions",
    href: "/dashboard/functions",
    icon: Cpu,
  },
  {
    title: "Webhooks",
    href: "/dashboard/webhooks",
    icon: Webhook,
  },
  {
    title: "Logs",
    href: "/dashboard/logs",
    icon: FileText,
  },
  {
    title: "Realtime",
    href: "/dashboard/realtime",
    icon: Zap,
  },
  {
    title: "GraphQL",
    href: "/dashboard/graphql",
    icon: Code2,
  },
  {
    title: "API",
    href: "/dashboard/api",
    icon: Key,
  },
]

// Settings nav item (separate for bottom placement)
const settingsNavItem = {
  title: "Settings",
  href: "/dashboard/settings",
  icon: Settings,
}

export function Sidebar() {
  const pathname = usePathname()
  const { getActive } = useConnectionStore()
  const activeConnection = getActive()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Check if a nav item is active
  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-md bg-surface-200 hover:bg-surface-300 transition-colors"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? (
          <X className="h-5 w-5 text-foreground" />
        ) : (
          <Menu className="h-5 w-5 text-foreground" />
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40",
          "flex h-screen w-64 flex-col",
          "bg-surface-100 border-r border-border",
          "transition-transform duration-200 ease-in-out",
          "lg:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo Section */}
        <div className="flex h-14 items-center border-b border-border px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand">
              <Database className="h-5 w-5 text-black" />
            </div>
            <span className="font-semibold text-lg text-foreground">BetterBase</span>
          </Link>
        </div>

        {/* Project Switcher */}
        {activeConnection && (
          <div className="border-b border-border p-3">
            <button className="w-full flex items-center justify-between rounded-md bg-surface-200 hover:bg-surface-300 px-3 py-2 transition-colors">
              <div className="flex flex-col items-start min-w-0">
                <span className="text-sm font-medium text-foreground truncate w-full">
                  {activeConnection.name}
                </span>
                <span className="text-xs text-foreground-light truncate w-full">
                  {activeConnection.url}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-foreground-light flex-shrink-0 ml-2" />
            </button>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          <div className="space-y-0.5">
            {mainNavItems.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-brand-200 text-foreground"
                      : "text-foreground-light hover:bg-surface-200 hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 flex-shrink-0",
                      active ? "text-brand-600" : "text-foreground-muted"
                    )}
                  />
                  <span className="truncate">{item.title}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Bottom Section - Settings and Project Switch */}
        <div className="border-t border-border p-3 space-y-1">
          {/* Settings Nav Item */}
          <Link
            href={settingsNavItem.href}
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive(settingsNavItem.href)
                ? "bg-brand-200 text-foreground"
                : "text-foreground-light hover:bg-surface-200 hover:text-foreground"
            )}
          >
            <settingsNavItem.icon
              className={cn(
                "h-4 w-4 flex-shrink-0",
                isActive(settingsNavItem.href) ? "text-brand-600" : "text-foreground-muted"
              )}
            />
            <span>{settingsNavItem.title}</span>
          </Link>

          {/* Switch Project Link */}
          <Link
            href="/connect"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground-light transition-colors hover:bg-surface-200 hover:text-foreground"
          >
            <LogOut className="h-4 w-4 text-foreground-muted flex-shrink-0" />
            <span>Switch Project</span>
          </Link>
        </div>
      </aside>
    </>
  )
}
