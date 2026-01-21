'use client';

import {
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  MessageSquare,
  Star,
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
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

const recentClients = [
  { name: 'Mohamed Ali', email: 'mohamed@email.com', status: 'active', plan: 'Weight Loss' },
  { name: 'Sara Ahmed', email: 'sara@email.com', status: 'active', plan: 'Muscle Building' },
  { name: 'Youssef Hassan', email: 'youssef@email.com', status: 'pending', plan: 'General Fitness' },
  { name: 'Nour Ibrahim', email: 'nour@email.com', status: 'active', plan: 'Strength Training' },
];

const upcomingSessions = [
  { client: 'Mohamed Ali', time: '10:00 AM', type: 'Video Call' },
  { client: 'Sara Ahmed', time: '2:00 PM', type: 'Check-in' },
  { client: 'Youssef Hassan', time: '4:30 PM', type: 'Form Review' },
];

const recentMessages = [
  { from: 'Mohamed Ali', message: 'Thanks for the new program!', time: '5m ago' },
  { from: 'Sara Ahmed', message: 'Can we reschedule tomorrow?', time: '1h ago' },
  { from: 'Nour Ibrahim', message: 'Great workout today!', time: '3h ago' },
];

export default function TrainerDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your coaching business.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Clients"
          value="47"
          change="+3 this month"
          changeType="positive"
          icon={Users}
        />
        <StatCard
          title="Monthly Revenue"
          value="12,450 EGP"
          change="+23% vs last month"
          changeType="positive"
          icon={DollarSign}
        />
        <StatCard
          title="Session Completion"
          value="94%"
          change="+2% vs last month"
          changeType="positive"
          icon={TrendingUp}
        />
        <StatCard
          title="Average Rating"
          value="4.9"
          change="Based on 127 reviews"
          changeType="neutral"
          icon={Star}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Clients */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Clients</CardTitle>
              <CardDescription>Your latest client activity</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentClients.map((client) => (
                <div
                  key={client.email}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={`/avatars/${client.name}.jpg`} />
                      <AvatarFallback>
                        {client.name.split(' ').map((n) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-muted-foreground">{client.plan}</p>
                    </div>
                  </div>
                  <Badge
                    variant={client.status === 'active' ? 'forma' : 'secondary'}
                  >
                    {client.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingSessions.map((session, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                >
                  <div>
                    <p className="font-medium">{session.client}</p>
                    <p className="text-sm text-muted-foreground">{session.type}</p>
                  </div>
                  <Badge variant="outline">{session.time}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Recent Messages
              </CardTitle>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMessages.map((msg, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 rounded-lg border p-4"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {msg.from.split(' ').map((n) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{msg.from}</p>
                      <span className="text-xs text-muted-foreground">{msg.time}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {msg.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Add New Client
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Session
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" />
              Send Broadcast
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
