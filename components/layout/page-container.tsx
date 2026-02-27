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
 * Supabase specifications:
 * - Max width: 1400px (centered)
 * - Padding: 24px
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
 * - "default": max-w-[1400px] centered (standard pages)
 */
export function PageContainer({
  children,
  className,
  size = "default",
}: PageContainerProps) {
  const sizeClasses = {
    full: "w-full max-w-full",
    constrained: "max-w-2xl mx-auto",
    default: "max-w-[1400px] mx-auto",
  }

  return (
    <div
      className={cn(
        "flex-1 py-6 px-6",
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
 * - Page title: 24px, 600 weight
 * - Optional description/subtitle: 14px, text-secondary
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
        <h1 className="text-2xl font-semibold text-white">{title}</h1>
        {subtitle && (
          <p className="text-sm text-[#a0a0a0]">{subtitle}</p>
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
        separator && "border-t border-[#333333] pt-6 mt-6",
        className
      )}
    >
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h2 className="text-lg font-medium text-white">{title}</h2>
          )}
          {description && (
            <p className="text-sm text-[#a0a0a0]">{description}</p>
          )}
        </div>
      )}
      <div>{children}</div>
    </div>
  )
}

/**
 * Card Component for grouping content
 * 
 * Standardized card container following Supabase design patterns.
 * Background: #2d2d2d (bg-input)
 * Border: 1px #333333
 * Border radius: 8px
 * Padding: 24px
 */
interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "bg-[#2d2d2d] border border-[#333333] rounded-lg p-6",
        className
      )}
    >
      {children}
    </div>
  )
}
