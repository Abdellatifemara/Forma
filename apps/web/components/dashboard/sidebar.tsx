'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Share2,
  LogOut,
  Globe,
  FlaskConical,
  ClipboardCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/use-user';
import { removeAuthCookie } from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SidebarProps {
  type: 'trainer' | 'admin';
}

const trainerLinks = [
  { href: '/trainer/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/trainer/clients', icon: Users, label: 'Clients' },
  { href: '/trainer/schedule', icon: Calendar, label: 'Schedule' },
  { href: '/trainer/check-ins', icon: ClipboardCheck, label: 'Check-Ins' },
  { href: '/trainer/invites', icon: Share2, label: 'Invites' },
  { href: '/trainer/programs', icon: Dumbbell, label: 'Programs' },
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
  { href: '/admin/research', icon: FlaskConical, label: 'Research' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar({ type }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: userData } = useUser();
  const user = userData?.user;

  const links = type === 'trainer' ? trainerLinks : adminLinks;

  const userName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.displayName || 'User';

  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    removeAuthCookie();
    router.push('/login');
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border/50 bg-card/50 backdrop-blur-xl">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-border/50 px-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
              <Dumbbell className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold">Forma</span>
          </Link>
          <span className="ml-2 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium capitalize">
            {type}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-glow'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <link.icon className={cn('h-5 w-5', isActive && 'text-white')} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Links */}
        <div className="border-t border-border/50 p-4 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Globe className="h-5 w-5" />
            Back to Website
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>

        {/* User section */}
        <div className="border-t border-border/50 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-3 py-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.avatarUrl || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-500 text-white font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium">{userName}</p>
              <p className="truncate text-xs text-muted-foreground capitalize">
                {type}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
