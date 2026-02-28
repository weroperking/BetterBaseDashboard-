"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutGrid,
  Home,
  Database,
  Grid3X3,
  Code,
  Shield,
  Package,
  Users,
  User,
  Key,
  Settings,
  HardDrive,
  Zap,
  Webhook,
  Activity,
  FileText,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  LogOut,
  ChevronLeft,
} from "lucide-react"
import { useConnectionStore } from "@/lib/store"
import { useState, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Navigation structure following Supabase specifications
interface NavItem {
  title: string
  href?: string
  icon: React.ElementType
  children?: NavItem[]
}

// Main navigation items
const navigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Database",
    icon: Database,
    children: [
      { title: "Tables", href: "/dashboard/tables", icon: Grid3X3 },
      { title: "SQL Editor", href: "/dashboard/sql", icon: Code },
      { title: "GraphQL", href: "/dashboard/graphql", icon: Zap },
      { title: "RLS", href: "/dashboard/rls", icon: Shield },
      { title: "Extensions", href: "/dashboard/extensions", icon: Package },
    ],
  },
  {
    title: "Authentication",
    icon: Users,
    children: [
      { title: "Users", href: "/dashboard/auth", icon: User },
      { title: "Providers", href: "/dashboard/auth/providers", icon: Key },
      { title: "Settings", href: "/dashboard/auth/settings", icon: Settings },
    ],
  },
  {
    title: "Storage",
    href: "/dashboard/storage",
    icon: HardDrive,
  },
  {
    title: "Edge Functions",
    href: "/dashboard/functions",
    icon: Zap,
  },
  {
    title: "Webhooks",
    href: "/dashboard/webhooks",
    icon: Webhook,
  },
  {
    title: "API Settings",
    href: "/dashboard/api",
    icon: Key,
  },
  {
    title: "Realtime",
    href: "/dashboard/realtime",
    icon: Activity,
  },
  {
    title: "Logs",
    href: "/dashboard/logs",
    icon: FileText,
  },
]

// Settings at bottom
const settingsItem: NavItem = {
  title: "Settings",
  href: "/dashboard/settings",
  icon: Settings,
}

