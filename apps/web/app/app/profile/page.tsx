'use client';

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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

const userStats = [
  { label: 'Workouts', value: '47' },
  { label: 'Streak', value: '12 days' },
  { label: 'Total Volume', value: '156K kg' },
];

const menuItems = [
  {
    section: 'Account',
    items: [
      { icon: User, label: 'Edit Profile', href: '/app/profile/edit' },
      { icon: CreditCard, label: 'Subscription', href: '/app/profile/subscription', badge: 'Pro' },
      { icon: Lock, label: 'Privacy & Security', href: '/app/profile/security' },
      { icon: Bell, label: 'Notifications', href: '/app/profile/notifications' },
    ],
  },
  {
    section: 'Preferences',
    items: [
      { icon: Settings, label: 'App Settings', href: '/app/profile/settings' },
      { icon: Dumbbell, label: 'Workout Preferences', href: '/app/profile/workout-preferences' },
    ],
  },
  {
    section: 'Support',
    items: [
      { icon: HelpCircle, label: 'Help Center', href: '/help' },
      { icon: Star, label: 'Rate the App', href: '#' },
      { icon: Share2, label: 'Share Forma', href: '#' },
    ],
  },
];

const achievements = [
  { title: 'Early Adopter', description: 'Joined Forma in the first month', icon: Trophy },
  { title: '7 Day Streak', description: 'Worked out 7 days in a row', icon: Dumbbell },
  { title: '100 Workouts', description: 'Completed 100 workouts', icon: Star },
];

export default function ProfilePage() {
  return (
    <div className="space-y-6 pb-20 lg:ml-64 lg:pb-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback className="text-2xl">AM</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">Ahmed Mohamed</h1>
                <Badge variant="forma">Pro</Badge>
              </div>
              <p className="text-muted-foreground">ahmed@example.com</p>
              <p className="mt-1 text-sm text-muted-foreground">Member since March 2024</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/app/profile/edit">Edit</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-6">
            {userStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold">{stat.value}</p>
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
          <Switch defaultChecked />
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold">Achievements</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/app/achievements">
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
            {section.items.map((item, index) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-between px-6 py-3 transition-colors hover:bg-muted"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.badge && <Badge variant="forma">{item.badge}</Badge>}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Logout */}
      <Card>
        <CardContent className="p-0">
          <button className="flex w-full items-center gap-3 px-6 py-3 text-destructive transition-colors hover:bg-destructive/10">
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
