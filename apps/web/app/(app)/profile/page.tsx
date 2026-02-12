'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bell,
  ChevronRight,
  CreditCard,
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
import { removeAuthCookie } from '@/lib/api';
import { useUser, useUserStats } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';

const menuItems = [
  {
    section: 'Account',
    items: [
      { icon: User, label: 'Edit Profile', href: '/profile/edit' },
      { icon: CreditCard, label: 'Subscription', href: '/profile/subscription', badge: 'Pro' },
      { icon: Lock, label: 'Privacy & Security', href: '/profile/security' },
      { icon: Bell, label: 'Notifications', href: '/profile/notifications' },
    ],
  },
  {
    section: 'Preferences',
    items: [
      { icon: Settings, label: 'App Settings', href: '/profile/settings' },
      { icon: Dumbbell, label: 'Workout Preferences', href: '/profile/workout-preferences' },
    ],
  },
  {
    section: 'Support',
    items: [
      { icon: HelpCircle, label: 'Help Center', href: '/help' },
      { icon: Star, label: 'Rate the App', href: '', action: 'rate' },
      { icon: Share2, label: 'Share Forma', href: '', action: 'share' },
    ],
  },
];

const achievements = [
  { title: 'Early Adopter', description: 'Joined Forma in the first month', icon: Trophy },
  { title: '7 Day Streak', description: 'Worked out 7 days in a row', icon: Dumbbell },
  { title: '100 Workouts', description: 'Completed 100 workouts', icon: Star },
];

function formatVolume(kg: number): string {
  if (kg >= 1000000) {
    return `${(kg / 1000000).toFixed(1)}M kg`;
  } else if (kg >= 1000) {
    return `${(kg / 1000).toFixed(0)}K kg`;
  }
  return `${kg} kg`;
}

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { data: userData, isLoading: userLoading } = useUser();
  const { data: statsData, isLoading: statsLoading } = useUserStats();

  const handleLogout = () => {
    removeAuthCookie();
    router.push('/login');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Forma Fitness',
          text: 'Check out Forma - the best fitness app for Egyptians!',
          url: 'https://formaeg.com',
        });
      } catch (err) {
        toast({ title: 'Share link copied!', description: 'formaeg.com' });
      }
    } else {
      toast({ title: 'Share link copied!', description: 'formaeg.com' });
    }
  };

  const handleRateApp = () => {
    toast({ title: 'Coming Soon', description: 'App Store rating will be available soon' });
  };

  const user = userData?.user;
  const isLoading = userLoading;

  // Format stats
  const userStats = [
    { label: 'Workouts', value: statsData?.totalWorkouts?.toString() || '0' },
    { label: 'Streak', value: statsData?.currentStreak ? `${statsData.currentStreak} days` : '0 days' },
    { label: 'Total Volume', value: statsData?.totalVolume ? formatVolume(statsData.totalVolume) : '0 kg' },
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
    return `Member since ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center lg:ml-64">
        <Loader2 className="h-8 w-8 animate-spin text-forma-teal" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:ml-64 lg:pb-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              {user?.avatar && <AvatarImage src={user.avatar} alt={user.name || 'User'} />}
              <AvatarFallback className="text-2xl bg-forma-teal text-white">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{user?.name || 'User'}</h1>
                {user?.subscription && user.subscription !== 'free' && (
                  <Badge variant="forma">{user.subscription === 'pro' ? 'Pro' : 'Elite'}</Badge>
                )}
              </div>
              <p className="text-muted-foreground">{user?.email || ''}</p>
              <p className="mt-1 text-sm text-muted-foreground">{formatMemberSince()}</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/profile/edit">Edit</Link>
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

      {/* Quick Toggle */}
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Moon className="h-5 w-5" />
            <span className="font-medium">Dark Mode</span>
          </div>
          <Switch
            checked={theme === 'dark'}
            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
          />
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold">Achievements</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/achievements">
              View All
              <ChevronRight className="ml-1 h-4 w-4" />
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
                <div className="rounded-full bg-forma-teal/10 p-3">
                  <achievement.icon className="h-6 w-6 text-forma-teal" />
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
                    {'badge' in item && item.badge && <Badge variant="forma">{item.badge}</Badge>}
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
            <span>Log Out</span>
          </button>
        </CardContent>
      </Card>

      {/* App Version */}
      <p className="text-center text-sm text-muted-foreground">Forma v1.0.0</p>
    </div>
  );
}
