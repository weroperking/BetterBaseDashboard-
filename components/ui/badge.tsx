import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  // Base: inline-flex, height 22px, padding 4px 8px, border-radius 4px, font 12px 500
  "inline-flex items-center rounded-[4px] px-2 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(36,180,126,0.2)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a]",
  {
    variants: {
      variant: {
        // Default: bg-input, text-secondary
        default: "bg-[#2d2d2d] text-[#a0a0a0]",
        // Success: bg accent-green-muted, text-accent-green
        success: "bg-accent-green-muted text-accent-green",
        // Warning: bg #f59e0b22, text-warning
        warning: "bg-[rgba(245,158,11,0.13)] text-status-warning",
        // Danger: bg #f8717122, text-danger
        danger: "bg-[rgba(248,113,113,0.13)] text-status-danger",
        // Info: bg #3b82f622, text-info
        info: "bg-[rgba(59,130,246,0.13)] text-[#3b82f6]",
        // Brand: bg accent-green-muted, text-accent-green
        brand: "bg-accent-green-muted text-accent-green",
        // Secondary variant
        secondary: "bg-[#2d2d2d] text-[#a0a0a0]",
        // Outline variant
        outline: "bg-transparent border border-[#404040] text-[#a0a0a0]",
        // Destructive alias for danger
        destructive: "bg-[rgba(248,113,113,0.13)] text-status-danger",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
