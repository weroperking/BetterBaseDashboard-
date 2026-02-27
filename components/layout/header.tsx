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
        "flex h-14 items-center justify-between border-b border-border bg-surface-100 px-6",
        className
      )}
    >
      {/* Left side - Title and Breadcrumbs */}
      <div className="flex flex-col gap-0.5">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumb className="mb-1">
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <BreadcrumbItem key={index}>
                  {crumb.href ? (
                    <BreadcrumbLink href={crumb.href} className="text-xs text-foreground-light hover:text-foreground">
                      {crumb.label}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="text-xs text-foreground font-medium">
                      {crumb.label}
                    </BreadcrumbPage>
                  )}
                  {index < breadcrumbs.length - 1 && (
                    <BreadcrumbSeparator className="text-foreground-muted" />
                  )}
                </BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
        
        {title && (
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-lg font-semibold text-foreground">{title}</h1>
              {subtitle && (
                <p className="text-sm text-foreground-light">{subtitle}</p>
              )}
            </div>
          </div>
        )}
        
        {children}
      </div>

      {/* Right side - Actions */}
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </header>
  )
}

/**
 * Simplified Header for Dashboard Shell
 * Shows connection status and minimal info
 */
export function DashboardHeader() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface-100 px-6">
      <div className="flex items-center gap-2 lg:hidden">
        {/* Spacer for mobile menu button */}
        <div className="w-8" />
      </div>
      
      <div className="flex items-center gap-2 ml-auto">
        <span className="text-xs text-foreground-light">Connected</span>
        <span className="h-2 w-2 rounded-full bg-brand" />
      </div>
    </header>
  )
}
