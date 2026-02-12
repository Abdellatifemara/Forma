'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, MoreHorizontal, CheckCircle, XCircle, Loader2, AlertCircle, Users, Star, DollarSign, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminApi, type AdminTrainerStats, type AdminTrainer, type AdminApproval } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function TrainersPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [applications, setApplications] = useState<AdminApproval[]>([]);
  const [trainers, setTrainers] = useState<AdminTrainer[]>([]);
  const [stats, setStats] = useState<AdminTrainerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('pending');

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [approvalsData, statsData, trainersData] = await Promise.all([
        adminApi.getPendingApprovals(),
        adminApi.getTrainerStats(),
        adminApi.getAllTrainers({ page: 1, limit: 50 }),
      ]);
      setApplications(approvalsData);
      setStats(statsData);
      setTrainers(trainersData.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (trainerId: string) => {
    setProcessingId(trainerId);
    try {
      await adminApi.approveTrainer(trainerId);
      toast({ title: 'Success', description: 'Trainer approved successfully' });
      fetchData();
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to approve trainer', variant: 'destructive' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (trainerId: string) => {
    setProcessingId(trainerId);
    try {
      await adminApi.rejectTrainer(trainerId);
      toast({ title: 'Success', description: 'Trainer application rejected' });
      fetchData();
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to reject trainer', variant: 'destructive' });
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Failed to load trainers</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchData}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Trainers</h1>
        <p className="text-muted-foreground">
          Manage trainer accounts and review applications.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/20">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats?.activeTrainers ?? 0}</div>
                <p className="text-sm text-muted-foreground">Active Trainers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-yellow-500/20">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats?.pendingTrainers ?? applications.length}</div>
                <p className="text-sm text-muted-foreground">Pending Applications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-green-500/20">
                <Star className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {stats?.avgRating ? stats.avgRating.toFixed(1) : 'N/A'}
                </div>
                <p className="text-sm text-muted-foreground">
                  Avg Rating {stats?.ratingCount ? `(${stats.ratingCount})` : ''}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/20">
                <DollarSign className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {stats?.monthlyPayout ? `${(stats.monthlyPayout / 1000).toFixed(1)}K` : '0'} EGP
                </div>
                <p className="text-sm text-muted-foreground">Monthly Payout</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Pending and All Trainers */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending Applications {applications.length > 0 && `(${applications.length})`}
          </TabsTrigger>
          <TabsTrigger value="all">All Trainers</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Applications</CardTitle>
              <CardDescription>
                {applications.length} applications need review
              </CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="py-12 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p className="text-lg font-medium">All caught up!</p>
                  <p className="text-muted-foreground">No pending trainer applications</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className="rounded-lg border p-6"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>
                              {app.name.split(' ').map((n) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{app.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {app.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(app.id)}
                            disabled={processingId === app.id}
                          >
                            {processingId === app.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <XCircle className="mr-2 h-4 w-4" />
                            )}
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="forma"
                            onClick={() => handleApprove(app.id)}
                            disabled={processingId === app.id}
                          >
                            {processingId === app.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="mr-2 h-4 w-4" />
                            )}
                            Approve
                          </Button>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Type</p>
                          <p className="font-medium">{app.type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <Badge variant="warning">{app.status}</Badge>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Submitted</p>
                          <p className="font-medium">{new Date(app.submittedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Trainers</CardTitle>
              <CardDescription>
                {trainers.length} total trainers on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trainers.length === 0 ? (
                <div className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium">No trainers yet</p>
                  <p className="text-muted-foreground">Trainers will appear here once approved</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Trainer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Specializations</TableHead>
                      <TableHead>Clients</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trainers.map((trainer) => (
                      <TableRow key={trainer.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {trainer.name.split(' ').map((n) => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{trainer.name}</p>
                              <p className="text-sm text-muted-foreground">{trainer.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              trainer.status === 'APPROVED' ? 'forma' :
                              trainer.status === 'PENDING' ? 'warning' :
                              'destructive'
                            }
                          >
                            {trainer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {trainer.specializations?.slice(0, 2).map((s, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {s}
                              </Badge>
                            ))}
                            {trainer.specializations?.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{trainer.specializations.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{trainer.clientCount}</TableCell>
                        <TableCell>
                          {trainer.rating ? (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                              {trainer.rating.toFixed(1)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {trainer.hourlyRate ? `${trainer.hourlyRate} EGP/hr` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {trainer.status === 'PENDING' && (
                                <>
                                  <DropdownMenuItem onClick={() => handleApprove(trainer.id)}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleReject(trainer.id)}>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              {trainer.status === 'APPROVED' && (
                                <DropdownMenuItem onClick={() => handleReject(trainer.id)}>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Revoke Approval
                                </DropdownMenuItem>
                              )}
                              {trainer.status === 'REJECTED' && (
                                <DropdownMenuItem onClick={() => handleApprove(trainer.id)}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Approve
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
