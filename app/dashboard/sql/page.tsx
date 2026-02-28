"use client"

import React, { useState, useCallback, useRef } from "react"
import { PageContainer, PageHeader } from "@/components/layout/page-container"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, Play, Copy, Check, AlertCircle, Database, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

// Drizzle to SQL parser utility
function parseDrizzleToSQL(input: string): string {
  const lines = input.trim().split("\n")
  const sqlLines: string[] = []
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("/*")) {
      continue
    }
    
    // Parse db.select().from(table).where(...)
    if (trimmed.includes("db.select()") || trimmed.includes("db.")) {
      const selectMatch = trimmed.match(/db\.select\(\)\.from\((\w+)\)/)
      const fromMatch = trimmed.match(/\.from\((\w+)\)/)
      const whereMatch = trimmed.match(/\.where\(([^)]+)\)/)
      const orderByMatch = trimmed.match(/\.orderBy\([^)]+\)/)
      const limitMatch = trimmed.match(/\.limit\((\d+)\)/)
      const joinMatch = trimmed.match(/\.(?:innerJoin|leftJoin)\((\w+),?\s*([^)]+)?\)/)
      
      let tableName = selectMatch?.[1] || fromMatch?.[1] || "table"
      let sql = `SELECT * FROM ${tableName}`
      
      if (joinMatch) {
        const joinTable = joinMatch[1]
        const joinCondition = joinMatch[2] || ""
        sql = `SELECT * FROM ${tableName} INNER JOIN ${joinTable} ON ${joinCondition}`
      }
      
      if (whereMatch) {
        const condition = whereMatch[1]
          .replace(/eq\(/g, "")
          .replace(/and\(/g, " AND ")
          .replace(/or\(/g, " OR ")
          .replace(/gt\(/g, " > ")
          .replace(/lt\(/g, " < ")
          .replace(/gte\(/g, " >= ")
          .replace(/lte\(/g, " <= ")
          .replace(/ne\(/g, " != ")
          .replace(/like\(/g, " LIKE ")
          .replace(/ilike\(/g, " ILIKE ")
          .replace(/isNull\(/g, " IS NULL")
          .replace(/isNotNull\(/g, " IS NOT NULL")
          .replace(/inArray\(/g, " IN (")
          .replace(/notInArray\(/g, " NOT IN (")
          .replace(/between\(/g, " BETWEEN ")
          .replace(/\),/g, "),")
          .replace(/\)/g, ")")
        sql += ` WHERE ${condition}`
      }
      
      if (orderByMatch) {
        const orderMatch = orderByMatch[0].match(/\.orderBy\(([^)]+)\)/)
        if (orderMatch) {
          const orderCol = orderMatch[1].replace(/asc\(/g, "").replace(/desc\(/g, "").replace(/\./g, ".")
          sql += ` ORDER BY ${orderCol}`
        }
      }
      
      if (limitMatch) {
        sql += ` LIMIT ${limitMatch[1]}`
      }
      
      sql += ";"
      sqlLines.push(sql)
      continue
    }
    
    // Parse db.insert(table).values(...)
    if (trimmed.includes("db.insert(") || trimmed.includes("db.")) {
      const insertMatch = trimmed.match(/db\.insert\((\w+)\)\.values\(/)
      const valuesMatch = trimmed.match(/\.values\(([^)]+)\)/)
      
      if (insertMatch) {
        const tableName = insertMatch[1]
        let sql = `INSERT INTO ${tableName}`
        
        if (valuesMatch) {
          const values = valuesMatch[1]
          sql += ` (${values})`
        }
        
        sql += ";"
        sqlLines.push(sql)
      }
      continue
    }
    
    // Parse db.update(table).set(...).where(...)
    if (trimmed.includes("db.update(") || trimmed.includes("db.")) {
      const updateMatch = trimmed.match(/db\.update\((\w+)\)/)
      const setMatch = trimmed.match(/\.set\(([^)]+)\)/)
      const whereMatch = trimmed.match(/\.where\(([^)]+)\)/)
      
      if (updateMatch) {
        const tableName = updateMatch[1]
        let sql = `UPDATE ${tableName}`
        
        if (setMatch) {
          const setVal = setMatch[1]
          sql += ` SET ${setVal}`
        }
        
        if (whereMatch) {
          const condition = whereMatch[1]
          sql += ` WHERE ${condition}`
        }
        
        sql += ";"
        sqlLines.push(sql)
      }
      continue
    }
    
    // Parse db.delete().from(table).where(...)
    if (trimmed.includes("db.delete(") || trimmed.includes("db.")) {
      const fromMatch = trimmed.match(/\.from\((\w+)\)/)
      const whereMatch = trimmed.match(/\.where\(([^)]+)\)/)
      
      if (fromMatch) {
        const tableName = fromMatch[1]
        let sql = `DELETE FROM ${tableName}`
        
        if (whereMatch) {
          const condition = whereMatch[1]
          sql += ` WHERE ${condition}`
        }
        
        sql += ";"
        sqlLines.push(sql)
      }
      continue
    }
    
    // Parse sql`...` template tag
    if (trimmed.startsWith("sql`") || trimmed.includes("sql`")) {
      const sqlMatch = trimmed.match(/sql`([^`]*)`/)
      if (sqlMatch) {
        sqlLines.push(sqlMatch[1])
        continue
      }
    }
    
    // Parse .from() standalone
    if (trimmed.startsWith(".from(")) {
      const match = trimmed.match(/\.from\((\w+)\)/)
      if (match) {
        sqlLines.push(`SELECT * FROM ${match[1]};`)
        continue
      }
    }
    
    // Parse .where() standalone
    if (trimmed.startsWith(".where(")) {
      const match = trimmed.match(/\.where\(([^)]+)\)/)
      if (match) {
        sqlLines.push(`WHERE ${match[1]}`)
        continue
      }
    }
    
    // If no pattern matched, try to pass through as-is (for raw SQL)
    if (trimmed.endsWith(";") || trimmed.length > 0) {
      sqlLines.push(trimmed)
    }
  }
  
  if (sqlLines.length === 0) {
    return "-- Enter Drizzle ORM code or SQL query above\n-- Examples:\n-- db.select().from(users).where(eq(users.id, 1))\n-- db.insert(users).values({ name: 'John' })\n-- sql`SELECT * FROM users`"
  }
  
  return sqlLines.join("\n")
}

// Example code snippets
const examples = {
  select: `// Select with where clause
db.select()
  .from(users)
  .where(eq(users.age, 25))`,
  
  insert: `// Insert new record
db.insert(users)
  .values({
    name: 'John Doe',
    email: 'john@example.com',
    age: 25
  })`,
  
  update: `// Update record
db.update(users)
  .set({ age: 26 })
  .where(eq(users.id, 1))`,
  
  delete: `// Delete record
db.delete(users)
  .where(eq(users.id, 1))`,
  
  sql: `// Raw SQL with template tag
sql\`SELECT * FROM users WHERE age > 18\``,
}

export default function SQLEditorPage() {
  const [code, setCode] = useState(examples.select)
  const [output, setOutput] = useState("")
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("select")
  
  const generateSQL = useCallback(() => {
    try {
      setError(null)
      const sql = parseDrizzleToSQL(code)
      setOutput(sql)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse code")
    }
  }, [code])
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  const loadExample = (type: string) => {
    const exampleCode = examples[type as keyof typeof examples] || examples.select
    setCode(exampleCode)
    setActiveTab(type)
    setTimeout(generateSQL, 0)
  }
  
  // Auto-generate SQL when code changes
  const handleCodeChange = (newCode: string) => {
    setCode(newCode)
  }
  
  return (
    <PageContainer size="full">
      <PageHeader 
        title="SQL Editor" 
        subtitle="Write Drizzle ORM queries and generate SQL"
        actions={
          <Button onClick={generateSQL} icon={<Play className="h-4 w-4" />}>
            Run Query
          </Button>
        }
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="h-[calc(100vh-220px)] flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Code className="h-4 w-4 text-[#a0a0a0]" />
                Drizzle ORM Code
              </CardTitle>
              <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value); loadExample(value); }} className="w-auto">
                <TabsList>
                  <TabsTrigger value="select">Select</TabsTrigger>
                  <TabsTrigger value="insert">Insert</TabsTrigger>
                  <TabsTrigger value="update">Update</TabsTrigger>
                  <TabsTrigger value="delete">Delete</TabsTrigger>
                  <TabsTrigger value="sql">SQL</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <CardDescription className="text-xs">
              Write Drizzle ORM query builder code or use sql template tag
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 min-h-0">
              <EditorInput 
                value={code}
                onChange={handleCodeChange}
                onRun={generateSQL}
              />
            </div>
            
            {error && (
              <div className="mt-3 p-3 rounded-md bg-[#3a1a1a] border border-[#ef4444] text-[#ef4444] text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Output Section */}
        <Card className="h-[calc(100vh-220px)] flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Database className="h-4 w-4 text-[#a0a0a0]" />
                Generated SQL
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={copyToClipboard}
                disabled={!output}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-[#24b47e] mr-1" />
                ) : (
                  <Copy className="h-4 w-4 mr-1" />
                )}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
            <CardDescription className="text-xs">
              Read-only SQL output generated from your Drizzle code
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 min-h-0">
              <SQLOutput value={output} />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Reference */}
      <Card className="mt-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Zap className="h-4 w-4 text-[#a0a0a0]" />
            Quick Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-[#a0a0a0] mb-1">Operators</p>
              <code className="text-xs text-[#24b47e]">eq(), gt(), lt(), like()</code>
            </div>
            <div>
              <p className="text-[#a0a0a0] mb-1">Clauses</p>
              <code className="text-xs text-[#24b47e]">.where(), .orderBy(), .limit()</code>
            </div>
            <div>
              <p className="text-[#a0a0a0] mb-1">Joins</p>
              <code className="text-xs text-[#24b47e]">.innerJoin(), .leftJoin()</code>
            </div>
            <div>
              <p className="text-[#a0a0a0] mb-1">Template</p>
              <code className="text-xs text-[#24b47e]">sql`SELECT * FROM...`</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  )
}

// Code editor input component
function EditorInput({ 
  value, 
  onChange,
  onRun 
}: { 
  value: string
  onChange: (value: string) => void
  onRun: () => void
}) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const [lineNumbers, setLineNumbers] = useState<number[]>([1])
  
  React.useEffect(() => {
    const lines = value.split("\n").length
    setLineNumbers(Array.from({ length: Math.max(lines, 10) }, (_, i) => i + 1))
  }, [value])
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      onRun()
    }
    if (e.key === "Tab") {
      e.preventDefault()
      const start = e.currentTarget.selectionStart
      const end = e.currentTarget.selectionEnd
      const newValue = value.substring(0, start) + "  " + value.substring(end)
      onChange(newValue)
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2
        }
      }, 0)
    }
  }
  
  return (
    <div className="relative h-full min-h-[300px] font-mono text-sm">
      <div className="absolute left-0 top-0 bottom-0 w-10 bg-[#1a1a1a] border-r border-[#333333] rounded-l-md flex flex-col items-end pr-2 py-2 text-[#666666] text-xs select-none overflow-hidden">
        {lineNumbers.map((num) => (
          <div key={num} className="leading-5 h-5">{num}</div>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full h-full min-h-[300px] pl-12 pr-4 py-2 bg-[#1a1a1a] text-white rounded-md border border-[#333333] focus:border-[#24b47e] focus:ring-2 focus:ring-[#24b47e]/20 focus:ring-offset-2 focus:ring-offset-[#1a1a1a] resize-none font-mono text-sm leading-5"
        placeholder="// Enter Drizzle ORM code here...
db.select()
  .from(users)
  .where(eq(users.id, 1))"
        spellCheck={false}
      />
    </div>
  )
}

// SQL output display component
function SQLOutput({ value }: { value: string }) {
  const lines = value ? value.split("\n") : [""]
  
  return (
    <div className="h-full min-h-[300px] font-mono text-sm bg-[#1a1a1a] rounded-md border border-[#333333] overflow-auto">
      <div className="p-4">
        {lines.map((line, index) => (
          <div 
            key={index} 
            className={cn(
              "leading-5 h-5",
              line.startsWith("--") ? "text-[#666666]" : 
              line.startsWith("SELECT") ? "text-[#24b47e]" :
              line.startsWith("INSERT") ? "text-[#3b82f6]" :
              line.startsWith("UPDATE") ? "text-[#f59e0b]" :
              line.startsWith("DELETE") ? "text-[#ef4444]" :
              line.startsWith("WHERE") ? "text-[#a78bfa]" :
              line.startsWith("FROM") ? "text-[#06b6d4]" :
              line.startsWith("ORDER") ? "text-[#a78bfa]" :
              line.startsWith("LIMIT") ? "text-[#a78bfa]" :
              line.startsWith("SET") ? "text-[#f59e0b]" :
              "text-[#a0a0a0]"
            )}
          >
            {line || "\u00A0"}
          </div>
        ))}
        {!value && (
          <div className="text-[#666666]">
            Click "Run Query" or press Ctrl+Enter to generate SQL
          </div>
        )}
      </div>
    </div>
  )
}


