'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Dumbbell,
  Utensils,
  BarChart3,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import { FormaSpinner } from '@/components/ui/skeleton';

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
    { href: '/progress', icon: BarChart3, label: t.layout.progress },
    { href: '/workouts', icon: Dumbbell, label: t.layout.workouts },
    { href: '/nutrition', icon: Utensils, label: t.layout.nutrition },
    { href: '/profile', icon: User, label: t.layout.profile },
  ];

  return (
    <div className={cn('min-h-screen bg-background', isRTL && 'font-cairo')}>
      {/* Main Content — no top header, Flexcore style */}
      <main className="pb-20">
        <div className="mx-auto max-w-lg px-4 py-4">
          {children}
        </div>
      </main>

      {/* Bottom Navigation — Flexcore style */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/95 backdrop-blur-sm safe-bottom">
        <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
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
