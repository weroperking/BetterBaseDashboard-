"use client"

import { useEffect, useState } from "react"
import { useConnectionStore } from "@/lib/store"
import { BetterBaseMetaClient, AuthUser } from "@/lib/betterbase-client"
import { PageContainer, PageHeader } from "@/components/layout/page-container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Mail, CheckCircle, XCircle, Plus, RefreshCw, Search, MoreVertical, Edit, Trash2 } from "lucide-react"

export default function AuthPage() {
  const { getActive } = useConnectionStore()
  const [users, setUsers] = useState<AuthUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const connection = getActive()
    if (!connection) return

    const client = new BetterBaseMetaClient(connection)

    async function fetchUsers() {
      setLoading(true)
      const result = await client.getUsers()
      
      if (result.error) {
        setError(result.error)
      } else {
        setUsers(result.data || [])
      }
      
      setLoading(false)
    }

    fetchUsers()
  }, [getActive])

  const refreshUsers = () => {
    const connection = getActive()
    if (!connection) return

    const client = new BetterBaseMetaClient(connection)
    
    setLoading(true)
    client.getUsers().then(result => {
      if (result.error) {
        setError(result.error)
      } else {
        setUsers(result.data || [])
      }
      setLoading(false)
    })
  }

  // Filter users based on search
  const filteredUsers = searchQuery
    ? users.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users

  if (loading && users.length === 0) {
    return (
      <PageContainer size="full">
        <PageHeader title="Authentication" subtitle="Manage users and authentication settings" />
        <div className="h-64 rounded-lg border border-[#404040] bg-[#222222] animate-pulse" />
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer size="full">
        <PageHeader title="Authentication" subtitle="Manage users and authentication settings" />
        <Card className="p-8 text-center">
          <Users className="h-12 w-12 text-[#ef4444] mx-auto mb-4" />
          <p className="text-sm font-medium text-white">{error}</p>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer size="full">
      <PageHeader 
        title="Authentication" 
        subtitle="Manage users and authentication settings"
        actions={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<RefreshCw className="h-4 w-4" />}
              onClick={refreshUsers}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="h-4 w-4" />}
            >
              Add User
            </Button>
          </div>
        }
      />

      {/* Search */}
      <Card className="mb-4">
        <CardContent className="p-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666666]" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-[#2d2d2d] border border-[#404040] rounded-[6px] text-sm text-white placeholder:text-[#666666] focus:outline-none focus:border-[#24b47e]"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        {users.length === 0 ? (
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-full bg-[#2d2d2d] flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-[#666666]" />
            </div>
            <p className="text-base font-semibold text-white">No users yet</p>
            <p className="text-sm text-[#a0a0a0] mt-1">
              Create your first user to get started
            </p>
          </CardContent>
        ) : (
          <>
            <CardHeader className="pb-0">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Users className="h-4 w-4 text-[#a0a0a0]" />
                Users
                <Badge variant="secondary">{filteredUsers.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-[#2d2d2d] flex items-center justify-center">
                            <span className="text-xs font-medium text-[#a0a0a0]">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-white">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-[#666666]" />
                          <span className="text-[#a0a0a0]">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.emailVerified ? (
                          <Badge variant="success" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 text-[#666666]">
                            <XCircle className="h-3 w-3" />
                            Unverified
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-[#a0a0a0]">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </>
        )}
      </Card>
    </PageContainer>
  )
}
