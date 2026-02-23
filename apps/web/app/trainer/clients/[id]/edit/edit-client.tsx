'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Target,
  Activity,
  Settings,
  Construction,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n';

export default function EditClientPage() {
  const params = useParams();
  const clientId = params.id as string;
  const { language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/trainer/clients/${clientId}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isAr ? 'تعديل إعدادات العميل' : 'Edit Client Settings'}</h1>
          <p className="text-muted-foreground">{isAr ? 'إدارة أهداف العميل وتفضيلاته' : 'Manage client goals and preferences'}</p>
        </div>
        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50 ml-auto">
          {isAr ? 'قريباً' : 'Coming Soon'}
        </Badge>
      </div>

      {/* Coming Soon Card */}
      <Card className="glass border-amber-500/30 bg-amber-500/5">
        <CardContent className="py-12">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-6">
              <Construction className="h-8 w-8 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{isAr ? 'إعدادات العميل قريباً' : 'Client Settings Coming Soon'}</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              {isAr ? 'تعديل أهداف العميل وتحديث الملف الرياضي وتخصيص تفضيلات التدريب.' : 'Edit client goals, update their fitness profile, and customize their training preferences.'}
            </p>

            {/* Preview of features */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-3xl mx-auto">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                <User className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                <p className="font-medium text-sm">{isAr ? 'الملف الشخصي' : 'Profile'}</p>
                <p className="text-xs text-muted-foreground">{isAr ? 'بيانات أساسية وصور' : 'Basic info & photos'}</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                <Target className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                <p className="font-medium text-sm">{isAr ? 'الأهداف' : 'Goals'}</p>
                <p className="text-xs text-muted-foreground">{isAr ? 'أهداف الوزن واللياقة' : 'Weight & fitness targets'}</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                <Activity className="h-6 w-6 text-green-400 mx-auto mb-2" />
                <p className="font-medium text-sm">{isAr ? 'التدريب' : 'Training'}</p>
                <p className="text-xs text-muted-foreground">{isAr ? 'الجدول والتفضيلات' : 'Schedule & preferences'}</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                <Settings className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                <p className="font-medium text-sm">{isAr ? 'الإشعارات' : 'Notifications'}</p>
                <p className="text-xs text-muted-foreground">{isAr ? 'تذكيرات وتنبيهات' : 'Reminders & alerts'}</p>
              </div>
            </div>

            <div className="mt-8">
              <Button variant="outline" asChild>
                <Link href={`/trainer/clients/${clientId}`}>
                  <ArrowLeft className="me-2 h-4 w-4" />
                  {isAr ? 'رجوع للعميل' : 'Back to Client'}
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
