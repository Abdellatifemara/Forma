'use client';

import { useState } from 'react';
import {
  User,
  Bell,
  CreditCard,
  Shield,
  Globe,
  Clock,
  Save,
  Loader2,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function TrainerSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Ahmed Hassan',
    email: 'ahmed.trainer@email.com',
    phone: '+20 100 123 4567',
    bio: 'Certified personal trainer with 5+ years of experience specializing in strength training and body transformation.',
    hourlyRate: '150',
    timezone: 'Africa/Cairo',
  });

  const [notifications, setNotifications] = useState({
    newClient: true,
    sessionReminder: true,
    messageAlert: true,
    weeklyReport: true,
    marketingEmails: false,
  });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your trainer account settings
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

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="availability">
            <Clock className="mr-2 h-4 w-4" />
            Availability
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="mr-2 h-4 w-4" />
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Profile Photo */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
              <CardDescription>
                This will be displayed on your public profile
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl bg-forma-teal text-white">U</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Button variant="outline">Change Photo</Button>
                <p className="text-sm text-muted-foreground">
                  JPG, PNG or GIF. Max 5MB.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hourly Rate (EGP)</Label>
                  <Input
                    type="number"
                    value={profile.hourlyRate}
                    onChange={(e) =>
                      setProfile({ ...profile, hourlyRate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <textarea
                  className="min-h-[100px] w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New Client Requests</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when someone wants to work with you
                  </p>
                </div>
                <Switch
                  checked={notifications.newClient}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, newClient: checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Session Reminders</p>
                  <p className="text-sm text-muted-foreground">
                    Reminders before scheduled sessions
                  </p>
                </div>
                <Switch
                  checked={notifications.sessionReminder}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, sessionReminder: checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Message Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Notifications for new messages
                  </p>
                </div>
                <Switch
                  checked={notifications.messageAlert}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, messageAlert: checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weekly Reports</p>
                  <p className="text-sm text-muted-foreground">
                    Summary of your weekly performance
                  </p>
                </div>
                <Switch
                  checked={notifications.weeklyReport}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, weeklyReport: checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Marketing Emails</p>
                  <p className="text-sm text-muted-foreground">
                    Tips and promotional content
                  </p>
                </div>
                <Switch
                  checked={notifications.marketingEmails}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, marketingEmails: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Working Hours</CardTitle>
              <CardDescription>
                Set your available hours for client sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select value={profile.timezone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Africa/Cairo">
                      Cairo (GMT+2)
                    </SelectItem>
                    <SelectItem value="Asia/Dubai">Dubai (GMT+4)</SelectItem>
                    <SelectItem value="Europe/London">
                      London (GMT+0)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
                  (day) => (
                    <div key={day} className="flex items-center gap-4">
                      <div className="w-24">
                        <p className="font-medium">{day}</p>
                      </div>
                      <Select defaultValue={day === 'Sunday' ? 'closed' : 'open'}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="time"
                        defaultValue="09:00"
                        className="w-28"
                        disabled={day === 'Sunday'}
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="time"
                        defaultValue="18:00"
                        className="w-28"
                        disabled={day === 'Sunday'}
                      />
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payout Method</CardTitle>
              <CardDescription>
                How you receive your earnings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-muted p-2">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Bank Transfer</p>
                      <p className="text-sm text-muted-foreground">
                        ****1234 - National Bank of Egypt
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
              <Button variant="outline">Add Payment Method</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Commission Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Forma takes a 15% commission on all earnings. You keep 85%.
              </p>
              <div className="mt-4 rounded-lg bg-forma-teal/10 p-4">
                <p className="text-sm font-medium text-forma-teal">
                  Your rate: 85% of earnings
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
