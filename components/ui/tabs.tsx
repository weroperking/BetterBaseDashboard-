"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      // Supabase tabs styling
      "inline-flex h-[36px] items-center justify-start gap-1 rounded-[6px] bg-transparent p-0 text-[#a0a0a0]",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      // Tab height: 36px
      // Tab padding: 0 16px
      "h-[36px] px-4",
      // Font: 14px, 500 weight
      "text-sm font-medium",
      // Inactive: no border, text-secondary
      "text-[#a0a0a0]",
      // No background by default
      "bg-transparent",
      // Border: none for inactive
      "border-b-0",
      // Transition
      "transition-all duration-150 ease-in-out",
      // Focus outline
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(36,180,126,0.2)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a]",
      // Disabled
      "disabled:pointer-events-none disabled:opacity-50",
      // Hover: bg-input (#2d2d2d)
      "hover:bg-[#2d2d2d] hover:text-white",
      // Active state: bottom border 2px accent-green, text-primary
      "data-[state=active]:bg-transparent data-[state=active]:text-text-primary data-[state=active]:border-b-2 data-[state=active]:border-accent-green",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      // Focus and animation styles
      "mt-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(36,180,126,0.2)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a]",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
