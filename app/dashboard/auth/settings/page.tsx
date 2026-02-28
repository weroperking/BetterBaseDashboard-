"use client"

import { useState } from "react"
import { PageContainer, PageHeader } from "@/components/layout/page-container"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Globe, 
  Link, 
  Mail, 
  Key, 
  Shield, 
  Settings,
  Clock,
  Smartphone,
  Save,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react"
import { cn } from "@/lib/utils"

// Settings types
interface AuthSettings {
  siteUrl: string
  redirectUrls: {
    login: string
    logout: string
    signup: string
    callback: string
  }
  emailConfirmation: {
    enabled: boolean
    confirmEmailWithin: string
    securePasswordChange: boolean
  }
  passwordReset: {
    enabled: boolean
    resetTokenExpiry: string
    securePasswordChange: boolean
  }
  session: {
    configuration: string
    expiry: string
    extendSessionOnActivity: boolean
  }
  mfa: {
    enabled: boolean
    totpEnabled: boolean
    phoneEnabled: boolean
  }
}

// Default settings
const defaultSettings: AuthSettings = {
  siteUrl: "https://myapp.example.com",
  redirectUrls: {
    login: "/auth/login",
    logout: "/auth/logout",
    signup: "/auth/signup",
    callback: "/auth/callback",
  },
  emailConfirmation: {
    enabled: true,
    confirmEmailWithin: "7days",
    securePasswordChange: true,
  },
  passwordReset: {
    enabled: true,
    resetTokenExpiry: "1hour",
    securePasswordChange: true,
  },
  session: {
    configuration: "jwt",
    expiry: "1week",
    extendSessionOnActivity: true,
  },
  mfa: {
    enabled: true,
    totpEnabled: true,
    phoneEnabled: false,
  },
}

