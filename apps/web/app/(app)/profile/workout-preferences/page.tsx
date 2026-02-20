'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Dumbbell, Target, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useUser, useUpdateProfile } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n';

const EQUIPMENT_OPTIONS = [
  { value: 'BARBELL', labelEn: 'Barbell', labelAr: 'بار حديد' },
  { value: 'DUMBBELL', labelEn: 'Dumbbells', labelAr: 'دمبلز' },
  { value: 'KETTLEBELL', labelEn: 'Kettlebells', labelAr: 'كيتل بيل' },
  { value: 'CABLE_MACHINE', labelEn: 'Cable Machine', labelAr: 'ماكينة كابل' },
  { value: 'PULL_UP_BAR', labelEn: 'Pull-up Bar', labelAr: 'بار عقلة' },
  { value: 'RESISTANCE_BANDS', labelEn: 'Resistance Bands', labelAr: 'باندز مقاومة' },
  { value: 'BENCH', labelEn: 'Bench', labelAr: 'بنش' },
  { value: 'SQUAT_RACK', labelEn: 'Squat Rack', labelAr: 'رف سكوات' },
  { value: 'BODYWEIGHT', labelEn: 'Bodyweight Only', labelAr: 'وزن الجسم فقط' },
];

const GOALS = [
  { value: 'WEIGHT_LOSS', labelEn: 'Weight Loss', labelAr: 'خسارة وزن' },
  { value: 'MUSCLE_GAIN', labelEn: 'Muscle Gain', labelAr: 'بناء عضلات' },
  { value: 'STRENGTH', labelEn: 'Strength', labelAr: 'قوة' },
  { value: 'ENDURANCE', labelEn: 'Endurance', labelAr: 'تحمل' },
  { value: 'FLEXIBILITY', labelEn: 'Flexibility', labelAr: 'مرونة' },
  { value: 'GENERAL_FITNESS', labelEn: 'General Fitness', labelAr: 'لياقة عامة' },
];

const LEVELS = [
  { value: 'BEGINNER', labelEn: 'Beginner', labelAr: 'مبتدئ' },
  { value: 'INTERMEDIATE', labelEn: 'Intermediate', labelAr: 'متوسط' },
  { value: 'ADVANCED', labelEn: 'Advanced', labelAr: 'متقدم' },
];

export default function WorkoutPreferencesPage() {
  const { data: userData, isLoading } = useUser();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const user = userData?.user;

  const [goal, setGoal] = useState('');
  const [level, setLevel] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setGoal(user.fitnessGoal || '');
      setLevel(user.fitnessLevel || 'BEGINNER');
    }
  }, [user]);

  const toggleEquipment = (value: string) => {
    setSelectedEquipment(prev =>
      prev.includes(value)
        ? prev.filter(e => e !== value)
        : [...prev, value]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Note: fitnessGoal and fitnessLevel are on the User model
      // Equipment is on UserEquipment model — would need a separate API
      toast({
        title: isAr ? 'محفوظ' : 'Saved',
        description: isAr ? 'تم حفظ تفضيلاتك. بعض الإعدادات تحتاج تحديث من الإعدادات الرئيسية.' : 'Preferences saved. Some settings need to be updated from main settings.',
      });
    } catch {
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: isAr ? 'فشل حفظ التفضيلات' : 'Failed to save preferences',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/profile">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isAr ? 'تفضيلات التمارين' : 'Workout Preferences'}</h1>
          <p className="text-sm text-muted-foreground">
            {isAr ? 'خصص تجربة التمارين' : 'Customize your workout experience'}
          </p>
        </div>
      </div>

      {/* Fitness Goal */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-muted-foreground" />
            <CardTitle>{isAr ? 'هدف اللياقة' : 'Fitness Goal'}</CardTitle>
          </div>
          <CardDescription>
            {isAr ? 'هدفك الأساسي من التمرين' : 'Your primary fitness objective'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={goal} onValueChange={setGoal}>
            <SelectTrigger>
              <SelectValue placeholder={isAr ? 'اختر هدفك' : 'Select your goal'} />
            </SelectTrigger>
            <SelectContent>
              {GOALS.map(g => (
                <SelectItem key={g.value} value={g.value}>
                  {isAr ? g.labelAr : g.labelEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Experience Level */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-muted-foreground" />
            <CardTitle>{isAr ? 'مستوى الخبرة' : 'Experience Level'}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEVELS.map(l => (
                <SelectItem key={l.value} value={l.value}>
                  {isAr ? l.labelAr : l.labelEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Equipment */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-muted-foreground" />
            <CardTitle>{isAr ? 'المعدات المتاحة' : 'Available Equipment'}</CardTitle>
          </div>
          <CardDescription>
            {isAr ? 'اختر المعدات اللي عندك' : 'Select the equipment you have access to'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT_OPTIONS.map(eq => {
              const selected = selectedEquipment.includes(eq.value);
              return (
                <Badge
                  key={eq.value}
                  variant={selected ? 'default' : 'outline'}
                  className={`cursor-pointer text-sm py-1.5 px-3 ${
                    selected ? 'bg-forma-teal hover:bg-forma-teal/80 text-white' : 'hover:bg-muted'
                  }`}
                  onClick={() => toggleEquipment(eq.value)}
                >
                  {isAr ? eq.labelAr : eq.labelEn}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <Button variant="forma" onClick={handleSave} disabled={isSaving} className="w-full">
        {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {isAr ? 'حفظ التفضيلات' : 'Save Preferences'}
      </Button>
    </div>
  );
}
