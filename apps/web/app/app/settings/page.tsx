'use client';

import { useState } from 'react';
import {
  Bell,
  ChevronRight,
  CreditCard,
  Globe,
  HelpCircle,
  Key,
  LogOut,
  Moon,
  Shield,
  Smartphone,
  Sun,
  User,
  Volume2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const user = {
  name: 'Ahmed Hassan',
  email: 'ahmed@example.com',
  avatar: null,
  subscription: 'pro',
  memberSince: 'March 2024',
};

export default function SettingsPage() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark');
  const [language, setLanguage] = useState('en');
  const [unit, setUnit] = useState('metric');
  const [notifications, setNotifications] = useState({
    workoutReminders: true,
    mealReminders: true,
    progressUpdates: true,
    trainerMessages: true,
    marketing: false,
    sounds: true,
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  return (
    <div className="space-y-6 pb-20 lg:ml-64 lg:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.avatar || undefined} />
                  <AvatarFallback className="text-xl">
                    {user.name.split(' ').map((n) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Member since {user.memberSince}
                  </p>
                </div>
                <Button variant="outline" className="ml-auto">
                  Change Photo
                </Button>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Full Name</Label>
                  <Input defaultValue={user.name} className="mt-1.5" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input defaultValue={user.email} className="mt-1.5" disabled />
                </div>
              </div>

              <Button variant="forma">Save Changes</Button>
            </CardContent>
          </Card>

          {/* Subscription Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Subscription</CardTitle>
                  <CardDescription>Manage your subscription plan</CardDescription>
                </div>
                <Badge variant="forma" className="text-sm">
                  {user.subscription.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Pro Plan</p>
                    <p className="text-sm text-muted-foreground">
                      199 EGP/month • Renews March 1, 2025
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  View Billing History
                </Button>
                <Button variant="outline" className="flex-1">
                  Update Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                onClick={() => setShowPasswordDialog(true)}
              >
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Change Password</p>
                    <p className="text-sm text-muted-foreground">
                      Last changed 3 months ago
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Active Sessions</p>
                    <p className="text-sm text-muted-foreground">
                      Manage your logged-in devices
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how Forma looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? (
                    <Moon className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Sun className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">Theme</p>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred theme
                    </p>
                  </div>
                </div>
                <Select value={theme} onValueChange={(v) => setTheme(v as typeof theme)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Language & Region</CardTitle>
              <CardDescription>Set your language and measurement preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Language</p>
                    <p className="text-sm text-muted-foreground">
                      Select your preferred language
                    </p>
                  </div>
                </div>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Units</p>
                  <p className="text-sm text-muted-foreground">
                    Choose your measurement system
                  </p>
                </div>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                    <SelectItem value="imperial">Imperial (lb, in)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workout Preferences</CardTitle>
              <CardDescription>Customize your workout experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Default Rest Timer</p>
                  <p className="text-sm text-muted-foreground">
                    Set your default rest time between sets
                  </p>
                </div>
                <Select defaultValue="90">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">60 seconds</SelectItem>
                    <SelectItem value="90">90 seconds</SelectItem>
                    <SelectItem value="120">120 seconds</SelectItem>
                    <SelectItem value="180">180 seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-start Rest Timer</p>
                  <p className="text-sm text-muted-foreground">
                    Start timer after completing a set
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Vibration</p>
                  <p className="text-sm text-muted-foreground">
                    Vibrate when rest timer ends
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Push Notifications</CardTitle>
              <CardDescription>Choose what notifications you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Workout Reminders</p>
                    <p className="text-sm text-muted-foreground">
                      Get reminded about scheduled workouts
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notifications.workoutReminders}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, workoutReminders: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Meal Reminders</p>
                  <p className="text-sm text-muted-foreground">
                    Reminders to log your meals
                  </p>
                </div>
                <Switch
                  checked={notifications.mealReminders}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, mealReminders: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Progress Updates</p>
                  <p className="text-sm text-muted-foreground">
                    Weekly progress summaries and milestones
                  </p>
                </div>
                <Switch
                  checked={notifications.progressUpdates}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, progressUpdates: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Trainer Messages</p>
                  <p className="text-sm text-muted-foreground">
                    Messages from your personal trainer
                  </p>
                </div>
                <Switch
                  checked={notifications.trainerMessages}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, trainerMessages: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Marketing & Promotions</p>
                  <p className="text-sm text-muted-foreground">
                    News, tips, and special offers
                  </p>
                </div>
                <Switch
                  checked={notifications.marketing}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, marketing: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sound</CardTitle>
              <CardDescription>Configure notification sounds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Volume2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Notification Sounds</p>
                    <p className="text-sm text-muted-foreground">
                      Play sounds for notifications
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notifications.sounds}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, sounds: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data & Privacy</CardTitle>
              <CardDescription>Manage your data and privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Profile Visibility</p>
                  <p className="text-sm text-muted-foreground">
                    Allow other users to see your profile
                  </p>
                </div>
                <Select defaultValue="friends">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="friends">Friends Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Share Progress</p>
                  <p className="text-sm text-muted-foreground">
                    Allow sharing your progress on leaderboards
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Export or delete your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Export Data</p>
                  <p className="text-sm text-muted-foreground">
                    Download all your Forma data
                  </p>
                </div>
                <Button variant="outline">Export</Button>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-destructive/20 p-4">
                <div>
                  <p className="font-medium text-destructive">Delete Account</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and data
                  </p>
                </div>
                <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <HelpCircle className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Help Center</p>
                    <p className="text-sm text-muted-foreground">
                      Get help with Forma
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>

              <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Current Password</Label>
              <Input type="password" className="mt-1.5" />
            </div>
            <div>
              <Label>New Password</Label>
              <Input type="password" className="mt-1.5" />
            </div>
            <div>
              <Label>Confirm New Password</Label>
              <Input type="password" className="mt-1.5" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button variant="forma">Update Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All your data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              To confirm, type <strong>DELETE</strong> below:
            </p>
            <Input className="mt-2" placeholder="Type DELETE to confirm" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive">Delete My Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