export default function AuthSettingsPage() {
  const [settings, setSettings] = useState<AuthSettings>(defaultSettings)
  const [saved, setSaved] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)

  // Handle save
  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // Update settings helpers
  const updateSiteUrl = (value: string) => {
    setSettings(prev => ({ ...prev, siteUrl: value }))
  }

  const updateRedirectUrl = (key: keyof AuthSettings["redirectUrls"], value: string) => {
    setSettings(prev => ({
      ...prev,
      redirectUrls: { ...prev.redirectUrls, [key]: value }
    }))
  }

  const updateEmailConfirmation = (key: keyof AuthSettings["emailConfirmation"], value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      emailConfirmation: { ...prev.emailConfirmation, [key]: value }
    }))
  }

  const updatePasswordReset = (key: keyof AuthSettings["passwordReset"], value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      passwordReset: { ...prev.passwordReset, [key]: value }
    }))
  }

  const updateSession = (key: keyof AuthSettings["session"], value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      session: { ...prev.session, [key]: value }
    }))
  }

  const updateMfa = (key: keyof AuthSettings["mfa"], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      mfa: { ...prev.mfa, [key]: value }
    }))
  }

  return (
    <PageContainer size="full">
      <PageHeader 
        title="Auth Settings" 
        subtitle="Configure authentication and security settings for your application"
        actions={
          <Button 
            onClick={handleSave}
            icon={saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          >
            {saved ? "Saved" : "Save Changes"}
          </Button>
        }
      />

      {/* Warning Banner */}
      <Card className="mb-6 border-[rgba(251,191,36,0.2)] bg-[rgba(251,191,36,0.05)]">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-[#fbbf24] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white">Authentication Configuration</p>
              <p className="text-sm text-[#a0a0a0] mt-1">
                These settings affect how users authenticate with your application. 
                Make sure to test thoroughly before deploying to production.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-flex">
          <TabsTrigger value="general">
            <Globe className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="redirects">
            <Link className="h-4 w-4 mr-2" />
            Redirects
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="password">
            <Key className="h-4 w-4 mr-2" />
            Password
          </TabsTrigger>
          <TabsTrigger value="session">
            <Clock className="h-4 w-4 mr-2" />
            Session
          </TabsTrigger>
          <TabsTrigger value="mfa">
            <Shield className="h-4 w-4 mr-2" />
            MFA
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Settings className="h-4 w-4 text-[#a0a0a0]" />
                General Settings
              </CardTitle>
              <CardDescription>
                Basic authentication configuration for your site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Site URL */}
              <div className="space-y-2">
                <Label htmlFor="siteUrl" className="text-xs text-[#a0a0a0]">
                  Site URL
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="siteUrl"
                    type="url"
                    value={settings.siteUrl}
                    onChange={(e) => updateSiteUrl(e.target.value)}
                    placeholder="https://yourapp.com"
                    className="bg-[#2d2d2d] border-[#404040]"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => navigator.clipboard.writeText(settings.siteUrl)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-[#666666]">
                  The base URL of your site. Used for generating email confirmation links.
                </p>
              </div>

              {/* JWT Secret */}
              <div className="space-y-2">
                <Label htmlFor="jwtSecret" className="text-xs text-[#a0a0a0]">
                  JWT Secret
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="jwtSecret"
                      type={showApiKey ? "text" : "password"}
                      value="your-super-secret-jwt-key-change-in-production"
                      readOnly
                      className="bg-[#2d2d2d] border-[#404040] pr-10 font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#666666] hover:text-white"
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <Button 
                    variant="secondary"
                    size="sm"
                    icon={<RefreshCw className="h-4 w-4" />}
                  >
                    Regenerate
                  </Button>
                </div>
                <p className="text-xs text-[#666666]">
                  Secret key used to sign JWT tokens. Keep this secure and never share it publicly.
                </p>
              </div>

              {/* Enable Signups */}
              <div className="flex items-center justify-between py-3 border-t border-[#333333]">
                <div>
                  <p className="text-sm font-medium text-white">Enable Signups</p>
                  <p className="text-xs text-[#a0a0a0] mt-0.5">Allow new users to create accounts</p>
                </div>
                <ToggleSwitch enabled={true} onChange={() => {}} />
              </div>

              {/* Enable Anonymous Users */}
              <div className="flex items-center justify-between py-3 border-t border-[#333333]">
                <div>
                  <p className="text-sm font-medium text-white">Enable Anonymous Users</p>
                  <p className="text-xs text-[#a0a0a0] mt-0.5">Allow users to access without authentication</p>
                </div>
                <ToggleSwitch enabled={false} onChange={() => {}} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Redirect URLs */}
        <TabsContent value="redirects">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Link className="h-4 w-4 text-[#a0a0a0]" />
                Redirect URLs
              </CardTitle>
              <CardDescription>
                Configure where users are redirected after authentication actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Login Redirect */}
              <div className="space-y-2">
                <Label htmlFor="loginRedirect" className="text-xs text-[#a0a0a0]">
                  Login Redirect URL
                </Label>
                <Input
                  id="loginRedirect"
                  type="text"
                  value={settings.redirectUrls.login}
                  onChange={(e) => updateRedirectUrl("login", e.target.value)}
                  placeholder="/dashboard"
                  className="bg-[#2d2d2d] border-[#404040] font-mono text-xs"
                />
              </div>

              {/* Logout Redirect */}
              <div className="space-y-2">
                <Label htmlFor="logoutRedirect" className="text-xs text-[#a0a0a0]">
                  Logout Redirect URL
                </Label>
                <Input
                  id="logoutRedirect"
                  type="text"
                  value={settings.redirectUrls.logout}
                  onChange={(e) => updateRedirectUrl("logout", e.target.value)}
                  placeholder="/"
                  className="bg-[#2d2d2d] border-[#404040] font-mono text-xs"
                />
              </div>

              {/* Signup Redirect */}
              <div className="space-y-2">
                <Label htmlFor="signupRedirect" className="text-xs text-[#a0a0a0]">
                  Signup Redirect URL
                </Label>
                <Input
                  id="signupRedirect"
                  type="text"
                  value={settings.redirectUrls.signup}
                  onChange={(e) => updateRedirectUrl("signup", e.target.value)}
                  placeholder="/dashboard"
                  className="bg-[#2d2d2d] border-[#404040] font-mono text-xs"
                />
              </div>

              {/* Callback URL */}
              <div className="space-y-2">
                <Label htmlFor="callbackUrl" className="text-xs text-[#a0a0a0]">
                  OAuth Callback URL
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="callbackUrl"
                    type="text"
                    value={`${settings.siteUrl}${settings.redirectUrls.callback}`}
                    readOnly
                    className="bg-[#2d2d2d] border-[#404040] font-mono text-xs"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => navigator.clipboard.writeText(`${settings.siteUrl}${settings.redirectUrls.callback}`)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-[#666666]">
                  Use this URL when configuring OAuth providers (Google, GitHub, etc.)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Mail className="h-4 w-4 text-[#a0a0a0]" />
                Email Confirmation
              </CardTitle>
              <CardDescription>
                Configure email confirmation and verification settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enable Email Confirmation */}
              <div className="flex items-center justify-between py-3 border-b border-[#333333]">
                <div>
                  <p className="text-sm font-medium text-white">Enable Email Confirmation</p>
                  <p className="text-xs text-[#a0a0a0] mt-0.5">Require users to confirm their email address</p>
                </div>
                <ToggleSwitch 
                  enabled={settings.emailConfirmation.enabled} 
                  onChange={(val) => updateEmailConfirmation("enabled", val)} 
                />
              </div>

              {/* Confirm Email Within */}
              <div className="space-y-2">
                <Label htmlFor="confirmEmailWithin" className="text-xs text-[#a0a0a0]">
                  Confirm Email Within
                </Label>
                <Select 
                  value={settings.emailConfirmation.confirmEmailWithin}
                  onValueChange={(val) => updateEmailConfirmation("confirmEmailWithin", val)}
                >
                  <SelectTrigger className="bg-[#2d2d2d] border-[#404040]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1hour">1 hour</SelectItem>
                    <SelectItem value="6hours">6 hours</SelectItem>
                    <SelectItem value="1day">1 day</SelectItem>
                    <SelectItem value="3days">3 days</SelectItem>
                    <SelectItem value="7days">7 days</SelectItem>
                    <SelectItem value="30days">30 days</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-[#666666]">
                  Time limit for users to confirm their email before the link expires
                </p>
              </div>

              {/* Secure Password Change */}
              <div className="flex items-center justify-between py-3 border-t border-[#333333]">
                <div>
                  <p className="text-sm font-medium text-white">Secure Password Change</p>
                  <p className="text-xs text-[#a0a0a0] mt-0.5">Require email confirmation when changing password</p>
                </div>
                <ToggleSwitch 
                  enabled={settings.emailConfirmation.securePasswordChange} 
                  onChange={(val) => updateEmailConfirmation("securePasswordChange", val)} 
                />
              </div>

              {/* Email Templates */}
              <div className="pt-4 border-t border-[#333333]">
                <p className="text-sm font-medium text-white mb-3">Email Templates</p>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#2d2d2d] border border-[#404040]">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-[#a0a0a0]" />
                      <div>
                        <p className="text-sm font-medium text-white">Confirmation Email</p>
                        <p className="text-xs text-[#666666]">Sent when user signs up</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Customize
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#2d2d2d] border border-[#404040]">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-[#a0a0a0]" />
                      <div>
                        <p className="text-sm font-medium text-white">Reconfirmation Email</p>
                        <p className="text-xs text-[#666666]">Sent when email needs reverification</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Customize
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Settings */}
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Key className="h-4 w-4 text-[#a0a0a0]" />
                Password Reset
              </CardTitle>
              <CardDescription>
                Configure password reset and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enable Password Reset */}
              <div className="flex items-center justify-between py-3 border-b border-[#333333]">
                <div>
                  <p className="text-sm font-medium text-white">Enable Password Reset</p>
                  <p className="text-xs text-[#a0a0a0] mt-0.5">Allow users to reset their password via email</p>
                </div>
                <ToggleSwitch 
                  enabled={settings.passwordReset.enabled} 
                  onChange={(val) => updatePasswordReset("enabled", val)} 
                />
              </div>

              {/* Reset Token Expiry */}
              <div className="space-y-2">
                <Label htmlFor="resetTokenExpiry" className="text-xs text-[#a0a0a0]">
                  Reset Token Expiry
                </Label>
                <Select 
                  value={settings.passwordReset.resetTokenExpiry}
                  onValueChange={(val) => updatePasswordReset("resetTokenExpiry", val)}
                >
                  <SelectTrigger className="bg-[#2d2d2d] border-[#404040]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15min">15 minutes</SelectItem>
                    <SelectItem value="30min">30 minutes</SelectItem>
                    <SelectItem value="1hour">1 hour</SelectItem>
                    <SelectItem value="6hours">6 hours</SelectItem>
                    <SelectItem value="1day">1 day</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Secure Password Change */}
              <div className="flex items-center justify-between py-3 border-t border-[#333333]">
                <div>
                  <p className="text-sm font-medium text-white">Secure Password Change</p>
                  <p className="text-xs text-[#a0a0a0] mt-0.5">Require current password to set a new one</p>
                </div>
                <ToggleSwitch 
                  enabled={settings.passwordReset.securePasswordChange} 
                  onChange={(val) => updatePasswordReset("securePasswordChange", val)} 
                />
              </div>

              {/* Password Requirements */}
              <div className="pt-4 border-t border-[#333333]">
                <p className="text-sm font-medium text-white mb-3">Password Requirements</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-accent-green" />
                    <span className="text-xs text-[#a0a0a0]">Minimum 8 characters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-accent-green" />
                    <span className="text-xs text-[#a0a0a0]">At least one uppercase letter</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-accent-green" />
                    <span className="text-xs text-[#a0a0a0]">At least one lowercase letter</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-accent-green" />
                    <span className="text-xs text-[#a0a0a0]">At least one number</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Session Settings */}
        <TabsContent value="session">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Clock className="h-4 w-4 text-[#a0a0a0]" />
                Session Configuration
              </CardTitle>
              <CardDescription>
                Configure session management and token settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Session Type */}
              <div className="space-y-2">
                <Label htmlFor="sessionConfig" className="text-xs text-[#a0a0a0]">
                  Session Type
                </Label>
                <Select 
                  value={settings.session.configuration}
                  onValueChange={(val) => updateSession("configuration", val)}
                >
                  <SelectTrigger className="bg-[#2d2d2d] border-[#404040]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jwt">JWT (JSON Web Token)</SelectItem>
                    <SelectItem value="server">Server-Side Sessions</SelectItem>
                    <SelectItem value="cookies">Cookie-Based Sessions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Session Expiry */}
              <div className="space-y-2">
                <Label htmlFor="sessionExpiry" className="text-xs text-[#a0a0a0]">
                  Session Expiry
                </Label>
                <Select 
                  value={settings.session.expiry}
                  onValueChange={(val) => updateSession("expiry", val)}
                >
                  <SelectTrigger className="bg-[#2d2d2d] border-[#404040]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15min">15 minutes</SelectItem>
                    <SelectItem value="1hour">1 hour</SelectItem>
                    <SelectItem value="1day">1 day</SelectItem>
                    <SelectItem value="1week">1 week</SelectItem>
                    <SelectItem value="30days">30 days</SelectItem>
                    <SelectItem value="never">Never (persistent)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Extend Session on Activity */}
              <div className="flex items-center justify-between py-3 border-t border-[#333333]">
                <div>
                  <p className="text-sm font-medium text-white">Extend Session on Activity</p>
                  <p className="text-xs text-[#a0a0a0] mt-0.5">Reset expiry timer on each user activity</p>
                </div>
                <ToggleSwitch 
                  enabled={settings.session.extendSessionOnActivity} 
                  onChange={(val) => updateSession("extendSessionOnActivity", val)} 
                />
              </div>

              {/* Refresh Token */}
              <div className="flex items-center justify-between py-3 border-t border-[#333333]">
                <div>
                  <p className="text-sm font-medium text-white">Enable Refresh Tokens</p>
                  <p className="text-xs text-[#a0a0a0] mt-0.5">Allow automatic token refresh</p>
                </div>
                <ToggleSwitch enabled={true} onChange={() => {}} />
              </div>

              {/* Remember Device */}
              <div className="flex items-center justify-between py-3 border-t border-[#333333]">
                <div>
                  <p className="text-sm font-medium text-white">Remember Device</p>
                  <p className="text-xs text-[#a0a0a0] mt-0.5">Allow users to trust their device</p>
                </div>
                <ToggleSwitch enabled={true} onChange={() => {}} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MFA Settings */}
        <TabsContent value="mfa">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Shield className="h-4 w-4 text-[#a0a0a0]" />
                Multi-Factor Authentication
              </CardTitle>
              <CardDescription>
                Configure multi-factor authentication options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enable MFA */}
              <div className="flex items-center justify-between py-3 border-b border-[#333333]">
                <div>
                  <p className="text-sm font-medium text-white">Enable MFA</p>
                  <p className="text-xs text-[#a0a0a0] mt-0.5">Allow users to set up multi-factor authentication</p>
                </div>
                <ToggleSwitch 
                  enabled={settings.mfa.enabled} 
                  onChange={(val) => updateMfa("enabled", val)} 
                />
              </div>

              {/* TOTP */}
              <div className="flex items-center justify-between py-3 border-b border-[#333333]">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-[#a0a0a0]" />
                  <div>
                    <p className="text-sm font-medium text-white">Authenticator App (TOTP)</p>
                    <p className="text-xs text-[#a0a0a0] mt-0.5">Time-based one-time passwords</p>
                  </div>
                </div>
                <ToggleSwitch 
                  enabled={settings.mfa.totpEnabled} 
                  onChange={(val) => updateMfa("totpEnabled", val)} 
                />
              </div>

              {/* Phone */}
              <div className="flex items-center justify-between py-3 border-b border-[#333333]">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-[#a0a0a0]" />
                  <div>
                    <p className="text-sm font-medium text-white">Phone (SMS)</p>
                    <p className="text-xs text-[#a0a0a0] mt-0.5">Verification codes via SMS</p>
                  </div>
                </div>
                <ToggleSwitch 
                  enabled={settings.mfa.phoneEnabled} 
                  onChange={(val) => updateMfa("phoneEnabled", val)} 
                />
              </div>

              {/* MFA Enforced */}
              <div className="flex items-center justify-between py-3 border-t border-[#333333]">
                <div>
                  <p className="text-sm font-medium text-white">Enforce MFA</p>
                  <p className="text-xs text-[#a0a0a0] mt-0.5">Require MFA for all users</p>
                </div>
                <ToggleSwitch enabled={false} onChange={() => {}} />
              </div>

              {/* Backup Codes */}
              <div className="pt-4 border-t border-[#333333]">
                <p className="text-sm font-medium text-white mb-3">Recovery Options</p>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#2d2d2d] border border-[#404040]">
                  <div className="flex items-center gap-3">
                    <Key className="h-4 w-4 text-[#a0a0a0]" />
                    <div>
                      <p className="text-sm font-medium text-white">Backup Codes</p>
                      <p className="text-xs text-[#666666]">Generate one-time use backup codes</p>
                    </div>
                  </div>
                  <Badge variant="success" className="text-[10px]">
                    Enabled
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}

// Toggle Switch Component
function ToggleSwitch({ 
  enabled, 
  onChange 
}: { 
  enabled: boolean
  onChange: (enabled: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(36,180,126,0.2)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a]",
        enabled ? "bg-accent-green" : "bg-[#404040]"
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
