'use client';

import { useState } from 'react';
import { Search, Filter, Plus, MoreHorizontal } from 'lucide-react';
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
import { Progress } from '@/components/ui/progress';

const clients = [
  {
    id: '1',
    name: 'Mohamed Ali',
    email: 'mohamed@email.com',
    phone: '+20 100 123 4567',
    status: 'active',
    plan: 'Weight Loss',
    progress: 75,
    startDate: '2024-01-15',
    lastActive: '2 hours ago',
  },
  {
    id: '2',
    name: 'Sara Ahmed',
    email: 'sara@email.com',
    phone: '+20 101 234 5678',
    status: 'active',
    plan: 'Muscle Building',
    progress: 60,
    startDate: '2024-02-01',
    lastActive: '1 day ago',
  },
  {
    id: '3',
    name: 'Youssef Hassan',
    email: 'youssef@email.com',
    phone: '+20 102 345 6789',
    status: 'pending',
    plan: 'General Fitness',
    progress: 25,
    startDate: '2024-03-10',
    lastActive: '3 days ago',
  },
  {
    id: '4',
    name: 'Nour Ibrahim',
    email: 'nour@email.com',
    phone: '+20 103 456 7890',
    status: 'active',
    plan: 'Strength Training',
    progress: 90,
    startDate: '2023-11-20',
    lastActive: '5 hours ago',
  },
  {
    id: '5',
    name: 'Layla Mahmoud',
    email: 'layla@email.com',
    phone: '+20 104 567 8901',
    status: 'inactive',
    plan: 'Weight Loss',
    progress: 45,
    startDate: '2024-01-05',
    lastActive: '2 weeks ago',
  },
];

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground">
            Manage your client relationships and track their progress.
          </p>
        </div>
        <Button variant="forma">
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
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

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Clients</CardTitle>
          <CardDescription>
            {filteredClients.length} clients total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={`/avatars/${client.id}.jpg`} />
                        <AvatarFallback>
                          {client.name.split(' ').map((n) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {client.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{client.plan}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        client.status === 'active'
                          ? 'forma'
                          : client.status === 'pending'
                          ? 'warning'
                          : 'secondary'
                      }
                    >
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={client.progress} className="w-20" />
                      <span className="text-sm text-muted-foreground">
                        {client.progress}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {client.lastActive}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Send Message</DropdownMenuItem>
                        <DropdownMenuItem>Edit Plan</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Remove Client
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
    </div>
  );
}
