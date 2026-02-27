import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[6px] text-sm font-medium transition-all duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(36,180,126,0.2)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Primary: bg-accent-green, white text, no border
        primary: "bg-accent-green text-black hover:bg-accent-green-hover border-0",
        // Secondary: transparent bg, 1px border-default, white text
        secondary: "bg-transparent text-white border border-[#404040] hover:bg-[#2d2d2d] hover:border-[#505050]",
        // Ghost: transparent bg, no border, muted text
        ghost: "bg-transparent text-[#666666] border-0 hover:bg-[#2d2d2d] hover:text-[#a0a0a0]",
        // Danger: bg-danger, white text
        danger: "bg-status-danger text-white hover:bg-[#f87171] border-0",
        // Default maps to primary
        default: "bg-accent-green text-black hover:bg-accent-green-hover border-0",
        // Destructive alias for danger
        destructive: "bg-status-danger text-white hover:bg-[#f87171] border-0",
        // Outline maps to secondary
        outline: "bg-transparent text-white border border-[#404040] hover:bg-[#2d2d2d] hover:border-[#505050]",
        // Link maps to ghost
        link: "bg-transparent text-accent-green border-0 underline-offset-4 hover:underline",
        // Warning variant
        warning: "bg-status-warning text-black hover:bg-[#fcd34d] border-0",
      },
      size: {
        // Default: 36px height, 0 16px padding
        default: "h-[36px] px-4",
        // Small: 32px height
        sm: "h-8 px-3 text-xs",
        // Large: 40px height
        lg: "h-10 px-6",
        // Icon: 36px x 36px
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  icon?: React.ReactNode
  iconRight?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, icon, iconRight, children, disabled, ...props }, ref) => {
    const isDisabled = disabled || loading
    
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {!loading && icon && (
          <span className="mr-2 flex items-center">{icon}</span>
        )}
        {children}
        {!loading && iconRight && (
          <span className="ml-2 flex items-center">{iconRight}</span>
        )}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
