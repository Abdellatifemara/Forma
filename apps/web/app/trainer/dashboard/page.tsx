'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  MessageSquare,
  Star,
  Copy,
  Check,
  Zap,
  FileText,
  Share2,
  ArrowUpRight,
  Sparkles,
  Crown,
  Clock,
  Target,
  ChevronRight,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Mock data - will be replaced with real API calls
const trainerData = {
  name: 'Ahmed',
  tier: 'REGULAR' as 'REGULAR' | 'TRUSTED_PARTNER',
  commissionRate: 0.20,
  inviteCode: 'AHMED-FIT-2024',
  stats: {
    activeClients: 47,
    clientsThisMonth: 3,
    monthlyRevenue: 12450,
    revenueChange: 23,
    pendingPayout: 9960,
    totalEarnings: 45000,
    avgRating: 4.9,
    totalReviews: 127,
    avgCompliance: 78,
  },
};

const recentClients = [
  { name: 'Mohamed Ali', avatar: null, status: 'active', plan: 'Weight Loss', compliance: 92, lastActive: '2h ago' },
  { name: 'Sara Ahmed', avatar: null, status: 'active', plan: 'Muscle Building', compliance: 85, lastActive: '5h ago' },
  { name: 'Youssef Hassan', avatar: null, status: 'pending', plan: 'General Fitness', compliance: 0, lastActive: 'Pending' },
  { name: 'Nour Ibrahim', avatar: null, status: 'active', plan: 'Strength Training', compliance: 95, lastActive: '1d ago' },
];

const upcomingSessions = [
  { client: 'Mohamed Ali', time: '10:00 AM', type: 'Video Call', avatar: null },
  { client: 'Sara Ahmed', time: '2:00 PM', type: 'Check-in', avatar: null },
  { client: 'Youssef Hassan', time: '4:30 PM', type: 'Form Review', avatar: null },
];

const recentMessages = [
  { from: 'Mohamed Ali', message: 'Thanks for the new program!', time: '5m ago', unread: true },
  { from: 'Sara Ahmed', message: 'Can we reschedule tomorrow?', time: '1h ago', unread: true },
  { from: 'Nour Ibrahim', message: 'Great workout today!', time: '3h ago', unread: false },
];

