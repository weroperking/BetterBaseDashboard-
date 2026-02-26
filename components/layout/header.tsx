"use client"

import { useConnectionStore } from "@/lib/store"

interface HeaderProps {
  connection?: {
    name: string
    url: string
  }
}

export function Header({ connection: propConnection }: HeaderProps) {
  const { getActive } = useConnectionStore()
  const activeConnection = propConnection || getActive()

  return (
    <header className="flex h-14 items-center border-b bg-card px-6">
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center gap-4">
          {activeConnection && (
            <>
              <span className="text-sm font-medium">
                {activeConnection.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {activeConnection.url}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Connected
          </span>
          <span className="h-2 w-2 rounded-full bg-green-500" />
        </div>
      </div>
    </header>
  )
}