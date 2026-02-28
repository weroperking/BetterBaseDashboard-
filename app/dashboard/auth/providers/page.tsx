"use client"

import { useState } from "react"
import { PageContainer, PageHeader } from "@/components/layout/page-container"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Mail, 
  Github, 
  Twitter, 
  Facebook, 
  Key, 
  Globe, 
  Shield, 
  Settings,
  CheckCircle,
  XCircle,
  ExternalLink,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

// Auth provider types
interface AuthProvider {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  enabled: boolean
  configured: boolean
  color: string
}

// Mock auth providers data
const defaultProviders: AuthProvider[] = [
  {
    id: "email",
    name: "Email",
    description: "Authenticate users using email and password",
    icon: <Mail className="h-5 w-5" />,
    enabled: true,
    configured: true,
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  {
    id: "google",
    name: "Google",
    description: "Allow users to sign in with their Google account",
    icon: <Globe className="h-5 w-5" />,
    enabled: true,
    configured: false,
    color: "bg-red-500/10 text-red-400 border-red-500/20",
  },
  {
    id: "github",
    name: "GitHub",
    description: "Allow users to sign in with their GitHub account",
    icon: <Github className="h-5 w-5" />,
    enabled: true,
    configured: false,
    color: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  },
  {
    id: "facebook",
    name: "Facebook",
    description: "Allow users to sign in with their Facebook account",
    icon: <Facebook className="h-5 w-5" />,
    enabled: false,
    configured: false,
    color: "bg-blue-600/10 text-blue-500 border-blue-600/20",
  },
  {
    id: "twitter",
    name: "Twitter",
    description: "Allow users to sign in with their Twitter/X account",
    icon: <Twitter className="h-5 w-5" />,
    enabled: false,
    configured: false,
    color: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  },
  {
    id: "anonymous",
    name: "Anonymous",
    description: "Allow anonymous users to access your app without authentication",
    icon: <Shield className="h-5 w-5" />,
    enabled: false,
    configured: true,
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
]

export default function AuthProvidersPage() {
  const [providers, setProviders] = useState<AuthProvider[]>(defaultProviders)
  const [selectedProvider, setSelectedProvider] = useState<AuthProvider | null>(null)
  const [showConfigModal, setShowConfigModal] = useState(false)

  // Toggle provider enabled state
  const toggleProvider = (providerId: string) => {
    setProviders(prev => prev.map(p => 
      p.id === providerId ? { ...p, enabled: !p.enabled } : p
    ))
  }

  // Open configuration modal
  const configureProvider = (provider: AuthProvider) => {
    setSelectedProvider(provider)
    setShowConfigModal(true)
  }

  // Save provider configuration
  const saveProviderConfig = (providerId: string, config: Record<string, string>) => {
    setProviders(prev => prev.map(p => 
      p.id === providerId ? { ...p, configured: true, enabled: true } : p
    ))
    setShowConfigModal(false)
    setSelectedProvider(null)
  }

  const enabledCount = providers.filter(p => p.enabled).length
  const configuredCount = providers.filter(p => p.configured).length

  return (
    <PageContainer size="full">
      <PageHeader 
        title="Auth Providers" 
        subtitle="Configure authentication providers for your application"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#2d2d2d] flex items-center justify-center">
                <Shield className="h-5 w-5 text-accent-green" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-white">{providers.length}</p>
                <p className="text-sm text-[#a0a0a0]">Total Providers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent-green-muted flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-accent-green" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-white">{enabledCount}</p>
                <p className="text-sm text-[#a0a0a0]">Enabled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#2d2d2d] flex items-center justify-center">
                <Settings className="h-5 w-5 text-[#a0a0a0]" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-white">{configuredCount}</p>
                <p className="text-sm text-[#a0a0a0]">Configured</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Providers List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Key className="h-4 w-4 text-[#a0a0a0]" />
            Authentication Providers
          </CardTitle>
          <CardDescription>
            Enable and configure authentication methods for your users
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-[#333333]">
            {providers.map((provider) => (
              <ProviderRow 
                key={provider.id}
                provider={provider}
                onToggle={() => toggleProvider(provider.id)}
                onConfigure={() => configureProvider(provider)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="mt-6 border-[rgba(36,180,126,0.2)] bg-[rgba(36,180,126,0.05)]">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-accent-green flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white">Provider Configuration</p>
              <p className="text-sm text-[#a0a0a0] mt-1">
                To enable a provider, you need to configure it with your application credentials.
                Click "Configure" to add your API keys and settings. 
                <a href="#" className="text-accent-green hover:underline ml-1">
                  Learn more about auth providers
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Modal */}
      {showConfigModal && selectedProvider && (
        <ConfigModal 
          provider={selectedProvider}
          onClose={() => {
            setShowConfigModal(false)
            setSelectedProvider(null)
          }}
          onSave={(config) => saveProviderConfig(selectedProvider.id, config)}
        />
      )}
    </PageContainer>
  )
}

// Provider row component
function ProviderRow({ 
  provider, 
  onToggle, 
  onConfigure 
}: { 
  provider: AuthProvider
  onToggle: () => void
  onConfigure: () => void
}) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-[#2d2d2d]/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className={cn(
          "h-12 w-12 rounded-lg flex items-center justify-center border",
          provider.color
        )}>
          {provider.icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-white">{provider.name}</p>
            {provider.configured && (
              <Badge variant="success" className="text-[10px] py-0 h-5">
                Configured
              </Badge>
            )}
          </div>
          <p className="text-xs text-[#a0a0a0] mt-0.5">{provider.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {!provider.configured && provider.enabled && (
          <Badge variant="warning" className="text-[10px]">
            Setup required
          </Badge>
        )}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onConfigure}
          icon={<Settings className="h-4 w-4" />}
        >
          Configure
        </Button>
        <Toggle 
          enabled={provider.enabled} 
          onChange={onToggle}
          disabled={!provider.configured && !provider.enabled}
        />
      </div>
    </div>
  )
}

// Toggle Switch Component
function Toggle({ 
  enabled, 
  onChange, 
  disabled = false 
}: { 
  enabled: boolean
  onChange: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(36,180,126,0.2)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50",
        enabled ? "bg-accent-green" : "bg-[#404040]",
        disabled && !enabled && "opacity-50"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
          enabled ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  )
}

// Configuration Modal
function ConfigModal({ 
  provider,
  onClose,
  onSave 
}: { 
  provider: AuthProvider
  onClose: () => void
  onSave: (config: Record<string, string>) => void
}) {
  const [clientId, setClientId] = useState("")
  const [clientSecret, setClientSecret] = useState("")
  const [redirectUrl, setRedirectUrl] = useState("http://localhost:3000/auth/callback")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ clientId, clientSecret, redirectUrl })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-50 w-full max-w-md bg-[#222222] border border-[#404040] rounded-lg shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-[#333333]">
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center border",
              provider.color
            )}>
              {provider.icon}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Configure {provider.name}</h2>
              <p className="text-xs text-[#a0a0a0]">Set up your {provider.name} credentials</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <XCircle className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            <div className="rounded-md bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.2)] px-3 py-2">
              <p className="text-xs text-[#60a5fa]">
                You'll need to create an OAuth application in your {provider.name} developer settings.
                Add the redirect URL below.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientId" className="text-xs text-[#a0a0a0]">
                Client ID
              </Label>
              <Input
                id="clientId"
                type="text"
                placeholder="Enter your client ID"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="bg-[#2d2d2d] border-[#404040]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientSecret" className="text-xs text-[#a0a0a0]">
                Client Secret
              </Label>
              <Input
                id="clientSecret"
                type="password"
                placeholder="Enter your client secret"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                className="bg-[#2d2d2d] border-[#404040]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="redirectUrl" className="text-xs text-[#a0a0a0]">
                Redirect URL
              </Label>
              <div className="flex gap-2">
                <Input
                  id="redirectUrl"
                  type="text"
                  value={redirectUrl}
                  onChange={(e) => setRedirectUrl(e.target.value)}
                  className="bg-[#2d2d2d] border-[#404040] font-mono text-xs"
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigator.clipboard.writeText(redirectUrl)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 p-4 border-t border-[#333333]">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save Configuration
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
