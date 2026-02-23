'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronRight,
  ClipboardList,
  CreditCard,
  Globe,
  HelpCircle,
  Lock,
  LogOut,
  Moon,
  Settings,
  Share2,
  Star,
  User,
  Dumbbell,
  Trophy,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton, SkeletonStatCard } from '@/components/ui/skeleton';
import { removeAuthCookie, achievementsApi } from '@/lib/api';
import { useUser, useUserStats } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/lib/i18n';

function getMenuItems(isAr: boolean) {
  return [
    {
      section: isAr ? 'الحساب' : 'Account',
      items: [
        { icon: User, label: isAr ? 'تعديل الملف' : 'Edit Profile', href: '/profile/edit' },
        { icon: CreditCard, label: isAr ? 'الاشتراك' : 'Subscription', href: '/profile/subscription' },
        { icon: Star, label: isAr ? 'مدربي' : 'My Trainer', href: '/trainers', badge: isAr ? 'جديد' : 'NEW' },
        { icon: ClipboardList, label: isAr ? 'تقييم اللياقة' : 'Fitness Assessment', href: '/profile/assessment', badge: isAr ? 'جديد' : 'NEW' },
        { icon: Lock, label: isAr ? 'الخصوصية والأمان' : 'Privacy & Security', href: '/profile/security' },
      ],
    },
    {
      section: isAr ? 'التفضيلات' : 'Preferences',
      items: [
        { icon: Settings, label: isAr ? 'إعدادات التطبيق' : 'App Settings', href: '/profile/settings' },
        { icon: Dumbbell, label: isAr ? 'تفضيلات التمارين' : 'Workout Preferences', href: '/profile/workout-preferences' },
      ],
    },
    {
      section: isAr ? 'الدعم' : 'Support',
      items: [
        { icon: HelpCircle, label: isAr ? 'مركز المساعدة' : 'Help Center', href: '/help' },
        { icon: Star, label: isAr ? 'قيّم التطبيق' : 'Rate the App', href: '', action: 'rate' },
        { icon: Share2, label: isAr ? 'شارك فورما' : 'Share Forma', href: '', action: 'share' },
      ],
    },
  ];
}

function getDefaultAchievements(isAr: boolean) {
  return [
    { title: isAr ? 'من الأوائل' : 'Early Adopter', description: isAr ? 'انضم لفورما في أول شهر' : 'Joined Forma in the first month', icon: Trophy },
    { title: isAr ? '٧ أيام متواصلة' : '7 Day Streak', description: isAr ? 'اتمرن ٧ أيام ورا بعض' : 'Worked out 7 days in a row', icon: Dumbbell },
    { title: isAr ? '١٠٠ تمرين' : '100 Workouts', description: isAr ? 'خلّص ١٠٠ تمرين' : 'Completed 100 workouts', icon: Star },
  ];
}

