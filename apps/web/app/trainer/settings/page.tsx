'use client';

import { useState, useEffect, useRef } from 'react';
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
  Camera,
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
import { trainersApi, usersApi, uploadApi } from '@/lib/api';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n';

export default function TrainerSettingsPage() {
  const { data: userData, isLoading: userLoading, refetch: refetchUser } = useUser();
  const { toast } = useToast();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
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

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: t.settings.profile.invalidFile, description: t.settings.profile.invalidFileDesc, variant: 'destructive' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: t.settings.profile.fileTooLarge, description: t.settings.profile.fileTooLargeDesc, variant: 'destructive' });
      return;
    }

    setIsUploadingPhoto(true);
    try {
      await uploadApi.uploadAvatar(file);
      await refetchUser();
      toast({ title: t.settings.profile.photoUpdated, description: t.settings.profile.photoUpdatedDesc });
    } catch {
      toast({ title: t.settings.profile.uploadFailed, description: t.settings.profile.uploadFailedDesc, variant: 'destructive' });
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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
      toast({ title: t.settings.profile.profileUpdated, description: t.settings.profile.profileUpdatedDesc });
    } catch (error) {
      toast({ title: t.settings.profile.errorTitle, description: t.settings.profile.saveError, variant: 'destructive' });
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
          <h1 className="text-3xl font-bold">{t.trainer.settings}</h1>
          <p className="text-muted-foreground">
            {t.trainer.settingsSubtitle}
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="btn-primary">
          {isSaving ? (
            <>
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
              {t.trainer.saving}
            </>
          ) : (
            <>
              <Save className="me-2 h-4 w-4" />
              {t.trainer.saveChanges}
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="profile">
            <User className="me-2 h-4 w-4" />
            {t.trainer.tabProfile}
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="me-2 h-4 w-4" />
            {t.trainer.tabNotifications}
          </TabsTrigger>
          <TabsTrigger value="availability">
            <Clock className="me-2 h-4 w-4" />
            {t.trainer.tabAvailability}
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="me-2 h-4 w-4" />
            {t.trainer.tabBilling}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Profile Photo */}
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle>{t.trainer.profilePhoto}</CardTitle>
              <CardDescription>
                {t.trainer.profilePhotoDesc}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-primary/30">
                <AvatarImage src={trainerProfile?.user?.avatarUrl || undefined} />
                <AvatarFallback className="text-2xl bg-primary text-white">
                  {profile.firstName && profile.lastName
                    ? `${profile.firstName[0]}${profile.lastName[0]}`
                    : 'TR'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={isUploadingPhoto}
                />
                <Button
                  variant="outline"
                  className="border-primary/50 hover:bg-primary/10"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                >
                  {isUploadingPhoto ? (
                    <>
                      <Loader2 className="me-2 h-4 w-4 animate-spin" />
                      {t.trainer.uploading}
                    </>
                  ) : (
                    <>
                      <Camera className="me-2 h-4 w-4" />
                      {t.trainer.changePhoto}
                    </>
                  )}
                </Button>
                <p className="text-sm text-muted-foreground">
                  {t.trainer.photoHint}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle>{t.trainer.basicInfo}</CardTitle>
              <CardDescription>{t.trainer.basicInfoDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t.trainer.firstName}</Label>
                  <Input
                    value={profile.firstName}
                    onChange={(e) =>
                      setProfile({ ...profile, firstName: e.target.value })
                    }
                    className="bg-muted/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.trainer.lastName}</Label>
                  <Input
                    value={profile.lastName}
                    onChange={(e) =>
                      setProfile({ ...profile, lastName: e.target.value })
                    }
                    className="bg-muted/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.trainer.email}</Label>
                  <Input
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-muted/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.trainer.phone}</Label>
                  <Input
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    className="bg-muted/50 border-border/50"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>{t.trainer.hourlyRate}</Label>
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
                <Label>{t.trainer.bio}</Label>
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
                    {t.trainer.trainerTier}
                  </CardTitle>
                  <CardDescription>{t.trainer.trainerTierDesc}</CardDescription>
                </div>
                <Badge className={
                  trainerTier === 'TRUSTED_PARTNER'
                    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                    : 'bg-muted'
                }>
                  {trainerTier === 'TRUSTED_PARTNER' ? t.trainer.trustedPartner : t.trainer.regularTrainer}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                  <p className="text-sm text-muted-foreground mb-1">{t.trainer.commissionRate}</p>
                  <p className="text-2xl font-bold">{commissionRate}%</p>
                </div>
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                  <p className="text-sm text-muted-foreground mb-1">{t.trainer.youKeep}</p>
                  <p className="text-2xl font-bold text-green-400">{keepRate}%</p>
                </div>
              </div>
              {trainerTier !== 'TRUSTED_PARTNER' && (
                <div className="mt-4 p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <p className="text-sm">
                    <span className="font-medium">{t.trainer.becomePartnerPrompt}</span>{' '}
                    <span className="text-muted-foreground">
                      {t.trainer.becomePartnerDesc}
                    </span>
                  </p>
                  <Button variant="outline" className="mt-3 border-primary/50">
                    {t.trainer.learnMore}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle>{t.trainer.notificationPrefs}</CardTitle>
              <CardDescription>
                {t.trainer.notificationPrefsDesc}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                {
                  key: 'newClient',
                  title: t.trainer.notifNewClient,
                  description: t.trainer.notifNewClientDesc,
                },
                {
                  key: 'sessionReminder',
                  title: t.trainer.notifSessionReminder,
                  description: t.trainer.notifSessionReminderDesc,
                },
                {
                  key: 'messageAlert',
                  title: t.trainer.notifMessageAlert,
                  description: t.trainer.notifMessageAlertDesc,
                },
                {
                  key: 'weeklyReport',
                  title: t.trainer.notifWeeklyReport,
                  description: t.trainer.notifWeeklyReportDesc,
                },
                {
                  key: 'marketingEmails',
                  title: t.trainer.notifMarketing,
                  description: t.trainer.notifMarketingDesc,
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
              <CardTitle>{t.trainer.workingHours}</CardTitle>
              <CardDescription>
                {t.trainer.workingHoursDesc}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>{t.trainer.timezone}</Label>
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
                            <SelectItem value="open">{t.trainer.open}</SelectItem>
                            <SelectItem value="closed">{t.trainer.closed}</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            type="time"
                            defaultValue="09:00"
                            className="w-28 bg-muted/50 border-border/50"
                            disabled={isClosed}
                          />
                          <span className="text-muted-foreground">{t.trainer.timeTo}</span>
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
              <CardTitle>{t.trainer.payoutMethod}</CardTitle>
              <CardDescription>
                {t.trainer.payoutMethodDesc}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/30 border border-amber-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-amber-500/20">
                      <Wallet className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{t.trainer.paymobIntegration}</p>
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50">
                          {t.trainer.paymobComingSoon}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t.trainer.paymobOptions}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {t.trainer.paymobNote}
              </p>
            </CardContent>
          </Card>

          {/* Commission Info */}
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle>{t.trainer.commissionAndPayouts}</CardTitle>
              <CardDescription>{t.trainer.commissionAndPayoutsDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                  <p className="text-sm text-muted-foreground mb-1">{t.trainer.platformFee}</p>
                  <p className="text-2xl font-bold text-orange-400">{commissionRate}%</p>
                </div>
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                  <p className="text-sm text-muted-foreground mb-1">{t.trainer.yourShare}</p>
                  <p className="text-2xl font-bold text-green-400">{keepRate}%</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                <h4 className="font-medium mb-3">{t.trainer.payoutSchedule}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.trainer.payoutProcessing}</span>
                    <span>{t.trainer.payoutEverySunday}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.trainer.minimumPayout}</span>
                    <span>500 EGP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.trainer.transferTime}</span>
                    <span>{t.trainer.businessDays}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">{t.trainer.needHelp}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t.trainer.needHelpDesc}
                    </p>
                    <Button variant="link" className="p-0 h-auto text-primary mt-2">
                      {t.trainer.contactSupport}
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
