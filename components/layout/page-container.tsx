import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PageContainerProps {
  children: ReactNode
  className?: string
  size?: "full" | "constrained" | "default"
}

/**
 * Page Container Component
 * 
 * The outermost container for dashboard pages following Supabase design patterns.
 * Provides consistent max-width, padding, and vertical spacing.
 * 
 * Usage:
 * <PageContainer>
 *   <PageHeader ... />
 *   <PageSection>...</PageSection>
 * </PageContainer>
 * 
 * Sizes:
 * - "full": Full width with consistent padding (for data tables)
 * - "constrained": max-w-2xl centered (for settings pages, forms)
 * - "default": max-w-7xl centered (standard pages)
 */
export function PageContainer({
  children,
  className,
  size = "default",
}: PageContainerProps) {
  const sizeClasses = {
    full: "w-full",
    constrained: "max-w-2xl mx-auto",
    default: "max-w-7xl mx-auto",
  }

  return (
    <div
      className={cn(
        "flex-1 py-6 px-4 sm:px-6 lg:px-8",
        sizeClasses[size],
        className
      )}
    >
      {children}
    </div>
  )
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  className?: string
  actions?: ReactNode
}

/**
 * Page Header Component (for use within PageContainer)
 * 
 * Standardized page header with:
 * - Page title
 * - Optional description/subtitle
 * - Optional right-side action buttons
 * 
 * Usage:
 * <PageHeader
 *   title="Table Editor"
 *   subtitle="Create, edit, and delete your database tables."
 *   actions={<Button>New table</Button>}
 * />
 */
export function PageHeader({
  title,
  subtitle,
  className,
  actions,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 pb-6",
        className
      )}
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-sm text-foreground-light">{subtitle}</p>
        )}
      </div>
      
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  )
}

interface PageSectionProps {
  title?: string
  description?: string
  children: ReactNode
  className?: string
  separator?: boolean
}

/**
 * Page Section Component
 * 
 * Groups related content within a page with proper spacing and optional separators.
 * Provides consistent title, description, and content area.
 * 
 * Usage:
 * <PageSection
 *   title="General Settings"
 *   description="Manage your project name and other general settings."
 *   separator
 * >
 *   <form>...</form>
 * </PageSection>
 */
export function PageSection({
  title,
  description,
  children,
  className,
  separator = false,
}: PageSectionProps) {
  return (
    <div
      className={cn(
        "space-y-4",
        separator && "border-t border-border pt-6 mt-6",
        className
      )}
    >
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h2 className="text-lg font-medium text-foreground">{title}</h2>
          )}
          {description && (
            <p className="text-sm text-foreground-light">{description}</p>
          )}
        </div>
      )}
      <div>{children}</div>
    </div>
  )
}
