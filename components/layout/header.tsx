"use client"

import { ReactNode, useState, useEffect, useRef, useCallback } from "react"
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
import { Search, X, Table2, Webhook, Database, HardDrive, Key, Shield, FileCode, Users } from "lucide-react"
import { useConnectionStore } from "@/lib/store"
import Link from "next/link"

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
 * Search result item type
 */
type SearchResultType = 'table' | 'function' | 'webhook' | 'storage' | 'auth' | 'api' | 'rls' | 'realtime' | 'graphql' | 'logs' | 'settings' | 'extensions'

interface SearchResult {
  id: string
  title: string
  description: string
  type: SearchResultType
  href: string
}

/**
 * Mock search data - In a real app, this would come from the API
 * This provides searchable items across the dashboard
 */
const getSearchableItems = (): SearchResult[] => [
  // Tables
  { id: 'table-users', title: 'users', description: 'User accounts table', type: 'table', href: '/dashboard/tables/users' },
  { id: 'table-posts', title: 'posts', description: 'Blog posts table', type: 'table', href: '/dashboard/tables/posts' },
  { id: 'table-comments', title: 'comments', description: 'Post comments table', type: 'table', href: '/dashboard/tables/comments' },
  { id: 'table-profiles', title: 'profiles', description: 'User profiles table', type: 'table', href: '/dashboard/tables/profiles' },
  { id: 'table-orders', title: 'orders', description: 'Customer orders table', type: 'table', href: '/dashboard/tables/orders' },
  // Functions
  { id: 'func-send-email', title: 'send-email', description: 'Edge function', type: 'function', href: '/dashboard/functions/send-email' },
  { id: 'func-process-payment', title: 'process-payment', description: 'Edge function', type: 'function', href: '/dashboard/functions/process-payment' },
  { id: 'func-webhook-handler', title: 'webhook-handler', description: 'Edge function', type: 'function', href: '/dashboard/functions/webhook-handler' },
  // Webhooks
  { id: 'webhook-user-created', title: 'user-created', description: 'Triggers on new user', type: 'webhook', href: '/dashboard/webhooks' },
  { id: 'webhook-order-placed', title: 'order-placed', description: 'Triggers on new order', type: 'webhook', href: '/dashboard/webhooks' },
  // Storage
  { id: 'storage-avatars', title: 'avatars', description: 'Storage bucket', type: 'storage', href: '/dashboard/storage' },
  { id: 'storage-assets', title: 'assets', description: 'Storage bucket', type: 'storage', href: '/dashboard/storage' },
  { id: 'storage-uploads', title: 'uploads', description: 'Storage bucket', type: 'storage', href: '/dashboard/storage' },
  // Auth
  { id: 'auth-users', title: 'Users', description: 'Authentication users', type: 'auth', href: '/dashboard/auth' },
  { id: 'auth-providers', title: 'Providers', description: 'Auth providers', type: 'auth', href: '/dashboard/auth/providers' },
  { id: 'auth-settings', title: 'Settings', description: 'Auth settings', type: 'auth', href: '/dashboard/auth/settings' },
  // API
  { id: 'api-keys', title: 'API Keys', description: 'Manage API keys', type: 'api', href: '/dashboard/api' },
  // RLS
  { id: 'rls-policies', title: 'RLS Policies', description: 'Row level security', type: 'rls', href: '/dashboard/rls' },
  // Realtime
  { id: 'realtime', title: 'Realtime', description: 'Realtime subscriptions', type: 'realtime', href: '/dashboard/realtime' },
  // GraphQL
  { id: 'graphql', title: 'GraphQL', description: 'GraphQL schema', type: 'graphql', href: '/dashboard/graphql' },
  // Logs
  { id: 'logs', title: 'Logs', description: 'Application logs', type: 'logs', href: '/dashboard/logs' },
  // Settings
  { id: 'settings', title: 'Settings', description: 'Project settings', type: 'settings', href: '/dashboard/settings' },
  // Extensions
  { id: 'extensions', title: 'Extensions', description: 'Database extensions', type: 'extensions', href: '/dashboard/extensions' },
]

