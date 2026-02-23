'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Dumbbell,
  Utensils,
  BarChart3,
  MessageSquare,
  User,
  Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import { FormaSpinner } from '@/components/ui/skeleton';
import { Logo } from '@/components/ui/logo';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const { t, isRTL } = useLanguage();

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
    { href: '/chat', icon: MessageSquare, label: t.layout.coach },
    { href: '/nutrition', icon: Utensils, label: t.layout.nutrition },
    { href: '/profile', icon: User, label: t.layout.profile },
  ];

  return (
    <div className={cn('min-h-screen bg-background', isRTL && 'font-cairo')}>
      {/* Desktop Sidebar — hidden on mobile, visible on lg+ */}
      <aside className="sidebar-desktop hidden lg:flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-border/50">
          <Logo size="md" />
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {[...navLinks, { href: '/progress', icon: BarChart3, label: t.layout.progress }, { href: '/health', icon: Heart, label: t.layout.health }].map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <link.icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom of sidebar */}
        <div className="px-4 py-4 border-t border-border/50">
          <p className="text-[10px] text-muted-foreground text-center">Forma Fitness v1.0</p>
        </div>
      </aside>

      {/* Main Content — offset on desktop for sidebar */}
      <main className="pb-20 lg:pb-6 lg:ps-64">
        <div className="mx-auto max-w-lg md:max-w-3xl lg:max-w-none px-4 py-4 lg:px-8">
          {children}
        </div>
      </main>

      {/* Bottom Navigation — mobile only, hidden on desktop */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/95 backdrop-blur-sm safe-bottom lg:hidden">
        <div className="mx-auto flex max-w-lg md:max-w-3xl items-center justify-around px-2 py-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-2xl px-4 py-2 transition-colors duration-200',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                <div className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                  isActive && 'bg-primary/15'
                )}>
                  <link.icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />
                </div>
                <span className={cn('text-[10px]', isActive ? 'font-semibold' : 'font-medium')}>
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