export default function TrainerDashboardPage() {
  const [copied, setCopied] = useState(false);

  const copyInviteCode = () => {
    navigator.clipboard.writeText(`https://forma.app/join/${trainerData.inviteCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const platformFee = trainerData.stats.monthlyRevenue * trainerData.commissionRate;
  const netEarnings = trainerData.stats.monthlyRevenue - platformFee;

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Header with Tier Badge */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">
              Welcome back, <span className="text-gradient">{trainerData.name}</span>
            </h1>
            {trainerData.tier === 'TRUSTED_PARTNER' ? (
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                <Crown className="h-3 w-3 mr-1" />
                Trusted Partner
              </Badge>
            ) : (
              <Badge variant="outline" className="border-primary/50 text-primary">
                <Sparkles className="h-3 w-3 mr-1" />
                Trainer
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Here's how your coaching business is performing
          </p>
        </div>

        {/* Invite Code Card */}
        <div className="glass rounded-xl p-4 min-w-[280px]">
          <p className="text-xs text-muted-foreground mb-2">Your Invite Link</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm font-mono text-primary truncate">
              forma.app/join/{trainerData.inviteCode}
            </code>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-primary/20"
              onClick={copyInviteCode}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Active Clients */}
        <div className="stat-card group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl bg-cyan-500/20">
              <Users className="h-5 w-5 text-cyan-400" />
            </div>
            <Badge variant="outline" className="text-green-400 border-green-400/50 text-xs">
              +{trainerData.stats.clientsThisMonth} this month
            </Badge>
          </div>
          <p className="text-3xl font-bold">{trainerData.stats.activeClients}</p>
          <p className="text-sm text-muted-foreground mt-1">Active Clients</p>
        </div>

        {/* Monthly Revenue */}
        <div className="stat-card group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl bg-green-500/20">
              <DollarSign className="h-5 w-5 text-green-400" />
            </div>
            <Badge variant="outline" className="text-green-400 border-green-400/50 text-xs">
              +{trainerData.stats.revenueChange}%
            </Badge>
          </div>
          <p className="text-3xl font-bold">{trainerData.stats.monthlyRevenue.toLocaleString()} <span className="text-lg text-muted-foreground">EGP</span></p>
          <p className="text-sm text-muted-foreground mt-1">Monthly Revenue</p>
        </div>

        {/* Pending Payout */}
        <div className="stat-card group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl bg-purple-500/20">
              <Zap className="h-5 w-5 text-purple-400" />
            </div>
            <span className="text-xs text-muted-foreground">
              {Math.round((1 - trainerData.commissionRate) * 100)}% yours
            </span>
          </div>
          <p className="text-3xl font-bold">{trainerData.stats.pendingPayout.toLocaleString()} <span className="text-lg text-muted-foreground">EGP</span></p>
          <p className="text-sm text-muted-foreground mt-1">Pending Payout</p>
        </div>

        {/* Average Rating */}
        <div className="stat-card group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl bg-yellow-500/20">
              <Star className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className="h-3 w-3 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
          </div>
          <p className="text-3xl font-bold">{trainerData.stats.avgRating}</p>
          <p className="text-sm text-muted-foreground mt-1">{trainerData.stats.totalReviews} reviews</p>
        </div>
      </div>

      {/* Earnings Breakdown Card */}
      <Card className="glass border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            This Month's Earnings Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Gross Revenue</p>
              <p className="text-2xl font-bold">{trainerData.stats.monthlyRevenue.toLocaleString()} EGP</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Platform Fee ({trainerData.commissionRate * 100}%)</p>
              <p className="text-2xl font-bold text-orange-400">-{platformFee.toLocaleString()} EGP</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Your Earnings</p>
              <p className="text-2xl font-bold text-green-400">{netEarnings.toLocaleString()} EGP</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Next payout: <span className="text-foreground font-medium">Feb 15, 2024</span>
            </div>
            <Button variant="outline" size="sm" className="border-primary/50 hover:bg-primary/10">
              View Transactions
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Clients with Compliance */}
        <Card className="lg:col-span-2 glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your Clients</CardTitle>
              <CardDescription>Client activity and compliance rates</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/trainer/clients">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentClients.map((client) => (
                <div
                  key={client.name}
                  className="flex items-center justify-between rounded-xl bg-card/50 border border-border/50 p-4 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="border-2 border-primary/30">
                      <AvatarImage src={client.avatar || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {client.name.split(' ').map((n) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-muted-foreground">{client.plan}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {client.status === 'active' && (
                      <div className="hidden sm:block w-32">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Compliance</span>
                          <span className={cn(
                            'font-medium',
                            client.compliance >= 80 ? 'text-green-400' : client.compliance >= 50 ? 'text-yellow-400' : 'text-red-400'
                          )}>
                            {client.compliance}%
                          </span>
                        </div>
                        <Progress value={client.compliance} className="h-1.5" />
                      </div>
                    )}
                    <Badge
                      variant={client.status === 'active' ? 'default' : 'secondary'}
                      className={cn(
                        client.status === 'active' && 'bg-green-500/20 text-green-400 border-green-500/50'
                      )}
                    >
                      {client.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start h-12 btn-primary" asChild>
              <Link href="/trainer/clients/invite">
                <Share2 className="mr-3 h-5 w-5" />
                Share Invite Link
              </Link>
            </Button>
            <Button className="w-full justify-start h-12" variant="outline" asChild>
              <Link href="/trainer/programs/upload">
                <FileText className="mr-3 h-5 w-5" />
                Upload Program PDF
              </Link>
            </Button>
            <Button className="w-full justify-start h-12" variant="outline" asChild>
              <Link href="/trainer/programs/new">
                <Target className="mr-3 h-5 w-5" />
                Create New Program
              </Link>
            </Button>
            <Button className="w-full justify-start h-12" variant="outline" asChild>
              <Link href="/trainer/messages">
                <MessageSquare className="mr-3 h-5 w-5" />
                Message Clients
                <Badge className="ml-auto bg-primary text-primary-foreground">3</Badge>
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Today's Sessions */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Today's Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingSessions.map((session, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-xl bg-card/50 border border-border/50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-primary/30">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {session.client.split(' ').map((n) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{session.client}</p>
                      <p className="text-xs text-muted-foreground">{session.type}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-primary/50 text-primary">
                    {session.time}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card className="lg:col-span-2 glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Recent Messages
              </CardTitle>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/trainer/messages">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentMessages.map((msg, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-start gap-4 rounded-xl border p-4 transition-colors",
                    msg.unread
                      ? "bg-primary/5 border-primary/30"
                      : "bg-card/50 border-border/50"
                  )}
                >
                  <Avatar className="h-10 w-10 border border-primary/30">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {msg.from.split(' ').map((n) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{msg.from}</p>
                      <span className="text-xs text-muted-foreground flex-shrink-0">{msg.time}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground truncate">
                      {msg.message}
                    </p>
                  </div>
                  {msg.unread && (
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0 mt-2" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Average Client Compliance */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Client Compliance Overview
          </CardTitle>
          <CardDescription>
            How well your clients are following their programs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="12"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="url(#compliance-gradient)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${trainerData.stats.avgCompliance * 3.52} 352`}
                />
                <defs>
                  <linearGradient id="compliance-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--secondary))" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold">{trainerData.stats.avgCompliance}%</span>
              </div>
            </div>
            <div className="flex-1 grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">High Performers</p>
                <p className="text-2xl font-bold text-green-400">32</p>
                <p className="text-xs text-muted-foreground">80%+ compliance</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Need Attention</p>
                <p className="text-2xl font-bold text-yellow-400">11</p>
                <p className="text-xs text-muted-foreground">50-80% compliance</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">At Risk</p>
                <p className="text-2xl font-bold text-red-400">4</p>
                <p className="text-xs text-muted-foreground">&lt;50% compliance</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
