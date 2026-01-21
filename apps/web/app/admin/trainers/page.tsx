'use client';

import { useState } from 'react';
import { Search, Filter, MoreHorizontal, CheckCircle, XCircle } from 'lucide-react';
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

const trainers = [
  {
    id: '1',
    name: 'Mohamed Hassan',
    email: 'mohamed.h@email.com',
    specialization: 'Strength Training',
    status: 'verified',
    clients: 47,
    rating: 4.9,
    revenue: '12,450 EGP',
    joined: '2023-06-15',
  },
  {
    id: '2',
    name: 'Sara Ahmed',
    email: 'sara.a@email.com',
    specialization: 'Weight Loss',
    status: 'verified',
    clients: 32,
    rating: 4.8,
    revenue: '8,200 EGP',
    joined: '2023-09-20',
  },
  {
    id: '3',
    name: 'Youssef Ali',
    email: 'youssef@email.com',
    specialization: 'CrossFit',
    status: 'pending',
    clients: 0,
    rating: 0,
    revenue: '0 EGP',
    joined: '2024-03-01',
  },
];

const applications = [
  {
    id: '4',
    name: 'Fatma Ibrahim',
    email: 'fatma@email.com',
    specialization: 'Yoga & Pilates',
    certifications: ['NASM-CPT', 'RYT-200'],
    experience: '5 years',
    submitted: '2024-03-10',
  },
  {
    id: '5',
    name: 'Karim Mohamed',
    email: 'karim.m@email.com',
    specialization: 'Bodybuilding',
    certifications: ['ISSA-CPT', 'IFBB Pro'],
    experience: '8 years',
    submitted: '2024-03-08',
  },
];

export default function TrainersPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTrainers = trainers.filter(
    (trainer) =>
      trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trainer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <div className="text-2xl font-bold">156</div>
            <p className="text-sm text-muted-foreground">Active Trainers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">12</div>
            <p className="text-sm text-muted-foreground">Pending Applications</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">4.7</div>
            <p className="text-sm text-muted-foreground">Avg Rating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">892K EGP</div>
            <p className="text-sm text-muted-foreground">Monthly Payout</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trainers">
        <TabsList>
          <TabsTrigger value="trainers">Active Trainers</TabsTrigger>
          <TabsTrigger value="applications">
            Applications
            <Badge variant="secondary" className="ml-2">
              {applications.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trainers" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search trainers..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Trainers Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Trainers</CardTitle>
              <CardDescription>
                {filteredTrainers.length} trainers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trainer</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Clients</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrainers.map((trainer) => (
                    <TableRow key={trainer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={`/avatars/${trainer.id}.jpg`} />
                            <AvatarFallback>
                              {trainer.name.split(' ').map((n) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{trainer.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {trainer.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{trainer.specialization}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            trainer.status === 'verified' ? 'forma' : 'warning'
                          }
                        >
                          {trainer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{trainer.clients}</TableCell>
                      <TableCell>
                        {trainer.rating > 0 ? trainer.rating : '-'}
                      </TableCell>
                      <TableCell>{trainer.revenue}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem>View Clients</DropdownMenuItem>
                            <DropdownMenuItem>Edit Details</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Suspend Trainer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Applications</CardTitle>
              <CardDescription>
                Review and approve trainer applications
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                        <Button size="sm" variant="outline">
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                        <Button size="sm" variant="forma">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Specialization</p>
                        <p className="font-medium">{app.specialization}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Experience</p>
                        <p className="font-medium">{app.experience}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Submitted</p>
                        <p className="font-medium">{app.submitted}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">Certifications</p>
                      <div className="mt-1 flex gap-2">
                        {app.certifications.map((cert) => (
                          <Badge key={cert} variant="secondary">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
