'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Activity,
  ArrowLeft,
  Calendar,
  ChevronRight,
  Dumbbell,
  Edit,
  LineChart,
  MessageSquare,
  MoreVertical,
  Target,
  TrendingDown,
  TrendingUp,
  Utensils,
  Weight,
  AlertCircle,
  Loader2,
  Crown,
  CheckCircle,
  XCircle,
  Clock,
  Flame,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useClientDetails } from '@/hooks/use-trainer';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [activeTab, setActiveTab] = useState('overview');
  const { client: clientData, isLoading, error } = useClientDetails(clientId);

  const getComplianceColor = (rate: number) => {
    if (rate >= 80) return 'text-green-400';
    if (rate >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getComplianceBadge = (rate: number) => {
    if (rate >= 80) return { label: 'High Performer', class: 'bg-green-500/20 text-green-400 border-green-500/50' };
    if (rate >= 50) return { label: 'Needs Attention', class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' };
    return { label: 'At Risk', class: 'bg-red-500/20 text-red-400 border-red-500/50' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getLastActiveText = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const diff = Date.now() - new Date(dateString).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !clientData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Failed to load client</h2>
        <p className="text-muted-foreground">{error?.message || 'Client not found'}</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/trainer/clients">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Clients
          </Link>
        </Button>
      </div>
    );
  }

  const client = clientData.client;
  const compliance = clientData.compliance;
  const stats = clientData.stats;

  const weightProgress = stats.startWeight && client.targetWeightKg && stats.currentWeight
    ? ((stats.startWeight - stats.currentWeight) / (stats.startWeight - client.targetWeightKg)) * 100
    : 0;

  const complianceBadge = getComplianceBadge(compliance.overall);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/trainer/clients">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-4 border-primary/30">
              <AvatarImage src={client.avatarUrl || undefined} />
              <AvatarFallback className="text-xl bg-gradient-to-br from-cyan-500 to-purple-500 text-white">
                {client.name.split(' ').map((n) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{client.name}</h1>
                <Badge className={clientData.isActive
                  ? 'bg-green-500/20 text-green-400 border-green-500/50'
                  : 'bg-red-500/20 text-red-400 border-red-500/50'
                }>
                  {clientData.isActive ? 'Active' : 'Inactive'}
                </Badge>
                {clientData.premiumGifted && (
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">{clientData.program?.nameEn || 'No program assigned'}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-border/50" asChild>
            <Link href={`/trainer/messages?client=${clientId}`}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Message
            </Link>
          </Button>
          <Button className="btn-primary" onClick={() => router.push(`/trainer/schedule?client=${clientId}`)}>
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Session
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/trainer/clients/${clientId}/edit`)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Client Info
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/trainer/programs?assign=${clientId}`)}>
                <Dumbbell className="mr-2 h-4 w-4" />
                Assign New Program
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/trainer/clients/${clientId}/meal-plan`)}>
                <Utensils className="mr-2 h-4 w-4" />
                Update Meal Plan
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                End Coaching
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Compliance Overview Card */}
      <Card className={cn(
        "glass",
        compliance.overall >= 80 ? "border-green-500/30" :
        compliance.overall >= 50 ? "border-yellow-500/30" :
        "border-red-500/30"
      )}>
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <svg className="w-24 h-24 -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted/30"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={`${compliance.overall * 2.51} 251`}
                    className={getComplianceColor(compliance.overall)}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={cn("text-2xl font-bold", getComplianceColor(compliance.overall))}>
                    {compliance.overall}%
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Compliance Score</h3>
                <Badge variant="outline" className={complianceBadge.class}>
                  {complianceBadge.label}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  Last active: {getLastActiveText(client.lastActiveAt)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 md:gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Dumbbell className="h-4 w-4 text-cyan-400" />
                </div>
                <p className="text-2xl font-bold">{stats.workoutsCompleted}</p>
                <p className="text-xs text-muted-foreground">Workouts</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Flame className="h-4 w-4 text-orange-400" />
                </div>
                <p className="text-2xl font-bold">{(stats.totalVolume / 1000).toFixed(0)}k</p>
                <p className="text-xs text-muted-foreground">Volume (kg)</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Target className="h-4 w-4 text-green-400" />
                </div>
                <p className="text-2xl font-bold">{compliance.workout}%</p>
                <p className="text-xs text-muted-foreground">Adherence</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Weight Progress</p>
                <p className="text-2xl font-bold">
                  {stats.weightProgress > 0 ? '+' : ''}
                  {stats.weightProgress.toFixed(1)} kg
                </p>
              </div>
              <div className={cn(
                "p-2 rounded-xl",
                stats.weightProgress < 0 ? 'bg-green-500/20' : 'bg-red-500/20'
              )}>
                {stats.weightProgress < 0 ? (
                  <TrendingDown className="h-5 w-5 text-green-400" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-red-400" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Workouts</p>
                <p className="text-2xl font-bold">
                  {stats.workoutsCompleted}
                </p>
              </div>
              <div className="p-2 rounded-xl bg-cyan-500/20">
                <Dumbbell className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Adherence</p>
                <p className={cn("text-2xl font-bold", getComplianceColor(compliance.workout))}>
                  {compliance.workout}%
                </p>
              </div>
              <div className="p-2 rounded-xl bg-purple-500/20">
                <Target className="h-5 w-5 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Calories</p>
                <p className="text-2xl font-bold">{stats.avgCalories}</p>
              </div>
              <div className="p-2 rounded-xl bg-orange-500/20">
                <Utensils className="h-5 w-5 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workouts">Workouts</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Client Info */}
            <Card className="glass border-border/50 lg:col-span-1">
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Email', value: client.email },
                  { label: 'Height', value: client.heightCm ? `${client.heightCm} cm` : 'Not set' },
                  { label: 'Goal', value: client.fitnessGoal || 'Not specified' },
                  { label: 'Start Date', value: formatDate(clientData.startDate) },
                  { label: 'Marketplace Access', value: clientData.canSeeMarketplace ? 'Yes' : 'No' },
                ].map((item, index) => (
                  <div key={index} className="flex justify-between py-2 border-b border-border/30 last:border-0">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium text-right">{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Goal Progress */}
            <Card className="glass border-border/50 lg:col-span-2">
              <CardHeader>
                <CardTitle>Goal Progress</CardTitle>
                <CardDescription>{client.fitnessGoal || 'No specific goal set'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-xl bg-muted/30">
                    <p className="text-sm text-muted-foreground">Starting</p>
                    <p className="text-2xl font-bold">{stats.startWeight || '-'} kg</p>
                  </div>
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <p className="text-sm text-muted-foreground">Current</p>
                    <p className="text-2xl font-bold text-primary">{stats.currentWeight || '-'} kg</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/30">
                    <p className="text-sm text-muted-foreground">Target</p>
                    <p className="text-2xl font-bold">{client.targetWeightKg || '-'} kg</p>
                  </div>
                </div>

                {weightProgress > 0 && (
                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{Math.min(100, Math.round(weightProgress))}%</span>
                    </div>
                    <Progress value={Math.min(100, weightProgress)} className="h-3" />
                  </div>
                )}

                {/* Program Info */}
                {clientData.program && (
                  <div className="p-4 rounded-xl border border-border/50 bg-muted/20">
                    <h4 className="font-semibold mb-2">Current Program</h4>
                    <p className="text-lg">{clientData.program.nameEn}</p>
                    {clientData.program.descriptionEn && (
                      <p className="text-sm text-muted-foreground mt-1">{clientData.program.descriptionEn}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-2">
                      Duration: {clientData.program.durationWeeks} weeks
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/20">
                <div className="p-2 rounded-lg bg-cyan-500/20">
                  <Dumbbell className="h-5 w-5 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Last Workout</p>
                  <p className="text-sm text-muted-foreground">
                    {clientData.recentActivity.lastWorkout
                      ? formatDate(clientData.recentActivity.lastWorkout)
                      : 'No workouts logged yet'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/20">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <Utensils className="h-5 w-5 text-orange-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Last Nutrition Log</p>
                  <p className="text-sm text-muted-foreground">
                    {clientData.recentActivity.lastNutritionLog
                      ? formatDate(clientData.recentActivity.lastNutritionLog)
                      : 'No nutrition logged yet'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workouts Tab */}
        <TabsContent value="workouts" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Workout Performance</h3>
            <Button className="btn-primary" onClick={() => router.push(`/trainer/programs?assign=${clientId}`)}>
              <Dumbbell className="mr-2 h-4 w-4" />
              Assign Program
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="glass border-border/50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-5xl font-bold text-cyan-400">{stats.workoutsCompleted}</p>
                  <p className="text-muted-foreground mt-2">Workouts Completed (30 days)</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border/50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-5xl font-bold text-purple-400">{(stats.totalVolume / 1000).toFixed(1)}k</p>
                  <p className="text-muted-foreground mt-2">Total Volume (kg)</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {clientData.recentActivity.lastWorkout ? (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/20">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Last Workout Completed</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(clientData.recentActivity.lastWorkout)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No workouts completed yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle>Compliance Breakdown</CardTitle>
                <CardDescription>How well is this client following their program</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Workout Completion</span>
                      <span className={cn(
                        'font-medium',
                        compliance.workout >= 80 ? 'text-green-400' :
                        compliance.workout >= 50 ? 'text-yellow-400' : 'text-red-400'
                      )}>{compliance.workout}%</span>
                    </div>
                    <Progress value={compliance.workout} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Nutrition Adherence</span>
                      <span className={cn(
                        'font-medium',
                        compliance.nutrition >= 80 ? 'text-green-400' :
                        compliance.nutrition >= 50 ? 'text-yellow-400' : 'text-red-400'
                      )}>{compliance.nutrition}%</span>
                    </div>
                    <Progress value={compliance.nutrition} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Overall Compliance</span>
                      <span className={cn(
                        'font-medium',
                        compliance.overall >= 80 ? 'text-green-400' :
                        compliance.overall >= 50 ? 'text-yellow-400' : 'text-red-400'
                      )}>{compliance.overall}%</span>
                    </div>
                    <Progress value={compliance.overall} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle>Weekly Trends</CardTitle>
                <CardDescription>Compliance over the last 4 weeks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-around h-48 gap-4">
                  {compliance.weeklyTrend.map((week, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-cyan-500 to-purple-500"
                        style={{ height: `${week.compliance}%` }}
                      />
                      <span className="text-xs text-muted-foreground">{week.week}</span>
                    </div>
                  ))}
                </div>
                {compliance.weeklyTrend.length >= 2 && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    {compliance.weeklyTrend[compliance.weeklyTrend.length - 1].compliance >
                     compliance.weeklyTrend[compliance.weeklyTrend.length - 2].compliance ? (
                      <div className="flex items-center gap-2 text-green-400">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm font-medium">Improving</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-yellow-400">
                        <TrendingDown className="h-4 w-4" />
                        <span className="text-sm font-medium">Needs attention</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card className="glass border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {compliance.nutrition < 50 && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-card/50">
                  <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="font-medium">Nutrition tracking is low</p>
                    <p className="text-sm text-muted-foreground">
                      Consider sending a reminder about meal logging. Nutrition adherence is at {compliance.nutrition}%.
                    </p>
                  </div>
                </div>
              )}
              {compliance.workout >= 80 && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-card/50">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="font-medium">Great workout consistency</p>
                    <p className="text-sm text-muted-foreground">
                      Client has {compliance.workout}% workout completion. Consider celebrating this achievement!
                    </p>
                  </div>
                </div>
              )}
              {compliance.overall < 50 && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-card/50">
                  <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                  <div>
                    <p className="font-medium">Client needs immediate attention</p>
                    <p className="text-sm text-muted-foreground">
                      Overall compliance is at {compliance.overall}%. Schedule a check-in call to understand their challenges.
                    </p>
                  </div>
                </div>
              )}
              {compliance.overall >= 50 && compliance.nutrition >= 50 && compliance.workout < 80 && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-card/50">
                  <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="font-medium">Workout consistency can improve</p>
                    <p className="text-sm text-muted-foreground">
                      Consider adjusting workout schedule or difficulty to improve adherence.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Progress Tracking</h3>
            <Button variant="outline" className="border-border/50">
              <LineChart className="mr-2 h-4 w-4" />
              View Full Report
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Weight className="h-5 w-5" />
                  Weight Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-muted/30 text-center">
                    <p className="text-sm text-muted-foreground">Start Weight</p>
                    <p className="text-2xl font-bold">{stats.startWeight || '-'} kg</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/30 text-center">
                    <p className="text-sm text-muted-foreground">Current Weight</p>
                    <p className="text-2xl font-bold">{stats.currentWeight || '-'} kg</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 text-center">
                  <p className="text-sm text-muted-foreground">Total Change</p>
                  <p className={cn(
                    "text-3xl font-bold",
                    stats.weightProgress < 0 ? 'text-green-400' : 'text-red-400'
                  )}>
                    {stats.weightProgress > 0 ? '+' : ''}{stats.weightProgress.toFixed(1)} kg
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Workout Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-5xl font-bold text-cyan-400">{(stats.totalVolume / 1000).toFixed(1)}k</p>
                  <p className="text-muted-foreground mt-2">Total Volume (kg) - Last 30 Days</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-4 rounded-xl bg-muted/30 text-center">
                    <p className="text-sm text-muted-foreground">Workouts</p>
                    <p className="text-xl font-bold">{stats.workoutsCompleted}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/30 text-center">
                    <p className="text-sm text-muted-foreground">Avg Per Workout</p>
                    <p className="text-xl font-bold">
                      {stats.workoutsCompleted > 0
                        ? Math.round(stats.totalVolume / stats.workoutsCompleted).toLocaleString()
                        : '-'} kg
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
