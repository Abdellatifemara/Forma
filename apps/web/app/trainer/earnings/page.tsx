'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Zap,
  CreditCard,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trainersApi, type TrainerEarningsBreakdown, type TrainerTransaction } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function EarningsPage() {
  const { toast } = useToast();
  const [earnings, setEarnings] = useState<TrainerEarningsBreakdown | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Month selection
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const fetchEarnings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await trainersApi.getEarnings({ month: selectedMonth, year: selectedYear });
      setEarnings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load earnings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, [selectedMonth, selectedYear]);

  const goToPreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    const canGoNext = selectedYear < now.getFullYear() ||
      (selectedYear === now.getFullYear() && selectedMonth < now.getMonth());

    if (canGoNext) {
      if (selectedMonth === 11) {
        setSelectedMonth(0);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };

  const isCurrentMonth = selectedMonth === now.getMonth() && selectedYear === now.getFullYear();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'PAID_OUT':
        return { label: status === 'PAID_OUT' ? 'Paid' : 'Completed', class: 'bg-green-500/20 text-green-400 border-green-500/50' };
      case 'PENDING':
        return { label: 'Pending', class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' };
      case 'FAILED':
        return { label: 'Failed', class: 'bg-red-500/20 text-red-400 border-red-500/50' };
      case 'REFUNDED':
        return { label: 'Refunded', class: 'bg-orange-500/20 text-orange-400 border-orange-500/50' };
      default:
        return { label: status, class: 'bg-muted' };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SUBSCRIPTION':
        return <Users className="h-4 w-4" />;
      case 'PROGRAM_PURCHASE':
        return <Zap className="h-4 w-4" />;
      case 'TIP':
        return <DollarSign className="h-4 w-4" />;
      case 'PAYOUT':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !earnings) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Failed to load earnings</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchEarnings}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Earnings</h1>
          <p className="text-muted-foreground">Track your revenue and payouts</p>
        </div>
        <Button
          variant="outline"
          className="border-primary/50 hover:bg-primary/10"
          onClick={() => toast({ title: 'Coming Soon', description: 'Export feature will be available soon' })}
        >
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Month Selector */}
      <Card className="glass border-border/50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="text-center">
              <p className="text-lg font-semibold">{MONTHS[selectedMonth]} {selectedYear}</p>
              {isCurrentMonth && (
                <p className="text-sm text-muted-foreground">Current month</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextMonth}
              disabled={isCurrentMonth}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Earnings Breakdown */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Gross Revenue */}
        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-cyan-500/20">
                <DollarSign className="h-5 w-5 text-cyan-400" />
              </div>
              <span className="text-sm text-muted-foreground">Gross Revenue</span>
            </div>
            <p className="text-3xl font-bold">
              {earnings.grossRevenue.toLocaleString()} <span className="text-lg text-muted-foreground">EGP</span>
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subscriptions</span>
                <span>{earnings.breakdown.subscriptions.toLocaleString()} EGP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Programs</span>
                <span>{earnings.breakdown.programs.toLocaleString()} EGP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tips</span>
                <span>{earnings.breakdown.tips.toLocaleString()} EGP</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Fee */}
        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-orange-500/20">
                <TrendingUp className="h-5 w-5 text-orange-400" />
              </div>
              <span className="text-sm text-muted-foreground">Platform Fee ({earnings.platformFeePercentage}%)</span>
            </div>
            <p className="text-3xl font-bold text-orange-400">
              -{earnings.platformFee.toLocaleString()} <span className="text-lg">EGP</span>
            </p>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                This fee helps us maintain the platform, provide support, and process payments securely.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Net Earnings */}
        <Card className="glass border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-green-500/20">
                <DollarSign className="h-5 w-5 text-green-400" />
              </div>
              <span className="text-sm text-muted-foreground">Your Earnings</span>
            </div>
            <p className="text-3xl font-bold text-green-400">
              {earnings.netEarnings.toLocaleString()} <span className="text-lg">EGP</span>
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                {100 - earnings.platformFeePercentage}% of revenue
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payout Info */}
      <Card className="glass border-border/50">
        <CardContent className="py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/20">
                <Clock className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="font-semibold">Pending Payout</p>
                <p className="text-sm text-muted-foreground">
                  Next payout on {new Date(earnings.nextPayoutDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gradient">{earnings.pendingPayout.toLocaleString()} EGP</p>
              <p className="text-sm text-muted-foreground">Total pending amount</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your transaction history for {MONTHS[selectedMonth]}</CardDescription>
        </CardHeader>
        <CardContent>
          {earnings.transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No transactions this month</p>
            </div>
          ) : (
            <div className="space-y-3">
              {earnings.transactions.map((tx) => {
                const statusBadge = getStatusBadge(tx.status);
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-card/50 border border-border/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-2 rounded-xl",
                        tx.type === 'PAYOUT' ? 'bg-purple-500/20' : 'bg-primary/20'
                      )}>
                        {getTypeIcon(tx.type)}
                      </div>
                      <div>
                        <p className="font-medium">
                          {tx.type === 'SUBSCRIPTION' ? 'Subscription Payment' :
                           tx.type === 'PROGRAM_PURCHASE' ? 'Program Purchase' :
                           tx.type === 'TIP' ? 'Tip Received' :
                           tx.type === 'PAYOUT' ? 'Payout to Bank' :
                           tx.type}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {tx.description || formatDate(tx.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className={statusBadge.class}>
                        {statusBadge.label}
                      </Badge>
                      <div className="text-right min-w-[100px]">
                        <p className={cn(
                          "font-bold",
                          tx.type === 'PAYOUT' || tx.status === 'REFUNDED' ? 'text-orange-400' : 'text-green-400'
                        )}>
                          {tx.type === 'PAYOUT' || tx.status === 'REFUNDED' ? '-' : '+'}
                          {tx.amountEGP.toLocaleString()} EGP
                        </p>
                        {tx.trainerEarningEGP !== tx.amountEGP && tx.type !== 'PAYOUT' && (
                          <p className="text-xs text-muted-foreground">
                            You earn: {tx.trainerEarningEGP.toLocaleString()} EGP
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
