"use client"

import { Package, Database, Search, Sparkles, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"
import { PageContainer, PageHeader } from "@/components/layout/page-container"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ExtensionsPage() {
  return (
    <PageContainer size="full">
      <PageHeader 
        title="Database Extensions" 
        subtitle="Extend your database with powerful PostgreSQL extensions"
      />
      
      <Card className="max-w-2xl mx-auto mt-8">
        <CardContent className="flex flex-col items-center justify-center py-16 px-8">
          {/* Icon Container */}
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#3b82f6]/20 to-[#8b5cf6]/20 border border-[#3b82f6]/30 flex items-center justify-center mb-6">
            <Clock className="h-10 w-10 text-[#3b82f6]" />
          </div>
          
          {/* Coming Soon Badge */}
          <Badge 
            variant="outline" 
            className="mb-4 px-4 py-1 text-sm font-medium border-[#3b82f6]/50 text-[#3b82f6] bg-[#3b82f6]/10"
          >
            Coming Soon
          </Badge>
          
          {/* Main Title */}
          <h2 className="text-2xl font-semibold text-white mb-3 text-center">
            Database Extensions
          </h2>
          
          {/* Description */}
          <p className="text-[#a0a0a0] text-center max-w-md mb-8">
            We're building a powerful extension management system to enhance your database capabilities. 
            Soon you'll be able to enable and manage PostgreSQL extensions with a single click.
          </p>
          
          {/* Features Preview */}
          <div className="grid gap-4 w-full max-w-lg">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-[#222222] border border-[#333333]">
              <div className="h-8 w-8 rounded-md bg-[#3b82f6]/10 flex items-center justify-center flex-shrink-0">
                <Database className="h-4 w-4 text-[#3b82f6]" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">Popular Extensions</h3>
                <p className="text-xs text-[#a0a0a0] mt-1">
                  Enable popular extensions like PostGIS, pgvector, uuid-ossp, and more with one click
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 rounded-lg bg-[#222222] border border-[#333333]">
              <div className="h-8 w-8 rounded-md bg-[#8b5cf6]/10 flex items-center justify-center flex-shrink-0">
                <Search className="h-4 w-4 text-[#8b5cf6]" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">Extension Browser</h3>
                <p className="text-xs text-[#a0a0a0] mt-1">
                  Browse and search available extensions with descriptions and version information
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 rounded-lg bg-[#222222] border border-[#333333]">
              <div className="h-8 w-8 rounded-md bg-[#10b981]/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-4 w-4 text-[#10b981]" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">One-Click Activation</h3>
                <p className="text-xs text-[#a0a0a0] mt-1">
                  Enable or disable extensions instantly without needing to manage database credentials
                </p>
              </div>
            </div>
          </div>
          
          {/* Stay Tuned Message */}
          <div className="mt-8 pt-6 border-t border-[#333333] w-full text-center">
            <p className="text-sm text-[#666666]">
              This feature is under active development. Stay tuned for updates!
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Alternative: Suggest checking other pages */}
      <div className="mt-8 text-center">
        <p className="text-sm text-[#666666] mb-4">
          In the meantime, explore other database features:
        </p>
        <div className="flex justify-center gap-3 flex-wrap">
          <Link 
            href="/dashboard/tables" 
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-[#a0a0a0] hover:text-white bg-[#222222] hover:bg-[#2d2d2d] border border-[#333333] rounded-md transition-colors"
          >
            <Database className="h-4 w-4" />
            Tables
            <ArrowRight className="h-3 w-3" />
          </Link>
          <Link 
            href="/dashboard/sql" 
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-[#a0a0a0] hover:text-white bg-[#222222] hover:bg-[#2d2d2d] border border-[#333333] rounded-md transition-colors"
          >
            <Package className="h-4 w-4" />
            SQL Editor
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </PageContainer>
  )
}
