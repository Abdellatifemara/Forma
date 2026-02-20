'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Dumbbell,
  Utensils,
  TrendingUp,
  User,
  Menu,
  X,
  MessageCircle,
  Sparkles,
  Zap,
  Moon,
  Settings,
  ChevronRight,
  Globe,
  ClipboardList,
  Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useUserStats } from '@/hooks/use-user';
import { useLanguage } from '@/lib/i18n';
import { useSubscription } from '@/hooks/use-subscription';
import { FormaSpinner } from '@/components/ui/skeleton';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const { t, isRTL } = useLanguage();
  const { tier } = useSubscription();
  const { data: userData } = useUser();
  const { data: statsData } = useUserStats();

  useEffect(() => {
    const hasToken = document.cookie.split(';').some(c => c.trim().startsWith('forma-token='));
    if (!hasToken) {
      router.replace('/login?redirect=' + encodeURIComponent(pathname));
      return;
    }
    setAuthChecked(true);
  }, [pathname, router]);

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <FormaSpinner size="lg" />
      </div>
    );
  }

  const navLinks = [
    { href: '/dashboard', icon: Home, label: t.layout.home },
    { href: '/workouts', icon: Dumbbell, label: t.layout.workouts },
    { href: '/chat', icon: MessageCircle, label: t.layout.coach },
    { href: '/nutrition', icon: Utensils, label: t.layout.nutrition },
    { href: '/profile', icon: User, label: t.layout.profile },
  ];

  const quickActions = [
    { icon: Sparkles, label: t.layout.whatNow, href: '/workouts?whatnow=true', color: 'bg-purple-500' },
    { icon: MessageCircle, label: t.layout.coach, href: '/chat', color: 'bg-primary' },
    { icon: Heart, label: t.layout.health, href: '/health', color: 'bg-red-500' },
    { icon: TrendingUp, label: t.layout.progress, href: '/progress', color: 'bg-green-500' },
  ];

  const totalWorkouts = statsData?.totalWorkouts || 0;
  const level = Math.floor(totalWorkouts / 10) + 1;
  const levelTitles = ['Beginner', 'Rookie', 'Dedicated', 'Committed', 'Warrior', 'Champion', 'Legend'];
  const levelTitle = levelTitles[Math.min(level - 1, levelTitles.length - 1)];

  const xp = (totalWorkouts * 100) + Math.floor((statsData?.totalVolume || 0) / 1000);
  const xpForNextLevel = level * 1000;

  const user = {
    name: userData?.user?.firstName || userData?.user?.displayName || 'User',
    level,
    levelTitle,
    xp,
    xpForNextLevel,
    streak: statsData?.currentStreak || 0,
    avatar: userData?.user?.avatarUrl || null,
    ramadanMode: false,
  };

  const xpProgress = Math.min((user.xp / user.xpForNextLevel) * 100, 100);

  return (
    <div className="min-h-screen bg-background">
      {/* Header — Clean white */}
      <header className="sticky top-0 z-50 border-b border-border bg-white dark:bg-card">
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
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                <Dumbbell className="h-5 w-5 text-white" />
              </div>
              <span className="hidden font-bold text-lg sm:inline">Forma</span>
            </Link>
          </div>

          {/* Center: XP Bar (Desktop) */}
          <div className="hidden flex-1 max-w-md mx-8 lg:block">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                {user.level}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium">{user.levelTitle}</span>
                  <span className="text-muted-foreground">{user.xp} / {user.xpForNextLevel} XP</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </div>
              {user.streak > 0 && (
                <div className="flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">
                  {'\uD83D\uDD25'} {user.streak}
                </div>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {user.ramadanMode && (
              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600">
                <Moon className="h-3.5 w-3.5" />
                <span>Ramadan</span>
              </div>
            )}
            <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl" asChild title={t.layout.backToWebsite}>
              <Link href="/">
                <Globe className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl" asChild title={t.layout.coach}>
              <Link href="/chat">
                <MessageCircle className="h-5 w-5" />
              </Link>
            </Button>
            <Link href="/profile">
              <Avatar className="h-10 w-10 border-2 border-primary/20 transition-all hover:border-primary/50">
                <AvatarImage src={user.avatar || undefined} />
                <AvatarFallback className="bg-primary text-white font-semibold">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>

        {/* Mobile XP Bar */}
        <div className="flex items-center gap-3 px-4 pb-3 lg:hidden">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
            {user.level}
          </div>
          <div className="flex-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>
          {user.streak > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5 text-xs font-bold text-white">
              {'\uD83D\uDD25'} {user.streak}
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[104px] z-40 bg-white dark:bg-card lg:hidden animate-fade-in overflow-y-auto">
          <nav className="container py-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-4 rounded-2xl px-4 py-4 text-base font-medium transition-all',
                  pathname === link.href
                    ? 'bg-primary text-white'
                    : 'hover:bg-muted'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <link.icon className="h-5 w-5" />
                <span>{link.label}</span>
                <ChevronRight className={cn("ms-auto h-5 w-5 opacity-50", isRTL && "rotate-180")} />
              </Link>
            ))}

            <div className="pt-4 border-t mt-4">
              <p className="px-4 text-sm text-muted-foreground mb-2">{t.layout.quickActions}</p>
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-4 rounded-2xl px-4 py-4 hover:bg-muted transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', action.color)}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-medium">{action.label}</span>
                </Link>
              ))}
            </div>

            <Link
              href="/tests"
              className="flex items-center gap-4 rounded-2xl px-4 py-4 hover:bg-muted transition-all mt-4 border border-primary/20 bg-primary/5"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <ClipboardList className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-medium">{t.layout.personalize}</span>
                <p className="text-xs text-muted-foreground">{t.layout.personalizeDesc}</p>
              </div>
            </Link>

            <Link
              href="/settings"
              className="flex items-center gap-4 rounded-2xl px-4 py-4 hover:bg-muted transition-all mt-4"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Settings className="h-5 w-5" />
              <span>{t.layout.settings}</span>
            </Link>

            <Link
              href="/"
              className="flex items-center gap-4 rounded-2xl px-4 py-4 hover:bg-muted transition-all border-t mt-4 pt-4"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Globe className="h-5 w-5" />
              <span>{t.layout.backToWebsite}</span>
            </Link>
          </nav>
        </div>
      )}

      {/* Desktop Sidebar — Clean white */}
      <aside className="fixed start-0 top-16 hidden h-[calc(100vh-4rem)] w-64 border-e border-border bg-white dark:bg-card lg:block">
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
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <link.icon className={cn('h-5 w-5', isActive && 'text-white')} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Quick Actions */}
          <div className="border-t pt-4 space-y-2">
            <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.layout.quickActions}</p>
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', action.color)}>
                  <action.icon className="h-4 w-4 text-white" />
                </div>
                {action.label}
              </Link>
            ))}
          </div>

          {/* Personalization Banner */}
          <Link href="/tests" className="mt-4 block rounded-2xl border border-primary/20 bg-primary/5 p-4 hover:border-primary/40 transition-all">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">{t.layout.personalize}</p>
                <p className="text-xs text-muted-foreground">{t.layout.personalizeDesc}</p>
              </div>
            </div>
          </Link>

          {/* Achievements Preview */}
          <div className="mt-4 rounded-2xl bg-muted/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{t.layout.achievements}</span>
              <Link href="/achievements" className="text-xs text-primary hover:underline">{t.common.seeAll}</Link>
            </div>
            <div className="flex gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-lg">{'\uD83C\uDFC6'}</div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-lg">{'\uD83D\uDCAA'}</div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-lg">{'\uD83C\uDFAF'}</div>
            </div>
          </div>

          {/* Upgrade CTA for Free Users */}
          {tier === 'FREE' && (
            <Link
              href="/checkout?plan=PREMIUM"
              className="mt-4 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium bg-primary/10 text-primary hover:bg-primary/15 transition-all duration-200 border border-primary/20"
            >
              <Zap className="h-5 w-5" />
              {isRTL ? '\u062A\u0631\u0642\u064A\u0629 \u0644\u0628\u0631\u064A\u0645\u064A\u0648\u0645' : 'Upgrade to Premium'}
            </Link>
          )}

          {/* Back to Website */}
          <Link
            href="/"
            className="mt-4 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
          >
            <Globe className="h-5 w-5" />
            {t.layout.backToWebsite}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pb-24 lg:pb-6 lg:ps-64">
        <div className="container py-6 max-w-5xl">
          {children}
        </div>
      </main>

      {/* Floating Action Button (Mobile) */}
      <div className={cn("fixed bottom-24 z-50 lg:hidden", isRTL ? "left-4" : "right-4")}>
        {fabOpen && (
          <div className={cn("absolute bottom-16 flex flex-col gap-3 animate-fade-up", isRTL ? "left-0" : "right-0")}>
            {quickActions.map((action, index) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 animate-scale-in"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => setFabOpen(false)}
              >
                <span className="rounded-full bg-white px-3 py-2 text-sm font-medium shadow-card-hover dark:bg-card">
                  {action.label}
                </span>
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-full shadow-card-hover', action.color)}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* FAB Button — Solid teal */}
        <button
          onClick={() => setFabOpen(!fabOpen)}
          className={cn('fab', fabOpen && 'rotate-45')}
        >
          <Zap className="h-6 w-6 text-white" />
        </button>
      </div>

      {/* Bottom Navigation (Mobile) — Clean white */}
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