export function Sidebar() {
  const pathname = usePathname()
  const { getActive, connections, setActive } = useConnectionStore()
  const activeConnection = getActive()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Check if a nav item is active - must be defined before use in useState
  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    // Expand groups that have active children
    navigation
      .filter((item) => item.children?.some((child) => isActive(child.href || "")))
      .map((item) => item.title)
  )

  // Prevent hydration mismatch - must be after all useState calls
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // Toggle group expansion
  const toggleGroup = (title: string) => {
    setExpandedGroups((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    )
  }

  // Render navigation item
  const renderNavItem = (item: NavItem, level: number = 0) => {
    const isGroup = item.children && item.children.length > 0
    const isExpanded = expandedGroups.includes(item.title)
    const hasActiveChild = item.children?.some((child) => isActive(child.href || ""))
    const itemActive = isActive(item.href || "")

    if (isGroup) {
      return (
        <div key={item.title}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleGroup(item.title)
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors",
              "text-[#a0a0a0] hover:text-white hover:bg-[#252525]",
              hasActiveChild && "text-white"
            )}
            style={{ paddingLeft: `${12 + level * 16}px` }}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left truncate">{item.title}</span>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </>
            )}
          </button>
          {!collapsed && isExpanded && (
            <div className="mt-0.5">
              {item.children!.map((child) => renderNavItem(child, level + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link
        key={item.href}
        href={item.href || "#"}
        className={cn(
          "flex items-center gap-3 transition-colors relative",
          "text-[#a0a0a0] hover:text-white hover:bg-[#252525]",
          itemActive && "text-white bg-[#2d2d2d]",
          collapsed && "justify-center px-0"
        )}
        style={{
          paddingLeft: collapsed ? '0px' : `${12 + level * 16}px`,
          paddingRight: collapsed ? '0px' : '12px',
          height: '40px',
        }}
      >
        {/* Active indicator - 2px left border */}
        {itemActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-[24px] bg-accent-green" />
        )}
        <item.icon className={cn(
          "h-5 w-5 flex-shrink-0",
          collapsed && "mx-auto"
        )} />
        {!collapsed && <span className="truncate text-sm">{item.title}</span>}
      </Link>
    )
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-md bg-[#2d2d2d] hover:bg-[#363636] transition-colors"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? (
          <X className="h-5 w-5 text-white" />
        ) : (
          <Menu className="h-5 w-5 text-white" />
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
        onClick={() => !mobileMenuOpen && setCollapsed(!collapsed)}
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40",
          "flex flex-col",
          "bg-[#1e1e1e] border-r border-[#333333]",
          "transition-all duration-200 ease-in-out",
          "lg:translate-x-0",
          collapsed ? "w-16" : "w-[280px]",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "cursor-pointer"
        )}
      >
        {/* Logo Section - Height 56px */}
        <div className={cn(
          "flex items-center border-b border-[#333333]",
          collapsed ? "justify-center px-2" : "px-4"
        )}>
          <Link href="/dashboard" className="flex items-center gap-3 py-[14px]">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-green">
              <LayoutGrid className="h-5 w-5 text-black" />
            </div>
            {!collapsed && (
              <span className="font-semibold text-lg text-white">BetterBase</span>
            )}
          </Link>
          {/* Collapse toggle button - styled blue like settings button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setCollapsed(!collapsed)
            }}
            className={cn(
              "hidden lg:flex items-center justify-center p-1.5 rounded-md transition-colors ml-auto",
              collapsed 
                ? "absolute -right-3 top-6 bg-blue-600 hover:bg-blue-700 shadow-md" 
                : "bg-blue-600 hover:bg-blue-700"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft className={cn(
              "h-4 w-4 text-white transition-transform",
              collapsed && "rotate-180"
            )} />
          </button>
        </div>

        {/* Project Switcher */}
        {!collapsed && activeConnection && (
          <div className="border-b border-[#333333] p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center justify-between rounded-md bg-[#2d2d2d] hover:bg-[#363636] px-3 py-2 transition-colors">
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-sm font-medium text-white truncate w-full">
                      {activeConnection.name}
                    </span>
                    <span className="text-xs text-[#a0a0a0] truncate w-full">
                      {activeConnection.url}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-[#a0a0a0] flex-shrink-0 ml-2" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[248px]" align="start" sideOffset={4}>
                <div className="px-2 py-1.5 text-xs font-semibold text-[#a0a0a0]">
                  Available Projects
                </div>
                {connections.map((connection) => (
                  <DropdownMenuItem
                    key={connection.id}
                    onClick={() => setActive(connection.id)}
                    className={cn(
                      "flex flex-col items-start cursor-pointer",
                      connection.id === activeConnection?.id && "bg-[#404040]"
                    )}
                  >
                    <span className="text-sm font-medium text-white">
                      {connection.name}
                    </span>
                    <span className="text-xs text-[#a0a0a0]">
                      {connection.url}
                    </span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/connect"
                    className="w-full cursor-pointer text-sm text-[#a0a0a0] hover:text-white"
                  >
                    Add New Project
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Collapsed project indicator */}
        {collapsed && activeConnection && (
          <div className="border-b border-[#333333] p-2 flex justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#2d2d2d]">
              <span className="text-xs font-medium text-white">
                {activeConnection.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <nav className={cn(
          "flex-1 overflow-y-auto py-3",
          collapsed ? "px-1" : "px-3"
        )}>
          <div className="space-y-0.5">
            {navigation.map((item) => renderNavItem(item))}
          </div>
        </nav>

        {/* Bottom Section - Settings and Project Switch */}
        <div className={cn(
          "border-t border-[#333333]",
          collapsed ? "p-1" : "p-3"
        )}>
          {/* Settings Nav Item */}
          {renderNavItem(settingsItem)}
        </div>
      </aside>
    </>
  )
}
