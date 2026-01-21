'use client';

import { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const monthlyData = [
  { month: 'Jan', earnings: 8500 },
  { month: 'Feb', earnings: 9200 },
  { month: 'Mar', earnings: 12450 },
];

const transactions = [
  {
    id: '1',
    client: 'Mohamed Ali',
    type: 'Subscription',
    amount: 299,
    date: 'Mar 20, 2024',
    status: 'completed',
  },
  {
    id: '2',
    client: 'Sara Ahmed',
    type: 'One-time Session',
    amount: 150,
    date: 'Mar 19, 2024',
    status: 'completed',
  },
  {
    id: '3',
    client: 'Youssef Hassan',
    type: 'Subscription',
    amount: 299,
    date: 'Mar 18, 2024',
    status: 'completed',
  },
  {
    id: '4',
    client: 'Nour Ibrahim',
    type: 'Program Purchase',
    amount: 499,
    date: 'Mar 17, 2024',
    status: 'completed',
  },
  {
    id: '5',
    client: 'Layla Mahmoud',
    type: 'Subscription',
    amount: 299,
    date: 'Mar 15, 2024',
    status: 'pending',
  },
];

const payouts = [
  {
    id: '1',
    amount: 10582,
    period: 'Feb 1 - Feb 29, 2024',
    date: 'Mar 5, 2024',
    status: 'completed',
  },
  {
    id: '2',
    amount: 9180,
    period: 'Jan 1 - Jan 31, 2024',
    date: 'Feb 5, 2024',
    status: 'completed',
  },
  {
    id: '3',
    amount: 8245,
    period: 'Dec 1 - Dec 31, 2023',
    date: 'Jan 5, 2024',
    status: 'completed',
  },
];

export default function EarningsPage() {
  const [timeRange, setTimeRange] = useState('month');

  const totalEarnings = 12450;
  const pendingPayout = 3250;
  const activeSubscribers = 47;
  const avgPerClient = 265;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Earnings</h1>
          <p className="text-muted-foreground">Track your revenue and payouts</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-forma-teal/10 p-2">
                <DollarSign className="h-5 w-5 text-forma-teal" />
              </div>
              <Badge variant="forma" className="flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                +23%
              </Badge>
            </div>
            <p className="mt-3 text-2xl font-bold">{totalEarnings.toLocaleString()} EGP</p>
            <p className="text-sm text-muted-foreground">This Month</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-yellow-500/10 p-2">
                <DollarSign className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold">{pendingPayout.toLocaleString()} EGP</p>
            <p className="text-sm text-muted-foreground">Pending Payout</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                +3
              </Badge>
            </div>
            <p className="mt-3 text-2xl font-bold">{activeSubscribers}</p>
            <p className="text-sm text-muted-foreground">Active Subscribers</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-green-500/10 p-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold">{avgPerClient} EGP</p>
            <p className="text-sm text-muted-foreground">Avg Per Client</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold">Revenue Overview</CardTitle>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {/* Simple bar chart */}
          <div className="h-64">
            <div className="flex h-full items-end justify-around gap-4">
              {monthlyData.map((data) => (
                <div key={data.month} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-lg bg-forma-teal transition-all hover:bg-forma-teal-light"
                    style={{ height: `${(data.earnings / 15000) * 100}%` }}
                  />
                  <span className="text-sm text-muted-foreground">{data.month}</span>
                  <span className="text-sm font-medium">{data.earnings.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium">{tx.client}</TableCell>
                      <TableCell>{tx.type}</TableCell>
                      <TableCell>{tx.amount} EGP</TableCell>
                      <TableCell className="text-muted-foreground">{tx.date}</TableCell>
                      <TableCell>
                        <Badge
                          variant={tx.status === 'completed' ? 'forma' : 'warning'}
                        >
                          {tx.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts">
          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payout Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell className="font-medium">{payout.period}</TableCell>
                      <TableCell>{payout.amount.toLocaleString()} EGP</TableCell>
                      <TableCell className="text-muted-foreground">{payout.date}</TableCell>
                      <TableCell>
                        <Badge variant="forma">{payout.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Next Payout</h3>
                  <p className="text-sm text-muted-foreground">
                    Mar 1 - Mar 31, 2024
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{pendingPayout.toLocaleString()} EGP</p>
                  <p className="text-sm text-muted-foreground">Estimated: Apr 5, 2024</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
