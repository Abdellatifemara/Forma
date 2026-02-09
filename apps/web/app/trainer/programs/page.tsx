'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  MoreHorizontal,
  Users,
  Calendar,
  Copy,
  Pencil,
  Trash2,
  FileText,
  Upload,
  Sparkles,
  Dumbbell,
  ChevronRight,
  Clock,
  Target,
  Loader2,
  AlertCircle,
  Check,
  ArrowLeft,
  UserPlus,
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
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useProgramsManager } from '@/hooks/use-programs';

function ProgramsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const assignToClientId = searchParams.get('assign');
  const isAssignMode = !!assignToClientId;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [assignSuccess, setAssignSuccess] = useState(false);

  const { programs, isLoading, error, duplicate, delete: deleteProgram, isDuplicating, assignToClient, isAssigning } = useProgramsManager();

  // Handle program assignment
  const handleAssignProgram = async (programId: string) => {
    if (!assignToClientId || isAssigning) return;

    try {
      await assignToClient({ clientId: assignToClientId, programId });
      setAssignSuccess(true);
      // Redirect back to client page after short delay
      setTimeout(() => {
        router.push(`/trainer/clients/${assignToClientId}`);
      }, 1500);
    } catch (err) {
      // Error handled
      alert('Failed to assign program. Please try again.');
    }
  };

  const filteredPrograms = programs.filter((program) => {
    const matchesSearch = program.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'active') return matchesSearch && program.status === 'ACTIVE';
    if (activeTab === 'draft') return matchesSearch && program.status === 'DRAFT';
    return matchesSearch;
  });

  const stats = {
    total: programs.length,
    active: programs.filter(p => p.status === 'ACTIVE').length,
    clients: programs.reduce((sum, p) => sum + p.clientCount, 0),
    drafts: programs.filter(p => p.status === 'DRAFT').length,
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicate(id);
    } catch (err) {
      // Error handled
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this program?')) return;
    try {
      await deleteProgram(id);
    } catch (err) {
      // Error handled
    }
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
        <h2 className="text-xl font-semibold mb-2">Failed to load programs</h2>
        <p className="text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  const getSourceBadge = (sourceType: string) => {
    switch (sourceType) {
      case 'pdf':
        return { icon: FileText, label: 'From PDF', class: 'bg-blue-500/20 text-blue-400 border-blue-500/50' };
      case 'ai_generated':
        return { icon: Sparkles, label: 'Auto Generated', class: 'bg-purple-500/20 text-purple-400 border-purple-500/50' };
      default:
        return { icon: Pencil, label: 'Manual', class: 'bg-muted text-muted-foreground' };
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Assignment Mode Banner */}
      {isAssignMode && (
        <Card className="glass border-primary/50 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/20">
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">
                    {assignSuccess ? 'Program Assigned!' : 'Select a Program to Assign'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {assignSuccess
                      ? 'Redirecting back to client...'
                      : 'Click on a program below to assign it to your client'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {assignSuccess && <Check className="h-5 w-5 text-green-500" />}
                {(isAssigning) && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/trainer/clients/${assignToClientId}`)}
                  disabled={isAssigning}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Programs</h1>
          <p className="text-muted-foreground">
            {isAssignMode
              ? 'Select a program to assign to your client'
              : 'Create and manage workout programs for your clients'}
          </p>
        </div>
        {!isAssignMode && (
          <div className="flex gap-2">
            <Button variant="outline" className="border-primary/50 hover:bg-primary/10" asChild>
              <Link href="/trainer/programs/upload">
                <Upload className="mr-2 h-4 w-4" />
                Upload PDF
              </Link>
            </Button>
            <Button className="btn-primary" asChild>
              <Link href="/trainer/programs/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Program
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/trainer/programs/upload" className="block">
          <Card className="glass border-border/50 cursor-pointer hover:border-primary/30 transition-all group h-full">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                  <Upload className="h-6 w-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Upload PDF Program</p>
                  <p className="text-sm text-muted-foreground">
                    Convert your existing PDFs to interactive programs
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/trainer/programs/new" className="block">
          <Card className="glass border-border/50 cursor-pointer hover:border-primary/30 transition-all group h-full">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                  <Dumbbell className="h-6 w-6 text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Build from Scratch</p>
                  <p className="text-sm text-muted-foreground">
                    Create a custom program step by step
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/trainer/programs/ai" className="block">
          <Card className="glass border-border/50 cursor-pointer hover:border-primary/30 transition-all group h-full">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                  <Sparkles className="h-6 w-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Smart Program Generator</p>
                  <p className="text-sm text-muted-foreground">
                    Create a program based on client goals
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/20">
                <FileText className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Programs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-green-500/20">
                <Target className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Active Programs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/20">
                <Users className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.clients}</p>
                <p className="text-sm text-muted-foreground">Clients Enrolled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-yellow-500/20">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-400">{stats.drafts}</p>
                <p className="text-sm text-muted-foreground">Drafts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Tabs */}
      <Card className="glass border-border/50">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search programs..."
                className="pl-10 bg-muted/50 border-border/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="draft">Drafts</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Programs Grid */}
      {filteredPrograms.length === 0 ? (
        <Card className="glass border-border/50">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">No programs found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'Try a different search term' : 'Create your first program to get started'}
            </p>
            {!searchQuery && (
              <Button asChild>
                <Link href="/trainer/programs/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Program
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredPrograms.map((program) => {
            const sourceBadge = getSourceBadge(program.sourceType || 'manual');
            const SourceIcon = sourceBadge.icon;
            const canAssign = isAssignMode && program.status === 'ACTIVE';
            return (
              <Card
                key={program.id}
                className={cn(
                  "glass border-border/50 transition-all",
                  canAssign
                    ? "cursor-pointer hover:border-primary hover:bg-primary/5"
                    : "hover:border-primary/30",
                  isAssigning && "opacity-50 pointer-events-none"
                )}
                onClick={canAssign ? () => handleAssignProgram(program.id) : undefined}
              >
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-lg">{program.nameEn}</CardTitle>
                      <Badge
                        variant={program.status === 'ACTIVE' ? 'default' : 'secondary'}
                        className={program.status === 'ACTIVE'
                          ? 'bg-green-500/20 text-green-400 border-green-500/50'
                          : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                        }
                      >
                        {program.status === 'ACTIVE' ? 'Active' : 'Draft'}
                      </Badge>
                    </div>
                    <CardDescription className="mt-1">
                      {program.descriptionEn || 'No description'}
                    </CardDescription>
                  </div>
                  {isAssignMode ? (
                    canAssign ? (
                      <Badge className="bg-primary/20 text-primary border-primary/50">
                        <Check className="h-3 w-3 mr-1" />
                        Click to Assign
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-muted-foreground">
                        Draft - Not Available
                      </Badge>
                    )
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/trainer/programs/${program.id}`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(program.id)} disabled={isDuplicating}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(program.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {program.durationWeeks} weeks
                    </span>
                    <span className="flex items-center gap-1">
                      <Dumbbell className="h-4 w-4" />
                      {program.workoutDayCount} days
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {program.priceEGP && (
                        <Badge variant="outline" className="border-green-500/30 text-green-400">
                          {program.priceEGP} EGP
                        </Badge>
                      )}
                      <Badge variant="outline" className={sourceBadge.class}>
                        <SourceIcon className="h-3 w-3 mr-1" />
                        {sourceBadge.label}
                      </Badge>
                    </div>
                    <span className="flex items-center gap-1 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className={cn(
                        "font-medium",
                        program.clientCount > 0 ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        {program.clientCount} {program.clientCount === 1 ? 'client' : 'clients'}
                      </span>
                    </span>
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

export default function ProgramsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <ProgramsPageContent />
    </Suspense>
  );
}
