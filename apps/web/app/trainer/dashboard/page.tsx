'use client';

import { useState, useEffect } from 'react';
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
  Loader2,
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
import { trainersApi, chatApi, type TrainerProfile, type TrainerStats, type TrainerClientResponse } from '@/lib/api';

export default function TrainerDashboardPage() {
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<TrainerProfile | null>(null);
  const [stats, setStats] = useState<TrainerStats | null>(null);
  const [clients, setClients] = useState<TrainerClientResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [profileRes, statsRes, clientsRes, unreadRes] = await Promise.all([
          trainersApi.getMyProfile(),
          trainersApi.getDashboardStats(),
          trainersApi.getClients(),
          chatApi.getUnreadCount().catch(() => ({ unreadCount: 0 })),
        ]);
        setProfile(profileRes);
        setStats(statsRes);
        setClients(clientsRes.slice(0, 4)); // Show only first 4 clients
        setUnreadCount(unreadRes.unreadCount || 0);
      } catch (err: any) {
        // Error handled
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profile || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-red-500">{error || 'Failed to load dashboard'}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  // Calculate derived values
  const commissionRate = profile.tier === 'TRUSTED_PARTNER' ? 0.15 : 0.20;
  const platformFee = (stats.monthlyRevenue || 0) * commissionRate;
  const netEarnings = (stats.monthlyRevenue || 0) - platformFee;

  const copyInviteCode = () => {
    const inviteCode = profile?.inviteCode || 'TRAINER';
    navigator.clipboard.writeText(`https://forma.app/join/${inviteCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Header with Tier Badge */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">
              Welcome back, <span className="text-gradient">{(profile as any).user?.firstName || 'Trainer'}</span>
            </h1>
            {profile.tier === 'TRUSTED_PARTNER' ? (
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
              forma.app/join/{profile.inviteCode || 'TRAINER'}
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
              +{stats.newClientsThisMonth || 0} this month
            </Badge>
          </div>
          <p className="text-3xl font-bold">{stats.activeClients || 0}</p>
          <p className="text-sm text-muted-foreground mt-1">Active Clients</p>
        </div>

        {/* Monthly Revenue */}
        <div className="stat-card group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl bg-green-500/20">
              <DollarSign className="h-5 w-5 text-green-400" />
            </div>
            <Badge variant="outline" className="text-green-400 border-green-400/50 text-xs">
              Revenue
            </Badge>
          </div>
          <p className="text-3xl font-bold">{(stats.monthlyRevenue || 0).toLocaleString()} <span className="text-lg text-muted-foreground">EGP</span></p>
          <p className="text-sm text-muted-foreground mt-1">Monthly Revenue</p>
        </div>

        {/* Pending Payout */}
        <div className="stat-card group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl bg-purple-500/20">
              <Zap className="h-5 w-5 text-purple-400" />
            </div>
            <span className="text-xs text-muted-foreground">
              {Math.round((1 - commissionRate) * 100)}% yours
            </span>
          </div>
          <p className="text-3xl font-bold">{netEarnings.toLocaleString()} <span className="text-lg text-muted-foreground">EGP</span></p>
          <p className="text-sm text-muted-foreground mt-1">Your Earnings</p>
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
                  className={cn(
                    "h-3 w-3",
                    i <= Math.round(stats.averageRating || 0) ? "fill-yellow-400 text-yellow-400" : "text-muted"
                  )}
                />
              ))}
            </div>
          </div>
          <p className="text-3xl font-bold">{(stats.averageRating || 0).toFixed(1)}</p>
          <p className="text-sm text-muted-foreground mt-1">{stats.totalReviews || 0} reviews</p>
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
              <p className="text-2xl font-bold">{(stats.monthlyRevenue || 0).toLocaleString()} EGP</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Platform Fee ({commissionRate * 100}%)</p>
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
              Next payout: <span className="text-foreground font-medium">15th of next month</span>
            </div>
            <Button variant="outline" size="sm" className="border-primary/50 hover:bg-primary/10" asChild>
              <Link href="/trainer/earnings">
                View Transactions
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Link>
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
              {clients.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No clients yet. Share your invite link to get started!
                </p>
              ) : clients.map((item) => {
                const clientName = `${item.client?.firstName || ''} ${item.client?.lastName || ''}`.trim() || 'Unknown';
                const initials = clientName.split(' ').map((n) => n[0]).join('').toUpperCase() || 'U';
                const compliance = item.complianceRate || 0;

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl bg-card/50 border border-border/50 p-4 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="border-2 border-primary/30">
                        <AvatarImage src={item.client?.avatarUrl || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{clientName}</p>
                        <p className="text-sm text-muted-foreground">{item.client?.fitnessGoal?.replace('_', ' ') || 'General Fitness'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:block w-32">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Compliance</span>
                          <span className={cn(
                            'font-medium',
                            compliance >= 80 ? 'text-green-400' : compliance >= 50 ? 'text-yellow-400' : 'text-red-400'
                          )}>
                            {compliance}%
                          </span>
                        </div>
                        <Progress value={compliance} className="h-1.5" />
                      </div>
                      <Badge
                        variant="default"
                        className="bg-green-500/20 text-green-400 border-green-500/50"
                      >
                        active
                      </Badge>
                    </div>
                  </div>
                );
              })}
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
                {unreadCount > 0 && (
                  <Badge className="ml-auto bg-primary text-primary-foreground">{unreadCount}</Badge>
                )}
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Today's Sessions - Placeholder */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Today's Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Session scheduling coming soon</p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card className="lg:col-span-2 glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Messages
              </CardTitle>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/trainer/messages">
                Open Chat
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Chat with your clients</p>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link href="/trainer/messages">Go to Messages</Link>
              </Button>
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
                  strokeDasharray={`${(stats.avgCompliance || 0) * 3.52} 352`}
                />
                <defs>
                  <linearGradient id="compliance-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--secondary))" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold">{stats.avgCompliance || 0}%</span>
              </div>
            </div>
            <div className="flex-1 grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold text-primary">{stats.activeClients || 0}</p>
                <p className="text-xs text-muted-foreground">Active subscriptions</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">New This Month</p>
                <p className="text-2xl font-bold text-green-400">{stats.newClientsThisMonth || 0}</p>
                <p className="text-xs text-muted-foreground">Recently joined</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold text-purple-400">{(stats.totalEarnings || 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">EGP lifetime</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