function formatVolume(kg: number, isAr: boolean): string {
  const unit = isAr ? 'كجم' : 'kg';
  if (kg >= 1000000) {
    return isAr ? `${(kg / 1000000).toFixed(1)} مليون ${unit}` : `${(kg / 1000000).toFixed(1)}M kg`;
  } else if (kg >= 1000) {
    return isAr ? `${(kg / 1000).toFixed(0)} ألف ${unit}` : `${(kg / 1000).toFixed(0)}K kg`;
  }
  return `${kg} ${unit}`;
}

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { t, language, setLang } = useLanguage();
  const isAr = language === 'ar';
  const { data: userData, isLoading: userLoading } = useUser();
  const { data: statsData, isLoading: statsLoading } = useUserStats();
  const [achievements, setAchievements] = useState(getDefaultAchievements(isAr));
  const menuItems = getMenuItems(isAr);

  useEffect(() => {
    achievementsApi.getAll().then((data) => {
      if (data && data.length > 0) {
        const iconMap: Record<string, typeof Trophy> = {
          streak: Dumbbell, workout: Dumbbell, strength: Trophy, nutrition: Star,
        };
        setAchievements(data.slice(0, 5).map((a: any) => ({
          title: isAr
            ? (a.nameAr || a.name || a.title || 'إنجاز')
            : (a.nameEn || a.name || a.title || 'Achievement'),
          description: isAr
            ? (a.descriptionAr || a.description || '')
            : (a.descriptionEn || a.description || ''),
          icon: iconMap[a.category?.toLowerCase()] || Trophy,
        })));
      } else {
        setAchievements(getDefaultAchievements(isAr));
      }
    }).catch(() => {
      setAchievements(getDefaultAchievements(isAr));
    });
  }, [isAr]);

  const handleLogout = () => {
    removeAuthCookie();
    router.push('/login');
  };

  const handleShare = async () => {
    const shareTitle = isAr ? 'فورما فيتنس' : 'Forma Fitness';
    const shareText = isAr
      ? 'جرب فورما - أحسن تطبيق لياقة للمصريين!'
      : 'Check out Forma - the best fitness app for Egyptians!';
    const copiedMsg = isAr ? 'تم نسخ اللينك!' : 'Share link copied!';

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: 'https://formaeg.com',
        });
      } catch (err) {
        toast({ title: copiedMsg, description: 'formaeg.com' });
      }
    } else {
      toast({ title: copiedMsg, description: 'formaeg.com' });
    }
  };

  const handleRateApp = () => {
    toast({
      title: isAr ? 'قريباً' : 'Coming Soon',
      description: isAr ? 'تقييم التطبيق هيكون متاح قريباً' : 'App Store rating will be available soon',
    });
  };

  const user = userData?.user;
  const isLoading = userLoading;

  // Format stats
  const userStats = [
    { label: isAr ? 'تمارين' : 'Workouts', value: statsData?.totalWorkouts?.toString() || '0' },
    { label: isAr ? 'متواصل' : 'Streak', value: statsData?.currentStreak ? `${statsData.currentStreak} ${isAr ? 'يوم' : 'days'}` : isAr ? '٠ يوم' : '0 days' },
    { label: isAr ? 'إجمالي الحجم' : 'Total Volume', value: statsData?.totalVolume ? formatVolume(statsData.totalVolume, isAr) : isAr ? '٠ كجم' : '0 kg' },
  ];

  // Get user initials
  const getInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name[0]?.toUpperCase() || 'U';
  };

  // Format date
  const formatMemberSince = () => {
    if (!user?.createdAt) return '';
    const date = new Date(user.createdAt);
    if (isAr) {
      return `عضو من ${date.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}`;
    }
    return `Member since ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-20">
        <div className="rounded-2xl border border-border/60 bg-white dark:bg-card p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => <SkeletonStatCard key={i} />)}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="rounded-xl border border-border/60 bg-white dark:bg-card p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="h-4 w-32 flex-1" />
                <Skeleton className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              {(user?.avatarUrl || user?.avatar) && (
                <AvatarImage src={user.avatarUrl || user.avatar} alt={user.name || (isAr ? 'مستخدم' : 'User')} />
              )}
              <AvatarFallback className="text-2xl bg-forma-orange text-white">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">
                  {user?.name || (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (isAr ? 'مستخدم' : 'User'))}
                </h1>
                {(() => {
                  const sub = user?.subscription;
                  const subTier = sub ? (typeof sub === 'object' ? sub.tier : String(sub)) : null;
                  if (!subTier || subTier === 'FREE') return null;
                  return (
                    <Badge variant="forma">
                      {subTier === 'PREMIUM' ? (isAr ? 'بريميوم' : 'Premium') : subTier === 'PREMIUM_PLUS' ? (isAr ? 'بريميوم+' : 'Premium+') : subTier}
                    </Badge>
                  );
                })()}
              </div>
              <p className="text-muted-foreground">{user?.email || ''}</p>
              <p className="mt-1 text-sm text-muted-foreground">{formatMemberSince()}</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/profile/edit">{t.common.edit}</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-6">
            {userStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold">
                  {statsLoading ? <Loader2 className="mx-auto h-6 w-6 animate-spin" /> : stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Toggles */}
      <Card>
        <CardContent className="space-y-0 p-0">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Moon className="h-5 w-5" />
              <span className="font-medium">{t.settings.appearance.dark}</span>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>
          <div className="border-t" />
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5" />
              <span className="font-medium">{isAr ? 'اللغة' : 'Language'}</span>
            </div>
            <button
              onClick={() => setLang(isAr ? 'en' : 'ar')}
              className="rounded-lg bg-muted px-3 py-1.5 text-sm font-medium hover:bg-muted/80 transition-colors"
            >
              {isAr ? 'English' : 'العربية'}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold">{t.achievements.title}</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/achievements">
              {t.achievements.viewAll}
              <ChevronRight className="ms-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {achievements.map((achievement) => (
              <div
                key={achievement.title}
                className="flex min-w-[140px] flex-col items-center rounded-lg border p-4 text-center"
              >
                <div className="rounded-full bg-forma-orange/10 p-3">
                  <achievement.icon className="h-6 w-6 text-forma-orange" />
                </div>
                <p className="mt-2 text-sm font-medium">{achievement.title}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Menu Items */}
      {menuItems.map((section) => (
        <Card key={section.section}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {section.section}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {section.items.map((item) => {
              const content = (
                <>
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {'badge' in item && (item as any).badge && <Badge variant="forma">{(item as any).badge as string}</Badge>}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </>
              );

              if ((item as any).action) {
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      if ((item as any).action === 'rate') handleRateApp();
                      if ((item as any).action === 'share') handleShare();
                    }}
                    className="flex w-full items-center justify-between px-6 py-3 transition-colors hover:bg-muted"
                  >
                    {content}
                  </button>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center justify-between px-6 py-3 transition-colors hover:bg-muted"
                >
                  {content}
                </Link>
              );
            })}
          </CardContent>
        </Card>
      ))}

      {/* Logout */}
      <Card>
        <CardContent className="p-0">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-6 py-3 text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-5 w-5" />
            <span>{t.profile.logout}</span>
          </button>
        </CardContent>
      </Card>

      {/* App Version */}
      <p className="text-center text-sm text-muted-foreground">{isAr ? 'فورما v1.0.0' : 'Forma v1.0.0'}</p>
    </div>
  );
}
