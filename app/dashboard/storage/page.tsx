"use client"

import { useState } from "react"
import { useStorageBuckets, useStorageFiles, useDeleteStorageFile } from "@/hooks/use-storage"
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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Storage</h1>
        </div>
        <div className="h-64 rounded-lg border border-border bg-muted animate-pulse" />
      </div>
    )
  }

  if (bucketsError || !buckets || buckets.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Storage</h1>
          <p className="text-sm text-muted-foreground mt-1">S3-compatible object storage</p>
        </div>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <HardDrive className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-sm font-medium text-foreground">Storage not configured</p>
          <p className="text-xs text-muted-foreground mt-1">
            Add a storage provider during project setup or configuration
          </p>
          <code className="mt-3 px-3 py-1.5 rounded bg-muted text-xs font-mono text-muted-foreground">
            bb init → select storage provider
          </code>
        </div>
      </div>
    )
  }

  const bucket = buckets[0]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Storage</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse and manage files in your object storage bucket
        </p>
      </div>

      {/* Bucket info card */}
      <div className="rounded-lg border border-border bg-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
            <HardDrive className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold font-mono text-foreground">{bucket.name}</p>
            <p className="text-xs text-muted-foreground">
              {bucket.provider}
              {bucket.region && ` · ${bucket.region}`}
              {bucket.endpoint && !bucket.region && ` · ${bucket.endpoint}`}
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 border border-green-500/20">
          Connected
        </span>
      </div>

      {/* Breadcrumb navigation */}
      <div className="flex items-center gap-1 text-sm flex-wrap">
        <button
          onClick={() => setPrefix("")}
          className="text-primary hover:underline font-mono text-xs"
        >
          {bucket.name}
        </button>
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <button
              onClick={() => setPrefix(breadcrumbs.slice(0, i + 1).join("/") + "/")}
              className="text-primary hover:underline font-mono text-xs"
            >
              {crumb}
            </button>
          </span>
        ))}
      </div>

      {/* File browser */}
      <div className="rounded-lg border border-border overflow-hidden">
        {filesLoading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-10 rounded bg-muted animate-pulse" />
            ))}
          </div>
        ) : !files || files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Folder className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">
              {prefix ? "This folder is empty" : "No files in this bucket"}
            </p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                    Size
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                    Last modified
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                    Type
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {files.map(file => {
                  const displayName = file.key.replace(prefix, "")
                  const isFolder = displayName.endsWith("/")
                  return (
                    <tr
                      key={file.key}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <button
                          onClick={() => isFolder && setPrefix(file.key)}
                          disabled={!isFolder}
                          className="flex items-center gap-2 text-left"
                        >
                          {isFolder ? (
                            <Folder className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                          ) : (
                            <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          )}
                          <span className={cn(
                            "text-xs font-mono",
                            isFolder ? "text-primary hover:underline cursor-pointer" : "text-foreground"
                          )}>
                            {displayName}
                          </span>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {isFolder ? "—" : formatBytes(file.size)}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {isFolder ? "—" : new Date(file.lastModified).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                        {isFolder ? "folder" : (file.contentType ?? "—")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!isFolder && (
                          deleteKey === file.key ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setDeleteError(null)
                                  deleteFile.mutate(file.key, {
                                    onSuccess: () => setDeleteKey(null),
                                    onError: (err) => setDeleteError(String(err)),
                                  })
                                }}
                                className="px-2 py-0.5 rounded text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => { setDeleteKey(null); setDeleteError(null) }}
                                className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground hover:text-foreground"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteKey(file.key)}
                              className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {deleteError && (
              <div className="px-4 py-3 bg-red-500/10 border-t border-destructive/20">
                <p className="text-xs text-destructive">Failed to delete file: {deleteError}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
