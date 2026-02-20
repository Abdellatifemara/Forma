'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser, useUpdateProfile } from '@/hooks/use-user';
import { useLanguage } from '@/lib/i18n';

export default function EditProfilePage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const { data: userData, isLoading: userLoading } = useUser();
  const updateProfile = useUpdateProfile();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    language: 'en',
    measurementUnit: 'metric',
  });
  const [error, setError] = useState<string | null>(null);

  // Pre-populate form with user data
  useEffect(() => {
    if (userData?.user) {
      const user = userData.user;
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        displayName: user.displayName || '',
        language: user.language || 'en',
        measurementUnit: user.measurementUnit || 'metric',
      });
    }
  }, [userData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await updateProfile.mutateAsync({
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName: formData.displayName || undefined,
        language: formData.language,
        measurementUnit: formData.measurementUnit,
      });
      router.push('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : (isAr ? 'فشل تحديث الملف' : 'Failed to update profile'));
    }
  };

  if (userLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center lg:ml-64">
        <Loader2 className="h-8 w-8 animate-spin text-forma-teal" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:ml-64 lg:pb-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/profile">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{isAr ? 'تعديل الملف' : 'Edit Profile'}</h1>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      {updateProfile.isSuccess && (
        <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-4 text-green-600">
          <Check className="h-5 w-5" />
          <p>{isAr ? 'تم تحديث الملف بنجاح!' : 'Profile updated successfully!'}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{isAr ? 'المعلومات الشخصية' : 'Personal Information'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">{isAr ? 'الاسم الأول' : 'First Name'}</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  placeholder={isAr ? 'أدخل اسمك الأول' : 'Enter your first name'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{isAr ? 'الاسم الأخير' : 'Last Name'}</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  placeholder={isAr ? 'أدخل اسمك الأخير' : 'Enter your last name'}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">{isAr ? 'اسم العرض (اختياري)' : 'Display Name (optional)'}</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
                placeholder={isAr ? 'عايزنا نناديك إيه؟' : 'How should we call you?'}
              />
              <p className="text-sm text-muted-foreground">
                {isAr ? 'ده الاسم اللي بيظهر في التطبيق وللمدربين' : 'This is the name shown in the app and to trainers'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{isAr ? 'البريد الإلكتروني' : 'Email'}</Label>
              <Input
                id="email"
                type="email"
                value={userData?.user?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-sm text-muted-foreground">
                {isAr ? 'تواصل مع الدعم لتغيير بريدك' : 'Contact support to change your email'}
              </p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" variant="forma" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isAr ? 'جاري الحفظ...' : 'Saving...'}
                  </>
                ) : (
                  isAr ? 'حفظ التغييرات' : 'Save Changes'
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/profile">{isAr ? 'إلغاء' : 'Cancel'}</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{isAr ? 'التفضيلات' : 'Preferences'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="language">{isAr ? 'اللغة' : 'Language'}</Label>
              <Select
                value={formData.language}
                onValueChange={(value) =>
                  setFormData({ ...formData, language: value })
                }
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder={isAr ? 'اختر اللغة' : 'Select language'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">العربية (Arabic)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="measurementUnit">{isAr ? 'وحدة القياس' : 'Measurement Unit'}</Label>
              <Select
                value={formData.measurementUnit}
                onValueChange={(value) =>
                  setFormData({ ...formData, measurementUnit: value })
                }
              >
                <SelectTrigger id="measurementUnit">
                  <SelectValue placeholder={isAr ? 'اختر الوحدة' : 'Select unit'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">{isAr ? 'متري (كجم، سم)' : 'Metric (kg, cm)'}</SelectItem>
                  <SelectItem value="imperial">{isAr ? 'إمبراطوري (رطل، بوصة)' : 'Imperial (lbs, in)'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
