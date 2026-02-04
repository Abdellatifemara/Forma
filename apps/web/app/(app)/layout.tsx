'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Dumbbell,
  Utensils,
  TrendingUp,
  User,
  Menu,
  X,
  MessageCircle,
  Bell,
  Sparkles,
  Zap,
  Moon,
  Trophy,
  Target,
  Mic,
  Camera,
  Settings,
  ChevronRight,
  Globe,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const navLinks = [
  { href: '/dashboard', icon: Home, label: 'Home', labelAr: 'الرئيسية' },
  { href: '/workouts', icon: Dumbbell, label: 'Workouts', labelAr: 'التمارين' },
  { href: '/nutrition', icon: Utensils, label: 'Nutrition', labelAr: 'التغذية' },
  { href: '/progress', icon: TrendingUp, label: 'Progress', labelAr: 'التقدم' },
  { href: '/profile', icon: User, label: 'Profile', labelAr: 'الملف' },
];

const quickActions = [
  { icon: Sparkles, label: 'What Now?', href: '/workouts?whatnow=true', color: 'from-violet-500 to-purple-500' },
  { icon: Camera, label: 'Form Check', href: '/workouts?formcheck=true', color: 'from-blue-500 to-cyan-500' },
  { icon: Mic, label: 'Voice Coach', href: '/workouts?voicecoach=true', color: 'from-orange-500 to-red-500' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [showGamification, setShowGamification] = useState(true);

  // Mock user data - replace with real data
  const user = {
    name: 'Ahmed',
    level: 5,
    levelTitle: 'Committed',
    xp: 1250,
    xpForNextLevel: 1500,
    streak: 7,
    badge: '🔥',
    avatar: null,
    ramadanMode: false,
  };

  const xpProgress = (user.xp / user.xpForNextLevel) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header - Premium Glass Effect */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4">
          {/* Left: Logo & Menu */}
          <div className="flex items-center gap-3">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 transition-colors hover:bg-muted lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary">
                <Dumbbell className="h-5 w-5 text-white" />
              </div>
              <span className="hidden font-bold text-lg sm:inline">Forma</span>
            </Link>
          </div>

          {/* Center: XP Bar (Desktop) */}
          <div className="hidden flex-1 max-w-md mx-8 lg:block">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-gold text-xs font-bold text-forma-navy">
                {user.level}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium">{user.levelTitle}</span>
                  <span className="text-muted-foreground">{user.xp} / {user.xpForNextLevel} XP</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-primary transition-all duration-500"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </div>
              {user.streak > 0 && (
                <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1 text-xs font-bold text-white">
                  <span className="fire-animation">🔥</span>
                  {user.streak}
                </div>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {user.ramadanMode && (
              <div className="hidden sm:flex ramadan-indicator">
                <Moon className="h-4 w-4" />
                <span>Ramadan</span>
              </div>
            )}
            <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl" asChild title="Back to Website">
              <Link href="/">
                <Globe className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl" asChild>
              <Link href="/messages">
                <MessageCircle className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-forma-teal animate-pulse" />
            </Button>
            <Link href="/profile">
              <Avatar className="h-10 w-10 border-2 border-forma-teal/30 transition-all hover:border-forma-teal">
                <AvatarImage src={user.avatar || undefined} />
                <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>

        {/* Mobile XP Bar */}
        <div className="flex items-center gap-3 px-4 pb-3 lg:hidden">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-gold text-xs font-bold text-forma-navy">
            {user.level}
          </div>
          <div className="flex-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-primary transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>
          {user.streak > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-2 py-0.5 text-xs font-bold text-white">
              <span className="fire-animation">🔥</span>
              {user.streak}
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[104px] z-40 bg-background/95 backdrop-blur-xl lg:hidden animate-fade-in">
          <nav className="container py-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-4 rounded-2xl px-4 py-4 text-base font-medium transition-all',
                  pathname === link.href
                    ? 'bg-gradient-primary text-white'
                    : 'hover:bg-muted'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <link.icon className="h-5 w-5" />
                <span>{link.label}</span>
                <ChevronRight className="ml-auto h-5 w-5 opacity-50" />
              </Link>
            ))}

            <div className="pt-4 border-t mt-4">
              <p className="px-4 text-sm text-muted-foreground mb-2">Quick Actions</p>
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-4 rounded-2xl px-4 py-4 hover:bg-muted transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r', action.color)}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-medium">{action.label}</span>
                </Link>
              ))}
            </div>

            <Link
              href="/settings"
              className="flex items-center gap-4 rounded-2xl px-4 py-4 hover:bg-muted transition-all mt-4"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Link>

            <Link
              href="/"
              className="flex items-center gap-4 rounded-2xl px-4 py-4 hover:bg-muted transition-all border-t mt-4 pt-4"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Globe className="h-5 w-5" />
              <span>Back to Website</span>
            </Link>
          </nav>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-16 hidden h-[calc(100vh-4rem)] w-64 border-r border-border/50 bg-background/50 backdrop-blur-sm lg:block">
        <div className="flex flex-col h-full p-4">
          <nav className="space-y-1 flex-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gradient-primary text-white shadow-glow'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <link.icon className={cn('h-5 w-5 transition-transform group-hover:scale-110', isActive && 'text-white')} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Quick Actions */}
          <div className="border-t pt-4 space-y-2">
            <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Actions</p>
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r', action.color)}>
                  <action.icon className="h-4 w-4 text-white" />
                </div>
                {action.label}
              </Link>
            ))}
          </div>

          {/* Achievements Preview */}
          <div className="mt-4 rounded-2xl bg-gradient-to-r from-muted to-muted/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Achievements</span>
              <Link href="/achievements" className="text-xs text-forma-teal hover:underline">View All</Link>
            </div>
            <div className="flex gap-2">
              <div className="achievement-badge unlocked h-10 w-10 rounded-xl text-lg">🏆</div>
              <div className="achievement-badge h-10 w-10 rounded-xl text-lg">💪</div>
              <div className="achievement-badge h-10 w-10 rounded-xl text-lg">🎯</div>
            </div>
          </div>

          {/* Back to Website */}
          <Link
            href="/"
            className="mt-4 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
          >
            <Globe className="h-5 w-5" />
            Back to Website
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pb-24 lg:pb-6 lg:pl-64">
        <div className="container py-6 max-w-5xl">
          {children}
        </div>
      </main>

      {/* Floating Action Button (Mobile) */}
      <div className="fixed bottom-24 right-4 z-50 lg:hidden">
        {/* Quick Action Menu */}
        {fabOpen && (
          <div className="absolute bottom-16 right-0 flex flex-col gap-3 animate-fade-up">
            {quickActions.map((action, index) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 animate-scale-in"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => setFabOpen(false)}
              >
                <span className="rounded-full bg-card px-3 py-2 text-sm font-medium shadow-lg">
                  {action.label}
                </span>
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r shadow-lg', action.color)}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* FAB Button */}
        <button
          onClick={() => setFabOpen(!fabOpen)}
          className={cn(
            'fab',
            fabOpen && 'rotate-45'
          )}
        >
          <Zap className="h-6 w-6 text-white" />
        </button>
      </div>

      {/* Bottom Navigation (Mobile) - Premium Design */}
      <div className="bottom-nav-premium lg:hidden">
        <div className="bottom-nav-inner">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn('nav-item', isActive && 'active')}
              >
                <link.icon className={cn('h-5 w-5 transition-all', isActive && 'scale-110')} />
                <span className="text-[10px] font-medium">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