const getTypeIcon = (type: SearchResultType) => {
  switch (type) {
    case 'table':
      return <Table2 className="h-4 w-4" />
    case 'function':
      return <FileCode className="h-4 w-4" />
    case 'webhook':
      return <Webhook className="h-4 w-4" />
    case 'storage':
      return <HardDrive className="h-4 w-4" />
    case 'auth':
      return <Users className="h-4 w-4" />
    case 'api':
      return <Key className="h-4 w-4" />
    case 'rls':
      return <Shield className="h-4 w-4" />
    default:
      return <Database className="h-4 w-4" />
  }
}

const getTypeLabel = (type: SearchResultType) => {
  switch (type) {
    case 'table': return 'Table'
    case 'function': return 'Function'
    case 'webhook': return 'Webhook'
    case 'storage': return 'Storage'
    case 'auth': return 'Auth'
    case 'api': return 'API'
    case 'rls': return 'RLS'
    case 'realtime': return 'Realtime'
    case 'graphql': return 'GraphQL'
    case 'logs': return 'Logs'
    case 'settings': return 'Settings'
    case 'extensions': return 'Extensions'
    default: return 'Other'
  }
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
  
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  // Filter search results based on query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setIsLoading(true)
    const query = searchQuery.toLowerCase()
    const allItems = getSearchableItems()
    
    // Filter items that match the query
    const filtered = allItems.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    ).slice(0, 10) // Limit to 10 results

    setSearchResults(filtered)
    setIsLoading(false)
  }, [searchQuery])

  // Handle Ctrl+K (or Cmd+K on Mac) keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
        setIsSearchOpen(true)
      }
      
      // Close search on Escape
      if (e.key === 'Escape') {
        setIsSearchOpen(false)
        searchInputRef.current?.blur()
        setSearchQuery('')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setIsSearchOpen(true)
  }

  const handleResultClick = useCallback(() => {
    setSearchQuery('')
    setIsSearchOpen(false)
    searchInputRef.current?.blur()
  }, [])

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    searchInputRef.current?.focus()
  }

  return (
    <header className="flex h-14 items-center justify-between px-6 bg-[#1e1a1a] border-b border-[#333333]">
      {/* Left side - Search */}
      <div className="relative flex-1 max-w-md" ref={searchContainerRef}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666666]" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search tables, functions, webhooks..."
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => setIsSearchOpen(true)}
          className="w-full h-9 pl-10 pr-10 bg-[#2d2d2d] border border-[#444444] rounded-md text-sm text-white placeholder:text-[#666666] focus:outline-none focus:ring-2 focus:ring-[#3ecf8e] focus:border-transparent transition-colors"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {/* Keyboard shortcut hint */}
        {!searchQuery && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-[#444444] bg-[#333333] px-1.5 font-mono text-[10px] font-medium text-[#888888] opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        )}
        
        {/* Search Results Dropdown */}
        {isSearchOpen && searchQuery && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#2e2e2e] border border-[#444444] rounded-lg shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-[#a0a0a0] text-sm">Searching...</div>
            ) : searchResults.length > 0 ? (
              <div className="py-2">
                <div className="px-3 py-1.5 text-xs text-[#666666] font-medium uppercase tracking-wide">
                  Results
                </div>
                {searchResults.map((result) => (
                  <Link
                    key={result.id}
                    href={result.href}
                    onClick={handleResultClick}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#3a3a3a] transition-colors group"
                  >
                    <div className="flex-shrink-0 text-[#888888] group-hover:text-white">
                      {getTypeIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white font-medium truncate group-hover:text-[#3ecf8e]">
                        {result.title}
                      </div>
                      <div className="text-xs text-[#888888] truncate">
                        {result.description}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#333333] text-[#a0a0a0]">
                        {getTypeLabel(result.type)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-[#a0a0a0] text-sm">
                No results found for "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right side - Connection status and actions */}
      <div className="flex items-center gap-3 ml-4">
        {activeConnection && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#a0a0a0]">Connected to</span>
            <span className="text-xs font-medium text-white">{activeConnection.name}</span>
            <span className="h-2 w-2 rounded-full bg-[#3ecf8e]" />
          </div>
        )}
      </div>
    </header>
  )
}
