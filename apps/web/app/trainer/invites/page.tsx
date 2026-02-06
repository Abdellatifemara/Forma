'use client';

import { useState, useEffect } from 'react';
import {
  Link2,
  Copy,
  Check,
  Plus,
  Trash2,
  Crown,
  Users,
  Clock,
  Share2,
  ExternalLink,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { trainersApi, type TrainerInvite } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function TrainerInvitesPage() {
  const [invites, setInvites] = useState<TrainerInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Create invite dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [grantsPremium, setGrantsPremium] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Deactivate confirm state
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const fetchInvites = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await trainersApi.getMyInvites();
      setInvites(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invites');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  const handleCopy = async (invite: TrainerInvite) => {
    try {
      await navigator.clipboard.writeText(invite.link);
      setCopiedId(invite.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async (invite: TrainerInvite) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on Forma',
          text: 'I want to be your personal trainer! Use this link to join:',
          url: invite.link,
        });
      } catch (err) {
        // User cancelled or share failed
        handleCopy(invite);
      }
    } else {
      handleCopy(invite);
    }
  };

  const handleCreate = async () => {
    try {
      setIsCreating(true);
      const result = await trainersApi.createInviteLink(grantsPremium);
      setInvites(prev => [{
        id: result.code,
        code: result.code,
        link: result.link,
        uses: 0,
        maxUses: null,
        grantsPremium: result.grantsPremium,
        expiresAt: result.expiresAt,
        isActive: true,
        createdAt: new Date().toISOString(),
        isExpired: false,
      }, ...prev]);
      setIsCreateDialogOpen(false);
      setGrantsPremium(false);
    } catch (err) {
      console.error('Failed to create invite:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateId) return;
    try {
      setIsDeactivating(true);
      await trainersApi.deactivateInvite(deactivateId);
      setInvites(prev =>
        prev.map(inv =>
          inv.id === deactivateId ? { ...inv, isActive: false } : inv
        )
      );
      setDeactivateId(null);
    } catch (err) {
      console.error('Failed to deactivate:', err);
    } finally {
      setIsDeactivating(false);
    }
  };

  const activeInvites = invites.filter(inv => inv.isActive && !inv.isExpired);
  const expiredInvites = invites.filter(inv => !inv.isActive || inv.isExpired);

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
        <h2 className="text-xl font-semibold mb-2">Failed to load invites</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchInvites}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invite Links</h1>
          <p className="text-muted-foreground">
            Create and manage invite links to grow your client base
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-primary">
              <Plus className="h-5 w-5 mr-2" />
              Create Invite
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Invite Link</DialogTitle>
              <DialogDescription>
                Generate a unique invite link to share with potential clients
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="premium">Grant Premium Access</Label>
                  <p className="text-sm text-muted-foreground">
                    Clients who join with this link get free Premium
                  </p>
                </div>
                <Switch
                  id="premium"
                  checked={grantsPremium}
                  onCheckedChange={setGrantsPremium}
                />
              </div>
              {grantsPremium && (
                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-sm">
                  <p className="text-yellow-500 font-medium">Trusted Partner Feature</p>
                  <p className="text-muted-foreground">
                    Only Trusted Partners can gift Premium access
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Link'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/20">
                <Link2 className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeInvites.length}</p>
                <p className="text-sm text-muted-foreground">Active Links</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-green-500/20">
                <Users className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {invites.reduce((sum, inv) => sum + inv.uses, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Joins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-yellow-500/20">
                <Crown className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {invites.filter(inv => inv.grantsPremium).reduce((sum, inv) => sum + inv.uses, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Premium Gifted</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Invites */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle>Active Invite Links</CardTitle>
          <CardDescription>Links that clients can currently use to join</CardDescription>
        </CardHeader>
        <CardContent>
          {activeInvites.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Link2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No active invite links</p>
              <p className="text-sm">Create one to start inviting clients</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-card/50 border border-border/50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm font-mono text-primary truncate">
                        {invite.link}
                      </code>
                      {invite.grantsPremium && (
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                          <Crown className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {invite.uses} joins
                      </span>
                      {invite.expiresAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Expires {new Date(invite.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(invite)}
                      className="h-9"
                    >
                      {copiedId === invite.id ? (
                        <>
                          <Check className="h-4 w-4 mr-1 text-green-500" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare(invite)}
                      className="h-9"
                    >
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeactivateId(invite.id)}
                      className="h-9 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expired/Deactivated */}
      {expiredInvites.length > 0 && (
        <Card className="glass border-border/50 opacity-75">
          <CardHeader>
            <CardTitle className="text-muted-foreground">Expired & Deactivated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiredInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div>
                    <code className="text-sm font-mono text-muted-foreground">
                      {invite.code}
                    </code>
                    <p className="text-xs text-muted-foreground">
                      {invite.uses} joins • {invite.isExpired ? 'Expired' : 'Deactivated'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deactivate Confirmation Dialog */}
      <Dialog open={!!deactivateId} onOpenChange={() => setDeactivateId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate Invite Link?</DialogTitle>
            <DialogDescription>
              This link will no longer work for new clients. Existing clients who
              joined through this link will not be affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeactivateId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeactivate}
              disabled={isDeactivating}
            >
              {isDeactivating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deactivating...
                </>
              ) : (
                'Deactivate'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
