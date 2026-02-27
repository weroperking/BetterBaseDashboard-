import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Height: 36px
          "h-[36px] w-full rounded-[6px]",
          // Background: bg-input
          "bg-bg-input",
          // Border: 1px solid border-default
          "border border-border-default",
          // Padding: 0 12px
          "px-3 py-0",
          // Text: text-primary
          "text-sm text-text-primary",
          // Placeholder: text-muted
          "placeholder:text-text-muted",
          // Focus: border-accent-green, focus ring
          "focus:outline-none focus:border-accent-green focus:ring-2 focus:ring-accent-green-muted focus:ring-offset-2 focus:ring-offset-bg-primary",
          // Disabled states
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Transition
          "transition-colors duration-150 ease-in-out",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          // Min height: 80px
          "flex min-h-[80px] w-full rounded-[6px]",
          // Background: bg-input
          "bg-bg-input",
          // Border: 1px solid border-default
          "border border-border-default",
          // Padding: 12px
          "px-3 py-2",
          // Text: text-primary
          "text-sm text-text-primary",
          // Placeholder: text-muted
          "placeholder:text-text-muted",
          // Focus: border-accent-green, focus ring
          "focus:outline-none focus:border-accent-green focus:ring-2 focus:ring-accent-green-muted focus:ring-offset-2 focus:ring-offset-bg-primary",
          // Disabled states
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Transition
          "transition-colors duration-150 ease-in-out resize-y",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Input, Textarea }
