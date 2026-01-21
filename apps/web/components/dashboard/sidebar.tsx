'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Calendar,
  DollarSign,
  Home,
  MessageSquare,
  Settings,
  Users,
  Dumbbell,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  type: 'trainer' | 'admin';
}

const trainerLinks = [
  { href: '/trainer/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/trainer/clients', icon: Users, label: 'Clients' },
  { href: '/trainer/programs', icon: Dumbbell, label: 'Programs' },
  { href: '/trainer/schedule', icon: Calendar, label: 'Schedule' },
  { href: '/trainer/messages', icon: MessageSquare, label: 'Messages' },
  { href: '/trainer/earnings', icon: DollarSign, label: 'Earnings' },
  { href: '/trainer/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/trainer/settings', icon: Settings, label: 'Settings' },
];

const adminLinks = [
  { href: '/admin/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/trainers', icon: Dumbbell, label: 'Trainers' },
  { href: '/admin/content', icon: FileText, label: 'Content' },
  { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar({ type }: SidebarProps) {
  const pathname = usePathname();
  const links = type === 'trainer' ? trainerLinks : adminLinks;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-forma-teal to-forma-teal-light" />
            <span className="text-xl font-bold">Forma</span>
          </Link>
          <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize">
            {type}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-forma-teal/10 text-forma-teal'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t p-4">
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-forma-teal/20" />
            <div className="flex-1 truncate">
              <p className="text-sm font-medium">Ahmed Hassan</p>
              <p className="truncate text-xs text-muted-foreground">
                ahmed@example.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
