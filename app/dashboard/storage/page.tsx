"use client"

import { useState } from "react"
import { useStorageBuckets, useStorageFiles, useDeleteStorageFile } from "@/hooks/use-storage"
import { PageContainer, PageHeader } from "@/components/layout/page-container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HardDrive, File, Folder, Trash2, ChevronRight, Upload, MoreVertical, Download } from "lucide-react"
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
        <div className="h-64 rounded-lg border border-[#404040] bg-[#222222] animate-pulse" />
      </PageContainer>
    )
  }

  if (bucketsError || !buckets || buckets.length === 0) {
    return (
      <PageContainer size="full">
        <PageHeader title="Storage" subtitle="S3-compatible object storage" />
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-[#2d2d2d] flex items-center justify-center">
              <HardDrive className="h-8 w-8 text-[#666666]" />
            </div>
            <div>
              <p className="text-base font-semibold text-white">Storage not configured</p>
              <p className="text-sm text-[#a0a0a0] mt-1">
                Add a storage provider during project setup or configuration
              </p>
            </div>
            <code className="px-4 py-2 rounded bg-[#2d2d2d] text-xs font-mono text-[#a0a0a0]">
              bb init → select storage provider
            </code>
          </div>
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
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={<Upload className="h-4 w-4" />}
          >
            Upload Files
          </Button>
        }
      />

      {/* Bucket info card */}
      <Card className="mb-4">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-[rgba(36,180,126,0.2)] flex items-center justify-center">
              <HardDrive className="h-5 w-5 text-[#24b47e]" />
            </div>
            <div>
              <p className="text-sm font-semibold font-mono text-white">{bucket.name}</p>
              <p className="text-xs text-[#a0a0a0]">
                {bucket.provider}
                {bucket.region && ` · ${bucket.region}`}
                {bucket.endpoint && !bucket.region && ` · ${bucket.endpoint}`}
              </p>
            </div>
          </div>
          <Badge variant="success">Connected</Badge>
        </CardContent>
      </Card>

      {/* Breadcrumb navigation */}
      <div className="flex items-center gap-1 text-sm flex-wrap mb-4">
        <button
          onClick={() => setPrefix("")}
          className="text-[#24b47e] hover:underline font-mono text-xs"
        >
          {bucket.name}
        </button>
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 text-[#666666]" />
            <button
              onClick={() => setPrefix(breadcrumbs.slice(0, i + 1).join("/") + "/")}
              className="text-[#24b47e] hover:underline font-mono text-xs"
            >
              {crumb}
            </button>
          </span>
        ))}
      </div>

      {/* File browser */}
      <Card className="overflow-hidden">
        {filesLoading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-10 rounded bg-[#2d2d2d] animate-pulse" />
            ))}
          </div>
        ) : !files || files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-full bg-[#2d2d2d] flex items-center justify-center mb-4">
              <Folder className="h-8 w-8 text-[#666666]" />
            </div>
            <p className="text-base font-semibold text-white">
              {prefix ? "This folder is empty" : "No files in this bucket"}
            </p>
            <p className="text-sm text-[#a0a0a0] mt-1">
              {prefix ? "Upload files to this folder" : "Upload files to get started"}
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
                  <TableHead className="w-24"></TableHead>
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
                            <Folder className="h-4 w-4 text-[#fbbf24] flex-shrink-0" />
                          ) : (
                            <File className="h-4 w-4 text-[#666666] flex-shrink-0" />
                          )}
                          <span className={cn(
                            "text-sm font-mono",
                            isFolder ? "text-[#24b47e] hover:underline cursor-pointer" : "text-white"
                          )}>
                            {displayName}
                          </span>
                        </button>
                      </TableCell>
                      <TableCell className="text-sm text-[#a0a0a0]">
                        {isFolder ? "—" : formatBytes(file.size)}
                      </TableCell>
                      <TableCell className="text-sm text-[#a0a0a0]">
                        {isFolder ? "—" : new Date(file.lastModified).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm font-mono text-[#666666]">
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
                                variant="secondary"
                                onClick={() => { setDeleteKey(null); setDeleteError(null) }}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                title="Download"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setDeleteKey(file.key)}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            {deleteError && (
              <div className="px-4 py-3 bg-[rgba(239,68,68,0.1)] border-t border-[rgba(239,68,68,0.2)]">
                <p className="text-xs text-[#ef4444]">Failed to delete file: {deleteError}</p>
              </div>
            )}
          </>
        )}
      </Card>
    </PageContainer>
  )
}
