'use client';

import { useState } from 'react';
import {
  Shield,
  Mail,
  Bell,
  Database,
  Globe,
  Key,
  Save,
  Loader2,
  AlertCircle,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    platformName: 'Forma',
    supportEmail: 'support@formaeg.com',
    defaultLanguage: 'en',
    timezone: 'Africa/Cairo',
    freeTrialDays: 7,
    proPrice: 99,
    elitePrice: 299,
    platformCommission: 15,
    twoFactorRequired: true,
    strongPasswordRequired: true,
    sessionTimeout: '60',
    apiRateLimit: 100,
    loginAttemptsLimit: 5,
    newUserNotifications: true,
    trainerAppNotifications: true,
    paymentIssueNotifications: true,
    dailySummary: false,
  });

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save - in production this would call an API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({
      title: 'Settings saved',
      description: 'Your changes have been saved successfully.',
    });
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Configure platform settings and preferences
          </p>
        </div>
        <Button variant="forma" onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">
            <Globe className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="api">
            <Key className="mr-2 h-4 w-4" />
            API
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>
                General platform configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Platform Name</Label>
                  <Input
                    value={settings.platformName}
                    onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Support Email</Label>
                  <Input
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Language</Label>
                  <Select
                    value={settings.defaultLanguage}
                    onValueChange={(v) => setSettings({ ...settings, defaultLanguage: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select
                    value={settings.timezone}
                    onValueChange={(v) => setSettings({ ...settings, timezone: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Cairo">Cairo (GMT+2)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Free Trial Days</Label>
                  <Input
                    type="number"
                    value={settings.freeTrialDays}
                    onChange={(e) => setSettings({ ...settings, freeTrialDays: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pro Price (EGP)</Label>
                  <Input
                    type="number"
                    value={settings.proPrice}
                    onChange={(e) => setSettings({ ...settings, proPrice: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Elite Price (EGP)</Label>
                  <Input
                    type="number"
                    value={settings.elitePrice}
                    onChange={(e) => setSettings({ ...settings, elitePrice: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trainer Commission</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Platform Commission (%)</Label>
                <Input
                  type="number"
                  value={settings.platformCommission}
                  onChange={(e) => setSettings({ ...settings, platformCommission: parseInt(e.target.value) || 0 })}
                />
                <p className="text-sm text-muted-foreground">
                  Trainers will receive the remaining {100 - settings.platformCommission}% of their earnings
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Require 2FA for admin accounts
                  </p>
                </div>
                <Switch
                  checked={settings.twoFactorRequired}
                  onCheckedChange={(v) => setSettings({ ...settings, twoFactorRequired: v })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Password Requirements</p>
                  <p className="text-sm text-muted-foreground">
                    Enforce strong password policy
                  </p>
                </div>
                <Switch
                  checked={settings.strongPasswordRequired}
                  onCheckedChange={(v) => setSettings({ ...settings, strongPasswordRequired: v })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Session Timeout</p>
                  <p className="text-sm text-muted-foreground">
                    Auto-logout after inactivity
                  </p>
                </div>
                <Select
                  value={settings.sessionTimeout}
                  onValueChange={(v) => setSettings({ ...settings, sessionTimeout: v })}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rate Limiting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>API Rate Limit (requests/min)</Label>
                  <Input
                    type="number"
                    value={settings.apiRateLimit}
                    onChange={(e) => setSettings({ ...settings, apiRateLimit: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Login Attempts Before Lock</Label>
                  <Input
                    type="number"
                    value={settings.loginAttemptsLimit}
                    onChange={(e) => setSettings({ ...settings, loginAttemptsLimit: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New User Signup</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when new users register
                  </p>
                </div>
                <Switch
                  checked={settings.newUserNotifications}
                  onCheckedChange={(v) => setSettings({ ...settings, newUserNotifications: v })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Trainer Applications</p>
                  <p className="text-sm text-muted-foreground">
                    Notifications for new trainer applications
                  </p>
                </div>
                <Switch
                  checked={settings.trainerAppNotifications}
                  onCheckedChange={(v) => setSettings({ ...settings, trainerAppNotifications: v })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Payment Issues</p>
                  <p className="text-sm text-muted-foreground">
                    Alerts for failed payments or disputes
                  </p>
                </div>
                <Switch
                  checked={settings.paymentIssueNotifications}
                  onCheckedChange={(v) => setSettings({ ...settings, paymentIssueNotifications: v })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Daily Summary</p>
                  <p className="text-sm text-muted-foreground">
                    Daily report of platform activity
                  </p>
                </div>
                <Switch
                  checked={settings.dailySummary}
                  onCheckedChange={(v) => setSettings({ ...settings, dailySummary: v })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              API keys and secrets are managed through environment variables for security.
              Contact your system administrator to update these values.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>API Base URL</Label>
                <Input value={process.env.NEXT_PUBLIC_API_URL || 'https://api.formaeg.com'} readOnly className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>API Version</Label>
                <Input value="v1" readOnly className="bg-muted" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Third-Party Integrations</CardTitle>
              <CardDescription>
                These values are configured via environment variables and cannot be changed here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>OpenAI API Key</Label>
                <Input type="password" value="sk-••••••••••••••••" readOnly className="bg-muted" />
                <p className="text-xs text-muted-foreground">Environment variable: OPENAI_API_KEY</p>
              </div>
              <div className="space-y-2">
                <Label>Stripe Secret Key</Label>
                <Input type="password" value="sk_••••••••••••••••" readOnly className="bg-muted" />
                <p className="text-xs text-muted-foreground">Environment variable: STRIPE_SECRET_KEY</p>
              </div>
              <div className="space-y-2">
                <Label>SendGrid API Key</Label>
                <Input type="password" value="SG.••••••••••••••••" readOnly className="bg-muted" />
                <p className="text-xs text-muted-foreground">Environment variable: SENDGRID_API_KEY</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
