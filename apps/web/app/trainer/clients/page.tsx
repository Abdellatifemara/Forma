'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Users,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Eye,
  UserX,
  Crown,
  Sparkles,
  AlertCircle,
  Loader2,
  Share2,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { trainersApi, type TrainerClientResponse } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n';

type FilterStatus = 'all' | 'high' | 'attention' | 'risk';

export default function ClientsPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [clients, setClients] = useState<TrainerClientResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await trainersApi.getClients();
      setClients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.trainer.failedToLoadClients);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = clients.filter((client) => {
    const name = `${client.client.firstName} ${client.client.lastName}`.toLowerCase();
    const matchesSearch = name.includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    switch (filterStatus) {
      case 'high':
        return client.complianceRate >= 80;
      case 'attention':
        return client.complianceRate >= 50 && client.complianceRate < 80;
      case 'risk':
        return client.complianceRate < 50;
      default:
        return true;
    }
  });

  const stats = {
    total: clients.length,
    highPerformers: clients.filter(c => c.complianceRate >= 80).length,
    needAttention: clients.filter(c => c.complianceRate >= 50 && c.complianceRate < 80).length,
    atRisk: clients.filter(c => c.complianceRate < 50).length,
    avgCompliance: clients.length > 0
      ? Math.round(clients.reduce((sum, c) => sum + c.complianceRate, 0) / clients.length)
      : 0,
  };

  const getComplianceColor = (rate: number) => {
    if (rate >= 80) return 'text-green-400';
    if (rate >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getComplianceBadge = (rate: number) => {
    if (rate >= 80) return { label: t.trainer.complianceHigh, class: 'bg-green-500/20 text-green-400 border-green-500/50' };
    if (rate >= 50) return { label: t.trainer.complianceMedium, class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' };
    return { label: t.trainer.complianceLow, class: 'bg-red-500/20 text-red-400 border-red-500/50' };
  };

  const getLastActiveText = (date: string | null) => {
    if (!date) return 'Never';
    const diff = Date.now() - new Date(date).getTime();
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">{t.trainer.failedToLoadClients}</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchClients}>{t.common.retry}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t.trainer.yourClients}</h1>
          <p className="text-muted-foreground">
            {t.trainer.manageClientsDesc}
          </p>
        </div>
        <Button className="btn-primary" asChild>
          <Link href="/trainer/invites">
            <Share2 className="me-2 h-4 w-4" />
            {t.trainer.inviteClients}
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass border-border/50 cursor-pointer transition-all hover:border-primary/30" onClick={() => setFilterStatus('all')}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/20">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">{t.trainer.totalClients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "glass border-border/50 cursor-pointer transition-all",
            filterStatus === 'high' ? 'border-green-500/50 bg-green-500/5' : 'hover:border-green-500/30'
          )}
          onClick={() => setFilterStatus(filterStatus === 'high' ? 'all' : 'high')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-green-500/20">
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">{stats.highPerformers}</p>
                <p className="text-sm text-muted-foreground">{t.trainer.highPerformers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "glass border-border/50 cursor-pointer transition-all",
            filterStatus === 'attention' ? 'border-yellow-500/50 bg-yellow-500/5' : 'hover:border-yellow-500/30'
          )}
          onClick={() => setFilterStatus(filterStatus === 'attention' ? 'all' : 'attention')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-yellow-500/20">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-400">{stats.needAttention}</p>
                <p className="text-sm text-muted-foreground">{t.trainer.needAttention}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "glass border-border/50 cursor-pointer transition-all",
            filterStatus === 'risk' ? 'border-red-500/50 bg-red-500/5' : 'hover:border-red-500/30'
          )}
          onClick={() => setFilterStatus(filterStatus === 'risk' ? 'all' : 'risk')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-500/20">
                <TrendingDown className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-400">{stats.atRisk}</p>
                <p className="text-sm text-muted-foreground">{t.trainer.atRisk}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="glass border-border/50">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t.trainer.searchClientsPlaceholder}
                className="ps-10 bg-muted/50 border-border/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-border/50">
                  <Filter className="me-2 h-4 w-4" />
                  {filterStatus === 'all' ? t.trainer.allClients :
                   filterStatus === 'high' ? t.trainer.highPerformers :
                   filterStatus === 'attention' ? t.trainer.needAttention : t.trainer.atRisk}
                  <ChevronDown className="ms-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                  {t.trainer.allClients}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('high')}>
                  <span className="h-2 w-2 rounded-full bg-green-500 me-2" />
                  {t.trainer.highPerformers80}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('attention')}>
                  <span className="h-2 w-2 rounded-full bg-yellow-500 me-2" />
                  {t.trainer.needAttention5080}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('risk')}>
                  <span className="h-2 w-2 rounded-full bg-red-500 me-2" />
                  {t.trainer.atRisk50}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Clients List */}
      {filteredClients.length === 0 ? (
        <Card className="glass border-border/50">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">{t.trainer.noClientsFound}</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterStatus !== 'all'
                ? t.trainer.adjustSearchFilters
                : t.trainer.startInviting}
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <Button asChild>
                <Link href="/trainer/invites">
                  <Share2 className="me-2 h-4 w-4" />
                  {t.trainer.createInviteLink}
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredClients.map((client) => {
            const complianceBadge = getComplianceBadge(client.complianceRate);
            return (
              <Card key={client.id} className="glass border-border/50 hover:border-primary/30 transition-all">
                <CardContent className="py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Client Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <Avatar className="h-12 w-12 border-2 border-primary/30">
                        <AvatarImage src={client.client.avatarUrl || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {client.client.firstName?.charAt(0)}{client.client.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">
                            {client.client.firstName} {client.client.lastName}
                          </p>
                          {client.premiumGifted && (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                              <Crown className="h-3 w-3 me-1" />
                              {t.trainer.premiumBadge}
                            </Badge>
                          )}
                          {!client.canSeeMarketplace && (
                            <Badge variant="outline" className="text-xs">
                              {t.trainer.exclusive}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {client.currentProgram?.name || t.trainer.noProgramAssigned}
                        </p>
                      </div>
                    </div>

                    {/* Compliance */}
                    <div className="flex items-center gap-6">
                      <div className="w-32">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">{t.trainer.compliance}</span>
                          <span className={cn('font-semibold', getComplianceColor(client.complianceRate))}>
                            {client.complianceRate}%
                          </span>
                        </div>
                        <Progress value={client.complianceRate} className="h-2" />
                      </div>

                      <Badge variant="outline" className={complianceBadge.class}>
                        {complianceBadge.label}
                      </Badge>

                      <div className="hidden sm:block text-sm text-muted-foreground">
                        {getLastActiveText(client.client.lastActiveAt)}
                      </div>

                      {/* Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/trainer/clients/${client.clientId}`}>
                              <Eye className="me-2 h-4 w-4" />
                              {t.trainer.viewProfile}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/trainer/messages?client=${client.clientId}`}>
                              <MessageSquare className="me-2 h-4 w-4" />
                              {t.trainer.sendMessage}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => toast({
                              title: t.trainer.comingSoon,
                              description: t.trainer.clientRemovalSoon,
                            })}
                          >
                            <UserX className="me-2 h-4 w-4" />
                            {t.trainer.removeClient}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
