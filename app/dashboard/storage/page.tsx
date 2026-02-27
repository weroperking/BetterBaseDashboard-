"use client"

import { useState } from "react"
import { useStorageBuckets, useStorageFiles, useDeleteStorageFile } from "@/hooks/use-storage"
import { PageContainer, PageHeader } from "@/components/layout/page-container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HardDrive, File, Folder, Trash2, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export default function StoragePage() {
  const { data: buckets, isLoading: bucketsLoading, error: bucketsError } = useStorageBuckets()
  const [prefix, setPrefix] = useState("")
  const [deleteKey, setDeleteKey] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const activeBucket = buckets?.[0]?.name ?? null
  const { data: files, isLoading: filesLoading } = useStorageFiles(activeBucket ?? "", prefix)
  const deleteFile = useDeleteStorageFile(activeBucket ?? "")

  const breadcrumbs = prefix.split("/").filter(Boolean)

  if (bucketsLoading) {
    return (
      <PageContainer size="full">
        <PageHeader title="Storage" subtitle="S3-compatible object storage" />
        <div className="h-64 rounded-lg border border-border bg-surface-100 animate-pulse" />
      </PageContainer>
    )
  }

  if (bucketsError || !buckets || buckets.length === 0) {
    return (
      <PageContainer size="full">
        <PageHeader title="Storage" subtitle="S3-compatible object storage" />
        <Card className="p-12 text-center">
          <HardDrive className="h-12 w-12 text-foreground-muted mx-auto mb-4" />
          <p className="text-sm font-medium text-foreground">Storage not configured</p>
          <p className="text-xs text-foreground-light mt-1">
            Add a storage provider during project setup or configuration
          </p>
          <code className="mt-4 inline-block px-3 py-1.5 rounded bg-surface-200 text-xs font-mono text-foreground-light">
            bb init → select storage provider
          </code>
        </Card>
      </PageContainer>
    )
  }

  const bucket = buckets[0]

  return (
    <PageContainer size="full">
      <PageHeader 
        title="Storage" 
        subtitle="Browse and manage files in your object storage bucket"
      />

      {/* Bucket info card */}
      <Card className="bg-surface-100 mb-6">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-brand/10 flex items-center justify-center">
              <HardDrive className="h-5 w-5 text-brand" />
            </div>
            <div>
              <p className="text-sm font-semibold font-mono text-foreground">{bucket.name}</p>
              <p className="text-xs text-foreground-light">
                {bucket.provider}
                {bucket.region && ` · ${bucket.region}`}
                {bucket.endpoint && !bucket.region && ` · ${bucket.endpoint}`}
              </p>
            </div>
          </div>
          <Badge variant="brand">Connected</Badge>
        </CardContent>
      </Card>

      {/* Breadcrumb navigation */}
      <div className="flex items-center gap-1 text-sm flex-wrap mb-4">
        <button
          onClick={() => setPrefix("")}
          className="text-brand hover:underline font-mono text-xs"
        >
          {bucket.name}
        </button>
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 text-foreground-muted" />
            <button
              onClick={() => setPrefix(breadcrumbs.slice(0, i + 1).join("/") + "/")}
              className="text-brand hover:underline font-mono text-xs"
            >
              {crumb}
            </button>
          </span>
        ))}
      </div>

      {/* File browser */}
      <Card className="bg-surface-100 overflow-hidden">
        {filesLoading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-10 rounded bg-surface-200 animate-pulse" />
            ))}
          </div>
        ) : !files || files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Folder className="h-8 w-8 text-foreground-muted mb-2" />
            <p className="text-sm text-foreground-light">
              {prefix ? "This folder is empty" : "No files in this bucket"}
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Last modified</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map(file => {
                  const displayName = file.key.replace(prefix, "")
                  const isFolder = displayName.endsWith("/")
                  return (
                    <TableRow key={file.key}>
                      <TableCell>
                        <button
                          onClick={() => isFolder && setPrefix(file.key)}
                          disabled={!isFolder}
                          className="flex items-center gap-2 text-left"
                        >
                          {isFolder ? (
                            <Folder className="h-4 w-4 text-warning flex-shrink-0" />
                          ) : (
                            <File className="h-4 w-4 text-foreground-muted flex-shrink-0" />
                          )}
                          <span className={cn(
                            "text-xs font-mono",
                            isFolder ? "text-brand hover:underline cursor-pointer" : "text-foreground"
                          )}>
                            {displayName}
                          </span>
                        </button>
                      </TableCell>
                      <TableCell className="text-xs text-foreground-light">
                        {isFolder ? "—" : formatBytes(file.size)}
                      </TableCell>
                      <TableCell className="text-xs text-foreground-light">
                        {isFolder ? "—" : new Date(file.lastModified).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-foreground-light">
                        {isFolder ? "folder" : (file.contentType ?? "—")}
                      </TableCell>
                      <TableCell className="text-right">
                        {!isFolder && (
                          deleteKey === file.key ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setDeleteError(null)
                                  deleteFile.mutate(file.key, {
                                    onSuccess: () => setDeleteKey(null),
                                    onError: (err) => setDeleteError(String(err)),
                                  })
                                }}
                              >
                                Delete
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => { setDeleteKey(null); setDeleteError(null) }}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setDeleteKey(file.key)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            {deleteError && (
              <div className="px-4 py-3 bg-destructive/10 border-t border-destructive/20">
                <p className="text-xs text-destructive">Failed to delete file: {deleteError}</p>
              </div>
            )}
          </>
        )}
      </Card>
    </PageContainer>
  )
}
