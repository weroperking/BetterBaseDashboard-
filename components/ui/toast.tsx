"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

// Variant type
type ToastVariant = "default" | "destructive" | "success" | "warning" | "info"

// Get variant class names
function getToastVariantClass(variant: ToastVariant = "default"): string {
  const variants = {
    // Default: bg-tertiary, border-default
    default: "border-[#404040] bg-[#222222] text-white",
    // Destructive: danger styling
    destructive: "border-status-danger bg-[rgba(248,113,113,0.1)] text-status-danger group-[.destructive]:border-status-danger/30 group-[.destructive]:bg-[rgba(248,113,113,0.1)]",
    // Success: green styling
    success: "border-accent-green bg-accent-green-muted text-accent-green",
    // Warning: warning styling
    warning: "border-status-warning bg-[rgba(245,158,11,0.1)] text-status-warning",
    // Info: info styling
    info: "border-[#3b82f6] bg-[rgba(59,130,246,0.1)] text-[#3b82f6]",
  }
  return variants[variant]
}

export interface ToastProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> {
  variant?: ToastVariant
}

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  ToastProps
>(({ className, variant = "default", ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(
        // Base styling
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-[6px] border p-4 pr-8 transition-all",
        // Animation
        "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
        // Variant
        getToastVariantClass(variant),
        className
      )}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      // Button styling
      "inline-flex h-8 shrink-0 items-center justify-center rounded-[6px] border border-[#404040] bg-transparent px-3 text-sm font-medium transition-colors",
      // Focus
      "focus:outline-none focus:ring-2 focus:ring-[rgba(36,180,126,0.2)] focus:ring-offset-2 focus:ring-offset-[#222222]",
      // Disabled
      "disabled:pointer-events-none disabled:opacity-50",
      // Hover
      "hover:bg-[#2d2d2d]",
      // Destructive variants
      "group-[.destructive]:border-[#404040]/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-[rgba(239,68,68,0.1)] group-[.destructive]:hover:text-[#ef4444] group-[.destructive]:focus:ring-[#ef4444]",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      // Position
      "absolute right-2 top-2 rounded-md p-1",
      // Text color
      "text-[#a0a0a0]",
      // Opacity
      "opacity-0 transition-opacity",
      // Hover
      "hover:text-white",
      // Focus
      "focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-[rgba(36,180,126,0.2)]",
      // Show on group hover
      "group-hover:opacity-100",
      // Destructive
      "group-[.destructive]:text-[#ef4444] group-[.destructive]:hover:text-[#ef4444] group-[.destructive]:focus:ring-[#ef4444] group-[.destructive]:focus:ring-offset-[#222222]",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold text-white", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    // Font size: 14px, color: text-secondary (#a0a0a0)
    className={cn("text-sm text-[#a0a0a0]", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

export type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
