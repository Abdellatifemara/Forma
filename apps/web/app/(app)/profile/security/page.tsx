'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Eye, EyeOff, Lock, Shield, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n';
import { authApi } from '@/lib/api';

export default function SecurityPage() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isChanging, setIsChanging] = useState(false);

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: isAr ? 'مطلوب' : 'Required',
        description: isAr ? 'كل الحقول مطلوبة' : 'All fields are required',
        variant: 'destructive',
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast({
        title: isAr ? 'كلمة المرور قصيرة' : 'Password too short',
        description: isAr ? 'كلمة المرور لازم تكون 8 حروف على الأقل' : 'Password must be at least 8 characters',
        variant: 'destructive',
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: isAr ? 'كلمات المرور مش متطابقة' : 'Passwords don\'t match',
        description: isAr ? 'كلمة المرور الجديدة والتأكيد مختلفين' : 'New password and confirmation don\'t match',
        variant: 'destructive',
      });
      return;
    }

    setIsChanging(true);
    try {
      await authApi.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast({
        title: isAr ? 'تم التغيير' : 'Password Changed',
        description: isAr ? 'تم تغيير كلمة المرور بنجاح' : 'Your password has been updated successfully',
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: error?.message || (isAr ? 'فشل تغيير كلمة المرور' : 'Failed to change password'),
        variant: 'destructive',
      });
    } finally {
      setIsChanging(false);
    }
  };

  const PasswordInput = ({
    label,
    value,
    onChange,
    showKey,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    showKey: 'current' | 'new' | 'confirm';
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <Input
          type={showPasswords[showKey] ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          dir="ltr"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full px-3"
          onClick={() => setShowPasswords(s => ({ ...s, [showKey]: !s[showKey] }))}
        >
          {showPasswords[showKey] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/profile">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isAr ? 'الأمان والخصوصية' : 'Privacy & Security'}</h1>
          <p className="text-sm text-muted-foreground">
            {isAr ? 'إدارة كلمة المرور وإعدادات الأمان' : 'Manage your password and security settings'}
          </p>
        </div>
      </div>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <CardTitle>{isAr ? 'تغيير كلمة المرور' : 'Change Password'}</CardTitle>
          </div>
          <CardDescription>
            {isAr ? 'ننصح بتغيير كلمة المرور كل فترة' : 'We recommend changing your password regularly'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PasswordInput
            label={isAr ? 'كلمة المرور الحالية' : 'Current Password'}
            value={passwordForm.currentPassword}
            onChange={(v) => setPasswordForm(f => ({ ...f, currentPassword: v }))}
            showKey="current"
          />
          <PasswordInput
            label={isAr ? 'كلمة المرور الجديدة' : 'New Password'}
            value={passwordForm.newPassword}
            onChange={(v) => setPasswordForm(f => ({ ...f, newPassword: v }))}
            showKey="new"
          />
          <PasswordInput
            label={isAr ? 'تأكيد كلمة المرور' : 'Confirm New Password'}
            value={passwordForm.confirmPassword}
            onChange={(v) => setPasswordForm(f => ({ ...f, confirmPassword: v }))}
            showKey="confirm"
          />
          <p className="text-xs text-muted-foreground">
            {isAr ? '8 حروف على الأقل، حرف كبير وصغير ورقم' : 'Minimum 8 characters, include uppercase, lowercase, and a number'}
          </p>
          <Button
            variant="forma"
            onClick={handleChangePassword}
            disabled={isChanging}
          >
            {isChanging && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
            {isAr ? 'تغيير كلمة المرور' : 'Change Password'}
          </Button>
        </CardContent>
      </Card>

      {/* Security Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <CardTitle>{isAr ? 'معلومات الأمان' : 'Security Info'}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">{isAr ? 'التشفير' : 'Encryption'}</p>
              <p className="text-sm text-muted-foreground">
                {isAr ? 'كل بياناتك مشفرة بمعايير عالمية' : 'All your data is encrypted with industry standards'}
              </p>
            </div>
            <span className="text-green-500 text-sm font-medium">AES-256</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">{isAr ? 'الرسائل' : 'Messages'}</p>
              <p className="text-sm text-muted-foreground">
                {isAr ? 'رسائلك مشفرة من الطرف للطرف' : 'Your messages are end-to-end encrypted'}
              </p>
            </div>
            <span className="text-green-500 text-sm font-medium">E2E</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
