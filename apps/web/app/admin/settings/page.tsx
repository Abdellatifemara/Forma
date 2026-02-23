'use client';

import { useState } from 'react';
import {
  Shield,
  Mail,
  Bell,
  Database,
  Globe,
  Key,
  Save,
  AlertCircle,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/lib/i18n';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [settings, setSettings] = useState({
    platformName: 'Forma',
    supportEmail: 'support@formaeg.com',
    defaultLanguage: 'en',
    timezone: 'Africa/Cairo',
    freeTrialDays: 7,
    proPrice: 299,
    elitePrice: 999,
    platformCommission: 15,
    twoFactorRequired: true,
    strongPasswordRequired: true,
    sessionTimeout: '60',
    apiRateLimit: 100,
    loginAttemptsLimit: 5,
    newUserNotifications: true,
    trainerAppNotifications: true,
    paymentIssueNotifications: true,
    dailySummary: false,
  });

  const handleSave = async () => {
    toast({
      title: isAr ? 'إعدادات مُدارة من السيرفر' : 'Server-managed settings',
      description: isAr ? 'إعدادات الأدمن بتتدار من خلال تكوين السيرفر. تواصل مع مدير النظام لتحديث القيم دي.' : 'Admin settings are managed via server configuration. Contact the system administrator to update these values.',
    });
  };

  return (
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{isAr ? 'الإعدادات' : 'Settings'}</h1>
          <p className="text-muted-foreground">
            {isAr ? 'تكوين إعدادات وتفضيلات المنصة' : 'Configure platform settings and preferences'}
          </p>
        </div>
        <Button variant="forma" onClick={handleSave}>
          <Save className={isAr ? 'ms-2 h-4 w-4' : 'me-2 h-4 w-4'} />
          {isAr ? 'حفظ التغييرات' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">
            <Globe className={isAr ? 'ms-2 h-4 w-4' : 'me-2 h-4 w-4'} />
            {isAr ? 'عام' : 'General'}
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className={isAr ? 'ms-2 h-4 w-4' : 'me-2 h-4 w-4'} />
            {isAr ? 'الأمان' : 'Security'}
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className={isAr ? 'ms-2 h-4 w-4' : 'me-2 h-4 w-4'} />
            {isAr ? 'الإشعارات' : 'Notifications'}
          </TabsTrigger>
          <TabsTrigger value="api">
            <Key className={isAr ? 'ms-2 h-4 w-4' : 'me-2 h-4 w-4'} />
            API
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isAr ? 'إعدادات المنصة' : 'Platform Settings'}</CardTitle>
              <CardDescription>
                {isAr ? 'التكوين العام للمنصة' : 'General platform configuration'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{isAr ? 'اسم المنصة' : 'Platform Name'}</Label>
                  <Input
                    value={settings.platformName}
                    onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isAr ? 'إيميل الدعم' : 'Support Email'}</Label>
                  <Input
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isAr ? 'اللغة الافتراضية' : 'Default Language'}</Label>
                  <Select
                    value={settings.defaultLanguage}
                    onValueChange={(v) => setSettings({ ...settings, defaultLanguage: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{isAr ? 'المنطقة الزمنية' : 'Timezone'}</Label>
                  <Select
                    value={settings.timezone}
                    onValueChange={(v) => setSettings({ ...settings, timezone: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Cairo">Cairo (GMT+2)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isAr ? 'إعدادات الاشتراك' : 'Subscription Settings'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>{isAr ? 'أيام الفترة التجريبية' : 'Free Trial Days'}</Label>
                  <Input
                    type="number"
                    value={settings.freeTrialDays}
                    onChange={(e) => setSettings({ ...settings, freeTrialDays: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isAr ? 'سعر بريميوم (ج.م)' : 'Premium Price (EGP)'}</Label>
                  <Input
                    type="number"
                    value={settings.proPrice}
                    onChange={(e) => setSettings({ ...settings, proPrice: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isAr ? 'سعر +بريميوم (ج.م)' : 'Premium+ Price (EGP)'}</Label>
                  <Input
                    type="number"
                    value={settings.elitePrice}
                    onChange={(e) => setSettings({ ...settings, elitePrice: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isAr ? 'عمولة المدربين' : 'Trainer Commission'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>{isAr ? 'عمولة المنصة (%)' : 'Platform Commission (%)'}</Label>
                <Input
                  type="number"
                  value={settings.platformCommission}
                  onChange={(e) => setSettings({ ...settings, platformCommission: parseInt(e.target.value) || 0 })}
                />
                <p className="text-sm text-muted-foreground">
                  {isAr
                    ? `المدربين هيستلموا الباقي ${100 - settings.platformCommission}% من أرباحهم`
                    : `Trainers will receive the remaining ${100 - settings.platformCommission}% of their earnings`}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isAr ? 'المصادقة' : 'Authentication'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{isAr ? 'المصادقة الثنائية' : 'Two-Factor Authentication'}</p>
                  <p className="text-sm text-muted-foreground">
                    {isAr ? 'مطلوب 2FA لحسابات الأدمن' : 'Require 2FA for admin accounts'}
                  </p>
                </div>
                <Switch
                  checked={settings.twoFactorRequired}
                  onCheckedChange={(v) => setSettings({ ...settings, twoFactorRequired: v })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{isAr ? 'متطلبات كلمة المرور' : 'Password Requirements'}</p>
                  <p className="text-sm text-muted-foreground">
                    {isAr ? 'تطبيق سياسة كلمة مرور قوية' : 'Enforce strong password policy'}
                  </p>
                </div>
                <Switch
                  checked={settings.strongPasswordRequired}
                  onCheckedChange={(v) => setSettings({ ...settings, strongPasswordRequired: v })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{isAr ? 'مهلة الجلسة' : 'Session Timeout'}</p>
                  <p className="text-sm text-muted-foreground">
                    {isAr ? 'خروج تلقائي بعد عدم النشاط' : 'Auto-logout after inactivity'}
                  </p>
                </div>
                <Select
                  value={settings.sessionTimeout}
                  onValueChange={(v) => setSettings({ ...settings, sessionTimeout: v })}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">{isAr ? '30 دقيقة' : '30 minutes'}</SelectItem>
                    <SelectItem value="60">{isAr ? 'ساعة' : '1 hour'}</SelectItem>
                    <SelectItem value="120">{isAr ? 'ساعتين' : '2 hours'}</SelectItem>
                    <SelectItem value="never">{isAr ? 'أبداً' : 'Never'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isAr ? 'حدود الاستخدام' : 'Rate Limiting'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{isAr ? 'حد API (طلبات/دقيقة)' : 'API Rate Limit (requests/min)'}</Label>
                  <Input
                    type="number"
                    value={settings.apiRateLimit}
                    onChange={(e) => setSettings({ ...settings, apiRateLimit: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isAr ? 'محاولات الدخول قبل القفل' : 'Login Attempts Before Lock'}</Label>
                  <Input
                    type="number"
                    value={settings.loginAttemptsLimit}
                    onChange={(e) => setSettings({ ...settings, loginAttemptsLimit: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isAr ? 'إشعارات الإيميل' : 'Email Notifications'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{isAr ? 'تسجيل مستخدم جديد' : 'New User Signup'}</p>
                  <p className="text-sm text-muted-foreground">
                    {isAr ? 'توصلك إشعار لما مستخدم جديد يسجل' : 'Get notified when new users register'}
                  </p>
                </div>
                <Switch
                  checked={settings.newUserNotifications}
                  onCheckedChange={(v) => setSettings({ ...settings, newUserNotifications: v })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{isAr ? 'طلبات المدربين' : 'Trainer Applications'}</p>
                  <p className="text-sm text-muted-foreground">
                    {isAr ? 'إشعارات لطلبات المدربين الجديدة' : 'Notifications for new trainer applications'}
                  </p>
                </div>
                <Switch
                  checked={settings.trainerAppNotifications}
                  onCheckedChange={(v) => setSettings({ ...settings, trainerAppNotifications: v })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{isAr ? 'مشاكل الدفع' : 'Payment Issues'}</p>
                  <p className="text-sm text-muted-foreground">
                    {isAr ? 'تنبيهات لفشل الدفع أو النزاعات' : 'Alerts for failed payments or disputes'}
                  </p>
                </div>
                <Switch
                  checked={settings.paymentIssueNotifications}
                  onCheckedChange={(v) => setSettings({ ...settings, paymentIssueNotifications: v })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{isAr ? 'ملخص يومي' : 'Daily Summary'}</p>
                  <p className="text-sm text-muted-foreground">
                    {isAr ? 'تقرير يومي عن نشاط المنصة' : 'Daily report of platform activity'}
                  </p>
                </div>
                <Switch
                  checked={settings.dailySummary}
                  onCheckedChange={(v) => setSettings({ ...settings, dailySummary: v })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {isAr
                ? 'مفاتيح API والأسرار بتتدار من خلال متغيرات البيئة للأمان. تواصل مع مدير النظام لتحديث القيم دي.'
                : 'API keys and secrets are managed through environment variables for security. Contact your system administrator to update these values.'}
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>{isAr ? 'تكوين API' : 'API Configuration'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{isAr ? 'رابط API الأساسي' : 'API Base URL'}</Label>
                <Input value={process.env.NEXT_PUBLIC_API_URL || 'https://api.formaeg.com'} readOnly className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>{isAr ? 'إصدار API' : 'API Version'}</Label>
                <Input value="v1" readOnly className="bg-muted" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isAr ? 'التكاملات مع الأطراف الثالثة' : 'Third-Party Integrations'}</CardTitle>
              <CardDescription>
                {isAr
                  ? 'القيم دي بتتظبط من خلال متغيرات البيئة ومش ممكن تتغير من هنا'
                  : 'These values are configured via environment variables and cannot be changed here.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>OpenAI API Key</Label>
                <Input type="password" value="sk-••••••••••••••••" readOnly className="bg-muted" />
                <p className="text-xs text-muted-foreground">Environment variable: OPENAI_API_KEY</p>
              </div>
              <div className="space-y-2">
                <Label>Paymob API Key</Label>
                <Input type="password" value="pm_••••••••••••••••" readOnly className="bg-muted" />
                <p className="text-xs text-muted-foreground">Environment variable: PAYMOB_API_KEY</p>
              </div>
              <div className="space-y-2">
                <Label>Resend API Key</Label>
                <Input type="password" value="re_••••••••••••••••" readOnly className="bg-muted" />
                <p className="text-xs text-muted-foreground">Environment variable: RESEND_API_KEY</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
