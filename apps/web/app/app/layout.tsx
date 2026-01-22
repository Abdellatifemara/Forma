'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const navLinks = [
  { href: '/app/dashboard', icon: Home, label: 'Home' },
  { href: '/app/workouts', icon: Dumbbell, label: 'Workouts' },
  { href: '/app/nutrition', icon: Utensils, label: 'Nutrition' },
  { href: '/app/progress', icon: TrendingUp, label: 'Progress' },
  { href: '/app/profile', icon: User, label: 'Profile' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link href="/app/dashboard" className="flex items-center space-x-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-forma-teal to-forma-teal-light" />
              <span className="font-bold">Forma</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/app/chat">
                <MessageCircle className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-forma-teal" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-forma-teal text-white">U</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-14 z-40 bg-background lg:hidden">
          <nav className="container py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-forma-teal/10 text-forma-teal'
                    : 'text-muted-foreground hover:bg-muted'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="container py-6">{children}</main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
        <div className="flex items-center justify-around py-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium transition-colors',
                pathname === link.href
                  ? 'text-forma-teal'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-14 hidden h-[calc(100vh-3.5rem)] w-64 border-r bg-background lg:block">
        <nav className="space-y-1 p-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'bg-forma-teal/10 text-forma-teal'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
    </div>
  );
}
