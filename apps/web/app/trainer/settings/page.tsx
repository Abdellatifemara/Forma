'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Bell,
  CreditCard,
  Shield,
  Globe,
  Clock,
  Save,
  Loader2,
  Upload,
  Wallet,
  Award,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { trainersApi, usersApi } from '@/lib/api';
import { useUser } from '@/hooks/use-user';

export default function TrainerSettingsPage() {
  const { data: userData, isLoading: userLoading } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [trainerProfile, setTrainerProfile] = useState<any>(null);

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    hourlyRate: '',
    timezone: 'Africa/Cairo',
  });

  const [notifications, setNotifications] = useState({
    newClient: true,
    sessionReminder: true,
    messageAlert: true,
    weeklyReport: true,
    marketingEmails: false,
  });

  // Load trainer profile
  useEffect(() => {
    async function loadProfile() {
      try {
        const trainerData = await trainersApi.getMyProfile();
        setTrainerProfile(trainerData);
        setProfile({
          firstName: trainerData.user?.firstName || '',
          lastName: trainerData.user?.lastName || '',
          email: trainerData.user?.email || '',
          phone: (trainerData.user as any)?.phone || '',
          bio: trainerData.bio || '',
          hourlyRate: trainerData.monthlyPrice?.toString() || '',
          timezone: 'Africa/Cairo',
        });
      } catch (error) {
        // Error handled
      } finally {
        setIsLoadingProfile(false);
      }
    }
    loadProfile();
  }, []);

  const trainerTier = trainerProfile?.tier || 'REGULAR';
  const commissionRate = trainerTier === 'TRUSTED_PARTNER' ? 15 : 20;
  const keepRate = 100 - commissionRate;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await usersApi.updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
      });
      // Note: Full trainer profile update would need additional API endpoint
    } catch (error) {
      // Error handled
    } finally {
      setIsSaving(false);
    }
  };

  if (userLoading || isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your trainer account settings
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="btn-primary">
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

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted/50">
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
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
              <CardDescription>
                This will be displayed on your public profile
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-primary/30">
                <AvatarImage src={trainerProfile?.user?.avatarUrl || undefined} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-cyan-500 to-purple-500 text-white">
                  {profile.firstName && profile.lastName
                    ? `${profile.firstName[0]}${profile.lastName[0]}`
                    : 'TR'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-3">
                <Button variant="outline" className="border-primary/50 hover:bg-primary/10">
                  <Upload className="mr-2 h-4 w-4" />
                  Change Photo
                </Button>
                <p className="text-sm text-muted-foreground">
                  JPG, PNG or GIF. Max 5MB.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    value={profile.firstName}
                    onChange={(e) =>
                      setProfile({ ...profile, firstName: e.target.value })
                    }
                    className="bg-muted/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    value={profile.lastName}
                    onChange={(e) =>
                      setProfile({ ...profile, lastName: e.target.value })
                    }
                    className="bg-muted/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-muted/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    className="bg-muted/50 border-border/50"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Hourly Rate (EGP)</Label>
                  <Input
                    type="number"
                    value={profile.hourlyRate}
                    onChange={(e) =>
                      setProfile({ ...profile, hourlyRate: e.target.value })
                    }
                    className="bg-muted/50 border-border/50 max-w-xs"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  className="min-h-[100px] bg-muted/50 border-border/50"
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Trainer Tier */}
          <Card className={cn(
            "glass",
            trainerTier === 'TRUSTED_PARTNER'
              ? 'border-yellow-500/30 bg-yellow-500/5'
              : 'border-border/50'
          )}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-400" />
                    Trainer Tier
                  </CardTitle>
                  <CardDescription>Your current partnership level</CardDescription>
                </div>
                <Badge className={
                  trainerTier === 'TRUSTED_PARTNER'
                    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                    : 'bg-muted'
                }>
                  {trainerTier === 'TRUSTED_PARTNER' ? 'Trusted Partner' : 'Regular Trainer'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                  <p className="text-sm text-muted-foreground mb-1">Commission Rate</p>
                  <p className="text-2xl font-bold">{commissionRate}%</p>
                </div>
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                  <p className="text-sm text-muted-foreground mb-1">You Keep</p>
                  <p className="text-2xl font-bold text-green-400">{keepRate}%</p>
                </div>
              </div>
              {trainerTier !== 'TRUSTED_PARTNER' && (
                <div className="mt-4 p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <p className="text-sm">
                    <span className="font-medium">Want to become a Trusted Partner?</span>{' '}
                    <span className="text-muted-foreground">
                      Reduce your commission to 5-7% by applying for our partner program.
                    </span>
                  </p>
                  <Button variant="outline" className="mt-3 border-primary/50">
                    Learn More
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                {
                  key: 'newClient',
                  title: 'New Client Requests',
                  description: 'Get notified when someone wants to work with you',
                },
                {
                  key: 'sessionReminder',
                  title: 'Session Reminders',
                  description: 'Reminders before scheduled sessions',
                },
                {
                  key: 'messageAlert',
                  title: 'Message Alerts',
                  description: 'Notifications for new messages',
                },
                {
                  key: 'weeklyReport',
                  title: 'Weekly Reports',
                  description: 'Summary of your weekly performance',
                },
                {
                  key: 'marketingEmails',
                  title: 'Marketing Emails',
                  description: 'Tips and promotional content',
                },
              ].map((item, index) => (
                <div key={item.key}>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/30">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <Switch
                      checked={notifications[item.key as keyof typeof notifications]}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, [item.key]: checked })
                      }
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability" className="space-y-6">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle>Working Hours</CardTitle>
              <CardDescription>
                Set your available hours for client sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select value={profile.timezone} onValueChange={(value) => setProfile({ ...profile, timezone: value })}>
                  <SelectTrigger className="w-full max-w-xs bg-muted/50 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Africa/Cairo">Cairo (GMT+2)</SelectItem>
                    <SelectItem value="Asia/Dubai">Dubai (GMT+4)</SelectItem>
                    <SelectItem value="Asia/Riyadh">Riyadh (GMT+3)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
                  (day) => {
                    const isClosed = day === 'Friday';
                    return (
                      <div
                        key={day}
                        className={cn(
                          'flex items-center gap-4 p-4 rounded-xl border',
                          isClosed
                            ? 'bg-muted/20 border-border/30'
                            : 'bg-muted/30 border-border/50'
                        )}
                      >
                        <div className="w-24">
                          <p className={cn('font-medium', isClosed && 'text-muted-foreground')}>
                            {day}
                          </p>
                        </div>
                        <Select defaultValue={isClosed ? 'closed' : 'open'}>
                          <SelectTrigger className="w-24 bg-muted/50 border-border/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            type="time"
                            defaultValue="09:00"
                            className="w-28 bg-muted/50 border-border/50"
                            disabled={isClosed}
                          />
                          <span className="text-muted-foreground">to</span>
                          <Input
                            type="time"
                            defaultValue="18:00"
                            className="w-28 bg-muted/50 border-border/50"
                            disabled={isClosed}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          {/* Payout Method */}
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle>Payout Method</CardTitle>
              <CardDescription>
                How you receive your earnings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-cyan-500/20">
                      <Wallet className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">Bank Transfer</p>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        ****1234 - National Bank of Egypt
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="border-border/50">
                    Edit
                  </Button>
                </div>
              </div>
              <Button variant="outline" className="border-primary/50 hover:bg-primary/10">
                Add Payment Method
              </Button>
            </CardContent>
          </Card>

          {/* Commission Info */}
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle>Commission & Payouts</CardTitle>
              <CardDescription>Understanding your earnings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                  <p className="text-sm text-muted-foreground mb-1">Platform Fee</p>
                  <p className="text-2xl font-bold text-orange-400">{commissionRate}%</p>
                </div>
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                  <p className="text-sm text-muted-foreground mb-1">Your Share</p>
                  <p className="text-2xl font-bold text-green-400">{keepRate}%</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                <h4 className="font-medium mb-3">Payout Schedule</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Processing</span>
                    <span>Every Sunday</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Minimum Payout</span>
                    <span>500 EGP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transfer Time</span>
                    <span>1-3 business days</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Need Help?</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Contact our support team for any billing or payout questions.
                    </p>
                    <Button variant="link" className="p-0 h-auto text-primary mt-2">
                      Contact Support
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
