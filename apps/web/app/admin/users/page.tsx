'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, MoreHorizontal, Download, Loader2, AlertCircle, Crown, Ban, UserCheck, Trash2 } from 'lucide-react';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { adminApi, type AdminUser } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n';

interface UsersMeta {
  total: number;
  page: number;
  limit?: number;
  totalPages: number;
}

export default function UsersPage() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState<UsersMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [actionDialog, setActionDialog] = useState<'suspend' | 'premium' | 'delete' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminApi.getUsers({
        page,
        limit: 20,
        query: searchQuery || undefined,
      });
      setUsers(response.data);
      setMeta(response.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : (isAr ? 'فشل تحميل المستخدمين' : 'Failed to load users'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, searchQuery]);

  const filteredUsers = planFilter === 'all'
    ? users
    : users.filter(u => u.subscription?.toLowerCase() === planFilter);

  const getLastActive = (date: string | null) => {
    if (!date) return isAr ? 'أبداً' : 'Never';
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return isAr ? 'دلوقتي' : 'Just now';
    if (hours < 24) return isAr ? `${hours}س` : `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return isAr ? 'امبارح' : 'Yesterday';
    if (days < 7) return isAr ? `${days}ي` : `${days}d ago`;
    const weeks = Math.floor(days / 7);
    return isAr ? `${weeks}أ` : `${weeks}w ago`;
  };

  const handleUpdateUser = async (userId: string, data: Record<string, unknown>) => {
    setIsProcessing(true);
    try {
      await adminApi.updateUser(userId, data);
      toast({ title: isAr ? 'تم بنجاح' : 'Success', description: isAr ? 'تم تحديث المستخدم بنجاح' : 'User updated successfully' });
      fetchUsers();
    } catch (err) {
      toast({ title: isAr ? 'خطأ' : 'Error', description: isAr ? 'فشل تحديث المستخدم' : 'Failed to update user', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
      setActionDialog(null);
      setSelectedUser(null);
    }
  };

  const handleGivePremium = async () => {
    if (!selectedUser) return;
    setIsProcessing(true);
    try {
      await adminApi.updateUserSubscription(selectedUser.id, 'PREMIUM');
      toast({ title: isAr ? 'تم بنجاح' : 'Success', description: isAr ? `${selectedUser.name} بقى عنده اشتراك بريميوم` : `${selectedUser.name} now has Premium subscription` });
      fetchUsers();
    } catch (err) {
      toast({ title: isAr ? 'خطأ' : 'Error', description: isAr ? 'فشل تحديث الاشتراك' : 'Failed to update subscription', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
      setActionDialog(null);
      setSelectedUser(null);
    }
  };

  const handleSuspendUser = () => {
    if (!selectedUser) return;
    handleUpdateUser(selectedUser.id, { role: 'SUSPENDED' });
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setIsProcessing(true);
    try {
      await adminApi.deleteUser(selectedUser.id);
      toast({ title: isAr ? 'تم بنجاح' : 'Success', description: isAr ? `تم حذف ${selectedUser.name}` : `${selectedUser.name} has been deleted` });
      fetchUsers();
    } catch (err) {
      toast({ title: isAr ? 'خطأ' : 'Error', description: isAr ? 'فشل حذف المستخدم' : 'Failed to delete user', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
      setActionDialog(null);
      setSelectedUser(null);
    }
  };

  if (isLoading && users.length === 0) {
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
        <h2 className="text-xl font-semibold mb-2">{isAr ? 'فشل تحميل المستخدمين' : 'Failed to load users'}</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchUsers}>{isAr ? 'حاول تاني' : 'Try Again'}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{isAr ? 'المستخدمين' : 'Users'}</h1>
          <p className="text-muted-foreground">
            {isAr ? 'إدارة ومتابعة كل مستخدمي المنصة.' : 'Manage and monitor all platform users.'}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => toast({ title: isAr ? 'قريباً' : 'Coming Soon', description: isAr ? 'خاصية التصدير هتكون متاحة قريباً' : 'Export feature will be available soon' })}
        >
          <Download className={isAr ? 'ms-2 h-4 w-4' : 'me-2 h-4 w-4'} />
          {isAr ? 'تصدير CSV' : 'Export CSV'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{meta?.total?.toLocaleString(isAr ? 'ar-EG' : 'en-US') || 0}</div>
            <p className="text-sm text-muted-foreground">{isAr ? 'إجمالي المستخدمين' : 'Total Users'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {users.filter(u => u.lastActiveAt && (Date.now() - new Date(u.lastActiveAt).getTime()) < 7 * 24 * 60 * 60 * 1000).length}
            </div>
            <p className="text-sm text-muted-foreground">{isAr ? 'نشطين الأسبوع ده' : 'Active This Week'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {users.filter(u => u.subscription && u.subscription !== 'FREE').length}
            </div>
            <p className="text-sm text-muted-foreground">{isAr ? 'مستخدمين بريميوم' : 'Premium Users'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'TRAINER').length}
            </div>
            <p className="text-sm text-muted-foreground">{isAr ? 'مدربين' : 'Trainers'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className={`absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground`} />
              <Input
                placeholder={isAr ? 'ابحث بالاسم أو الإيميل...' : 'Search users by name or email...'}
                className={isAr ? 'pr-10' : 'pl-10'}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={isAr ? 'كل الباقات' : 'All Plans'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isAr ? 'كل الباقات' : 'All Plans'}</SelectItem>
                <SelectItem value="free">{isAr ? 'مجاني' : 'Free'}</SelectItem>
                <SelectItem value="premium">{isAr ? 'بريميوم' : 'Premium'}</SelectItem>
                <SelectItem value="premium_plus">{isAr ? '+بريميوم' : 'Premium+'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>{isAr ? 'كل المستخدمين' : 'All Users'}</CardTitle>
          <CardDescription>
            {filteredUsers.length} {isAr ? 'مستخدم' : 'users'} {meta && `(${isAr ? 'صفحة' : 'Page'} ${meta.page} ${isAr ? 'من' : 'of'} ${meta.totalPages})`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isAr ? 'المستخدم' : 'User'}</TableHead>
                <TableHead>{isAr ? 'الدور' : 'Role'}</TableHead>
                <TableHead>{isAr ? 'الباقة' : 'Plan'}</TableHead>
                <TableHead>{isAr ? 'تاريخ الانضمام' : 'Joined'}</TableHead>
                <TableHead>{isAr ? 'آخر نشاط' : 'Last Active'}</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {user.name?.split(' ').map((n) => n[0]).join('') || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'ADMIN' ? 'destructive' : user.role === 'TRAINER' ? 'forma' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.subscription === 'PREMIUM_PLUS'
                          ? 'forma'
                          : user.subscription === 'PREMIUM'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {user.subscription || 'FREE'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {getLastActive(user.lastActiveAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align={isAr ? 'start' : 'end'}>
                        <DropdownMenuItem onClick={() => {
                          setSelectedUser(user);
                          setActionDialog('premium');
                        }}>
                          <Crown className={isAr ? 'ms-2 h-4 w-4' : 'me-2 h-4 w-4'} />
                          {isAr ? 'إدي بريميوم' : 'Give Premium'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedUser(user);
                          setActionDialog('suspend');
                        }}>
                          <Ban className={isAr ? 'ms-2 h-4 w-4' : 'me-2 h-4 w-4'} />
                          {isAr ? 'إيقاف المستخدم' : 'Suspend User'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setSelectedUser(user);
                            setActionDialog('delete');
                          }}
                        >
                          <Trash2 className={isAr ? 'ms-2 h-4 w-4' : 'me-2 h-4 w-4'} />
                          {isAr ? 'حذف المستخدم' : 'Delete User'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                {isAr
                  ? `عرض ${(meta.page - 1) * (meta.limit || 20) + 1} من ${Math.min(meta.page * (meta.limit || 20), meta.total)} من ${meta.total}`
                  : `Showing ${(meta.page - 1) * (meta.limit || 20) + 1} to ${Math.min(meta.page * (meta.limit || 20), meta.total)} of ${meta.total}`
                }
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page <= 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  {isAr ? 'السابق' : 'Previous'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page >= meta.totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  {isAr ? 'التالي' : 'Next'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialogs */}
      <Dialog open={actionDialog === 'suspend'} onOpenChange={(open) => !open && setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAr ? 'إيقاف المستخدم' : 'Suspend User'}</DialogTitle>
            <DialogDescription>
              {isAr
                ? `متأكد إنك عايز توقف ${selectedUser?.name}؟ مش هيقدر يدخل التطبيق.`
                : `Are you sure you want to suspend ${selectedUser?.name}? They will not be able to access the app.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>{isAr ? 'إلغاء' : 'Cancel'}</Button>
            <Button variant="destructive" onClick={handleSuspendUser} disabled={isProcessing}>
              {isProcessing ? <Loader2 className={`h-4 w-4 animate-spin ${isAr ? 'ms-2' : 'me-2'}`} /> : null}
              {isAr ? 'إيقاف المستخدم' : 'Suspend User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={actionDialog === 'premium'} onOpenChange={(open) => !open && setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAr ? 'إدي بريميوم' : 'Give Premium'}</DialogTitle>
            <DialogDescription>
              {isAr
                ? `تدي اشتراك بريميوم لـ ${selectedUser?.name}؟`
                : `Grant premium subscription to ${selectedUser?.name}?`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>{isAr ? 'إلغاء' : 'Cancel'}</Button>
            <Button variant="forma" onClick={handleGivePremium} disabled={isProcessing}>
              {isProcessing ? <Loader2 className={`h-4 w-4 animate-spin ${isAr ? 'ms-2' : 'me-2'}`} /> : null}
              {isAr ? 'إدي بريميوم' : 'Give Premium'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={actionDialog === 'delete'} onOpenChange={(open) => !open && setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAr ? 'حذف المستخدم' : 'Delete User'}</DialogTitle>
            <DialogDescription>
              {isAr
                ? `العملية دي مش هتترجع. حساب ${selectedUser?.name} وكل البيانات هيتحذفوا نهائياً.`
                : `This action cannot be undone. ${selectedUser?.name}'s account and all data will be permanently deleted.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>{isAr ? 'إلغاء' : 'Cancel'}</Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={isProcessing}>
              {isProcessing ? <Loader2 className={`h-4 w-4 animate-spin ${isAr ? 'ms-2' : 'me-2'}`} /> : null}
              {isAr ? 'حذف المستخدم' : 'Delete User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
