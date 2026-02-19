'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
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
  Loader2,
  Camera,
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
import { useUser, useUpdateProfile } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { removeAuthCookie, uploadApi } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';

export default function SettingsPage() {
  const router = useRouter();
  const { data: userData, isLoading: userLoading, refetch: refetchUser } = useUser();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t, lang, setLang } = useLanguage();

  const user = userData?.user;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
  });
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [language, setLanguage] = useState('en');
  const [unit, setUnit] = useState('metric');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Populate form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      });
      setLanguage(user.language || 'en');
      setUnit(user.measurementUnit || 'metric');
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile.mutateAsync({
        firstName: formData.firstName,
        lastName: formData.lastName,
        language,
        measurementUnit: unit,
      });
      await refetchUser();
      toast({
        title: 'Profile updated',
        description: 'Your changes have been saved successfully.',
      });
    } catch (error) {
      // Error handled
      toast({
        title: 'Error',
        description: 'Failed to save profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image under 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingPhoto(true);
    try {
      // Upload avatar (handles Cloudinary or base64 fallback)
      await uploadApi.uploadAvatar(file);
      await refetchUser();

      toast({
        title: 'Photo updated',
        description: 'Your profile photo has been changed.',
      });
    } catch (error) {
      // Error handled
      toast({
        title: 'Upload failed',
        description: 'Failed to upload photo. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingPhoto(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleLogout = () => {
    removeAuthCookie();
    router.push('/login');
  };

  // Format member since date
  const formatMemberSince = () => {
    if (!user?.createdAt) return '';
    const date = new Date(user.createdAt);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Get initials
  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  if (userLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center lg:ml-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:ml-64 lg:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{t.settings.title}</h1>
        <p className="text-muted-foreground">{t.settings.subtitle}</p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[300px]">
          <TabsTrigger value="account">{t.settings.tabs.account}</TabsTrigger>
          <TabsTrigger value="preferences">{t.settings.tabs.preferences}</TabsTrigger>
          <TabsTrigger value="privacy">{t.settings.tabs.privacy}</TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t.settings.profile.title}</CardTitle>
              <CardDescription>{t.settings.profile.subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user?.avatarUrl || undefined} />
                    <AvatarFallback className="text-xl">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  {isUploadingPhoto && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.displayName || 'User'}
                  </h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t.settings.profile.memberSince} {formatMemberSince()}
                  </p>
                </div>
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
                  className="ml-auto"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                >
                  {isUploadingPhoto ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t.settings.profile.uploading}
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      {t.settings.profile.changePhoto}
                    </>
                  )}
                </Button>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>{t.settings.profile.firstName}</Label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>{t.settings.profile.lastName}</Label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>{t.settings.profile.email}</Label>
                  <Input value={user?.email || ''} className="mt-1.5" disabled />
                </div>
              </div>

              <Button variant="forma" onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.settings.profile.saving}
                  </>
                ) : (
                  t.settings.profile.saveChanges
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Subscription Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t.settings.subscription.title}</CardTitle>
                  <CardDescription>{t.settings.subscription.subtitle}</CardDescription>
                </div>
                <Badge variant="forma" className="text-sm">
                  {(user?.subscription || 'FREE').toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {user?.subscription === 'pro' ? t.settings.subscription.proPlan :
                       user?.subscription === 'elite' ? t.settings.subscription.elitePlan : t.settings.subscription.freePlan}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user?.subscription === 'free' || !user?.subscription
                        ? t.settings.subscription.upgradePrompt
                        : t.settings.subscription.activeSubscription}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  {user?.subscription === 'free' || !user?.subscription ? t.settings.subscription.upgrade : t.settings.subscription.manage}
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  {t.settings.subscription.viewBilling}
                </Button>
                <Button variant="outline" className="flex-1">
                  {t.settings.subscription.updatePayment}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t.settings.security.title}</CardTitle>
              <CardDescription>{t.settings.security.subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                onClick={() => setShowPasswordDialog(true)}
              >
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{t.settings.security.changePassword}</p>
                    <p className="text-sm text-muted-foreground">
                      {t.settings.security.lastChanged}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{t.settings.security.twoFactor}</p>
                    <p className="text-sm text-muted-foreground">
                      {t.settings.security.twoFactorDesc}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  {t.settings.security.enable}
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{t.settings.security.activeSessions}</p>
                    <p className="text-sm text-muted-foreground">
                      {t.settings.security.activeSessionsDesc}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  {t.settings.security.viewAll}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.settings.appearance.title}</CardTitle>
              <CardDescription>{t.settings.appearance.subtitle}</CardDescription>
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
                    <p className="font-medium">{t.settings.appearance.theme}</p>
                    <p className="text-sm text-muted-foreground">
                      {t.settings.appearance.themeDesc}
                    </p>
                  </div>
                </div>
                <Select value={theme} onValueChange={(v) => setTheme(v as typeof theme)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{t.settings.appearance.light}</SelectItem>
                    <SelectItem value="dark">{t.settings.appearance.dark}</SelectItem>
                    <SelectItem value="system">{t.settings.appearance.system}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.settings.language.title}</CardTitle>
              <CardDescription>{t.settings.language.subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{t.settings.language.language}</p>
                    <p className="text-sm text-muted-foreground">
                      {t.settings.language.languageDesc}
                    </p>
                  </div>
                </div>
                <Select value={language} onValueChange={(v) => { setLanguage(v); setLang(v as 'en' | 'ar'); }}>
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
                  <p className="font-medium">{t.settings.language.units}</p>
                  <p className="text-sm text-muted-foreground">
                    {t.settings.language.unitsDesc}
                  </p>
                </div>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metric">{t.settings.language.metric}</SelectItem>
                    <SelectItem value="imperial">{t.settings.language.imperial}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.settings.workout.title}</CardTitle>
              <CardDescription>{t.settings.workout.subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t.settings.workout.defaultRest}</p>
                  <p className="text-sm text-muted-foreground">
                    {t.settings.workout.defaultRestDesc}
                  </p>
                </div>
                <Select defaultValue="90">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">60 {t.settings.workout.seconds}</SelectItem>
                    <SelectItem value="90">90 {t.settings.workout.seconds}</SelectItem>
                    <SelectItem value="120">120 {t.settings.workout.seconds}</SelectItem>
                    <SelectItem value="180">180 {t.settings.workout.seconds}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t.settings.workout.autoStart}</p>
                  <p className="text-sm text-muted-foreground">
                    {t.settings.workout.autoStartDesc}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t.settings.workout.vibration}</p>
                  <p className="text-sm text-muted-foreground">
                    {t.settings.workout.vibrationDesc}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.settings.privacy.title}</CardTitle>
              <CardDescription>{t.settings.privacy.subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t.settings.privacy.profileVisibility}</p>
                  <p className="text-sm text-muted-foreground">
                    {t.settings.privacy.profileVisibilityDesc}
                  </p>
                </div>
                <Select defaultValue="friends">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">{t.settings.privacy.public}</SelectItem>
                    <SelectItem value="friends">{t.settings.privacy.friendsOnly}</SelectItem>
                    <SelectItem value="private">{t.settings.privacy.private}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t.settings.privacy.shareProgress}</p>
                  <p className="text-sm text-muted-foreground">
                    {t.settings.privacy.shareProgressDesc}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.settings.privacy.dataManagement}</CardTitle>
              <CardDescription>{t.settings.privacy.dataManagementDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">{t.settings.privacy.exportData}</p>
                  <p className="text-sm text-muted-foreground">
                    {t.settings.privacy.exportDataDesc}
                  </p>
                </div>
                <Button variant="outline">{t.settings.privacy.export}</Button>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-destructive/20 p-4">
                <div>
                  <p className="font-medium text-destructive">{t.settings.privacy.deleteAccount}</p>
                  <p className="text-sm text-muted-foreground">
                    {t.settings.privacy.deleteAccountDesc}
                  </p>
                </div>
                <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                  {t.common.delete}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.settings.support.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <HelpCircle className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{t.settings.support.helpCenter}</p>
                    <p className="text-sm text-muted-foreground">
                      {t.settings.support.helpCenterDesc}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>

              <Button
                variant="outline"
                className="w-full text-destructive hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t.settings.support.signOut}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={(open) => {
        setShowPasswordDialog(open);
        if (!open) setPasswordForm({ current: '', new: '', confirm: '' });
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.settings.security.changePassword}</DialogTitle>
            <DialogDescription>
              {t.settings.security.enterCurrentPassword}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>{t.settings.security.currentPassword}</Label>
              <Input
                type="password"
                className="mt-1.5"
                value={passwordForm.current}
                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
              />
            </div>
            <div>
              <Label>{t.settings.security.newPassword}</Label>
              <Input
                type="password"
                className="mt-1.5"
                value={passwordForm.new}
                onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
              />
            </div>
            <div>
              <Label>{t.settings.security.confirmNewPassword}</Label>
              <Input
                type="password"
                className="mt-1.5"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              {t.common.cancel}
            </Button>
            <Button
              variant="forma"
              disabled={!passwordForm.current || !passwordForm.new || passwordForm.new !== passwordForm.confirm}
              onClick={() => {
                toast({ title: 'Coming Soon', description: 'Password change will be available soon' });
                setShowPasswordDialog(false);
                setPasswordForm({ current: '', new: '', confirm: '' });
              }}
            >
              {t.settings.security.updatePassword}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={(open) => {
        setShowDeleteDialog(open);
        if (!open) setDeleteConfirmText('');
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.settings.privacy.deleteAccount}</DialogTitle>
            <DialogDescription>
              {t.settings.privacy.deleteAccountWarning}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              {t.settings.privacy.deleteConfirm}
            </p>
            <Input
              className="mt-2"
              placeholder={t.settings.privacy.deleteConfirmPlaceholder}
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              {t.common.cancel}
            </Button>
            <Button
              variant="destructive"
              disabled={deleteConfirmText !== 'DELETE'}
              onClick={() => {
                toast({ title: 'Coming Soon', description: 'Account deletion will be available soon' });
                setShowDeleteDialog(false);
                setDeleteConfirmText('');
              }}
            >
              {t.settings.privacy.deleteMyAccount}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
