"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Search } from "lucide-react"
import { useConnectionStore } from "@/lib/store"

interface HeaderProps {
  title?: string
  subtitle?: string
  children?: ReactNode
  className?: string
  breadcrumbs?: Array<{
    label: string
    href?: string
  }>
  actions?: ReactNode
}

/**
 * Page Header Component
 * 
 * Standardized page header following Supabase design patterns:
 * - Page title with optional subtitle/description
 * - Optional breadcrumb navigation
 * - Optional right-side action buttons
 * 
 * Usage:
 * <Header 
 *   title="Tables" 
 *   subtitle="Manage your database tables"
 *   breadcrumbs={[{ label: "Database", href: "/dashboard" }, { label: "Tables" }]}
 *   actions={<Button>New Table</Button>}
 * />
 */
export function Header({
  title,
  subtitle,
  children,
  className,
  breadcrumbs,
  actions,
}: HeaderProps) {
  return (
    <header
      className={cn(
        "flex h-14 items-center justify-between px-6",
        "bg-[#1e1a1a] border-b border-[#333333]",
        className
      )}
    >
      {/* Left side - Title and Breadcrumbs */}
      <div className="flex flex-col gap-0.5 min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumb className="mb-1">
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <BreadcrumbItem key={index}>
                  {crumb.href ? (
                    <BreadcrumbLink 
                      href={crumb.href} 
                      className="text-xs text-[#a0a0a0] hover:text-white"
                    >
                      {crumb.label}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="text-xs text-white font-medium">
                      {crumb.label}
                    </BreadcrumbPage>
                  )}
                  {index < breadcrumbs.length - 1 && (
                    <BreadcrumbSeparator className="text-[#666666]" />
                  )}
                </BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
        
        {title && (
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-lg font-semibold text-white">{title}</h1>
              {subtitle && (
                <p className="text-sm text-[#a0a0a0]">{subtitle}</p>
              )}
            </div>
          </div>
        )}
        
        {children}
      </div>

      {/* Right side - Actions */}
      {actions && (
        <div className="flex items-center gap-2 ml-4">
          {actions}
        </div>
      )}
    </header>
  )
}

/**
 * Dashboard Shell Header
 * 
 * Header for the dashboard shell layout with search and connection status.
 * Following Supabase specifications:
 * - Height: 56px
 * - Background: #1e1a1a
 * - Border bottom: 1px #333333
 * - Search input: bg-input (#2d2d2d), 36px height, placeholder "Search..."
 */
export function DashboardHeader() {
  const { getActive } = useConnectionStore()
  const activeConnection = getActive()

  return (
    <header className="flex h-14 items-center justify-between px-6 bg-[#1e1a1a] border-b border-[#333333]">
      {/* Left side - Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666666]" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full h-9 pl-10 pr-4 bg-bg-input border border-border-default rounded-md text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent transition-colors"
        />
      </div>

      {/* Right side - Connection status and actions */}
      <div className="flex items-center gap-3 ml-4">
        {activeConnection && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#a0a0a0]">Connected to</span>
            <span className="text-xs font-medium text-white">{activeConnection.name}</span>
            <span className="h-2 w-2 rounded-full bg-accent-green" />
          </div>
        )}
      </div>
    </header>
  )
}
