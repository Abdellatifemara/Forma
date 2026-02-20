'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Award,
  Briefcase,
  Check,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  FileText,
  Loader2,
  Star,
  Upload,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { trainersApi } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';

const specializations = [
  { value: 'Weight Loss', labelAr: 'تخسيس' },
  { value: 'Muscle Building', labelAr: 'بناء عضلات' },
  { value: 'Strength Training', labelAr: 'تدريب قوة' },
  { value: 'HIIT & Cardio', labelAr: 'كارديو و HIIT' },
  { value: 'Bodybuilding', labelAr: 'كمال أجسام' },
  { value: 'Powerlifting', labelAr: 'باورليفتنج' },
  { value: 'CrossFit', labelAr: 'كروسفيت' },
  { value: 'Calisthenics', labelAr: 'كاليسثنكس' },
  { value: 'Yoga & Flexibility', labelAr: 'يوجا ومرونة' },
  { value: 'Sports Performance', labelAr: 'أداء رياضي' },
  { value: 'Rehabilitation', labelAr: 'تأهيل إصابات' },
  { value: 'Senior Fitness', labelAr: 'لياقة كبار السن' },
  { value: 'Pre/Post Natal', labelAr: 'قبل/بعد الولادة' },
  { value: 'Nutrition Coaching', labelAr: 'تدريب تغذية' },
];

const certifications = [
  'ACE (American Council on Exercise)',
  'NASM (National Academy of Sports Medicine)',
  'ISSA (International Sports Sciences Association)',
  'NSCA (National Strength and Conditioning Association)',
  'ACSM (American College of Sports Medicine)',
  'CrossFit Level 1/2',
  'Precision Nutrition',
  'CPR/First Aid',
  'Other',
];

const benefits = [
  {
    icon: Users,
    title: 'Access to Clients',
    titleAr: 'وصول للعملاء',
    description: 'Connect with thousands of users looking for personal trainers',
    descriptionAr: 'اتواصل مع آلاف المستخدمين اللي بيدوروا على مدربين شخصيين',
  },
  {
    icon: DollarSign,
    title: 'Earn More',
    titleAr: 'اكسب أكتر',
    description: 'Set your own rates and earn up to 85% of your coaching fees',
    descriptionAr: 'حدد أسعارك واكسب لحد 85% من رسوم التدريب',
  },
  {
    icon: Briefcase,
    title: 'Flexible Schedule',
    titleAr: 'جدول مرن',
    description: 'Work from anywhere and set your own availability',
    descriptionAr: 'اشتغل من أي مكان وحدد مواعيدك بنفسك',
  },
  {
    icon: Star,
    title: 'Build Your Brand',
    titleAr: 'ابني اسمك',
    description: 'Create your profile, share programs, and grow your reputation',
    descriptionAr: 'اعمل بروفايلك وشارك برامجك وكبّر سمعتك',
  },
];

const steps = [
  { id: 1, name: 'Personal Info', nameAr: 'بياناتك', icon: FileText },
  { id: 2, name: 'Experience', nameAr: 'الخبرة', icon: Briefcase },
  { id: 3, name: 'Certifications', nameAr: 'الشهادات', icon: Award },
  { id: 4, name: 'Pricing', nameAr: 'الأسعار', icon: DollarSign },
];

export default function BecomeTrainerPage() {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    bio: '',
    yearsExperience: '',
    specializations: [] as string[],
    certifications: [] as string[],
    certificationFiles: [] as File[],
    hourlyRate: '',
    monthlyRate: '',
    languages: ['Arabic', 'English'],
    availability: 'full-time',
    socialLinks: {
      instagram: '',
      youtube: '',
      website: '',
    },
  });

  const handleSpecializationToggle = (spec: string) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter((s) => s !== spec)
        : [...prev.specializations, spec],
    }));
  };

  const handleCertificationToggle = (cert: string) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter((c) => c !== cert)
        : [...prev.certifications, cert],
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await trainersApi.apply({
        bio: formData.bio,
        specializations: formData.specializations,
        certifications: formData.certifications,
        experience: parseInt(formData.yearsExperience) || 0,
        hourlyRate: parseInt(formData.hourlyRate) || 0,
      });
      router.push('/become-trainer/success');
    } catch (error) {
      // Error handled
      setSubmitError(error instanceof Error ? error.message : (isAr ? 'فشل تقديم الطلب' : 'Failed to submit application'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentStep + 1) / (steps.length + 1)) * 100;

  // Introduction step
  if (currentStep === 0) {
    return (
      <div className="space-y-8 pb-20 lg:ml-64 lg:pb-6">
        {/* Hero Section */}
        <div className="rounded-2xl bg-gradient-to-br from-forma-teal/20 to-forma-teal/5 p-8 lg:p-12">
          <div className="max-w-2xl">
            <Badge variant="forma" className="mb-4">
              {isAr ? 'برنامج المدربين' : 'Trainer Program'}
            </Badge>
            <h1 className="text-3xl font-bold lg:text-4xl">
              {t.becomeTrainer.title}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {t.becomeTrainer.subtitle}
            </p>
            <Button variant="forma" size="lg" className="mt-6" onClick={nextStep}>
              {t.becomeTrainer.apply}
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Benefits */}
        <div>
          <h2 className="mb-6 text-xl font-semibold">{isAr ? 'ليه تنضم لفورما؟' : 'Why Join Forma?'}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <Card key={benefit.title}>
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-forma-teal/10">
                    <benefit.icon className="h-6 w-6 text-forma-teal" />
                  </div>
                  <h3 className="font-semibold">{isAr ? benefit.titleAr : benefit.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {isAr ? benefit.descriptionAr : benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>{t.becomeTrainer.requirements}</CardTitle>
            <CardDescription>
              {isAr ? 'اللي محتاجه عشان تبقى مدرب في فورما' : 'What you need to become a Forma trainer'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {(isAr ? [
                'شهادة فيتنس معتمدة من جهة معترف بيها',
                'خبرة سنة على الأقل في التدريب',
                'شغف إنك تساعد الناس توصل لأهدافها',
                'مهارات تواصل ممتازة',
                'القدرة على عمل برامج تمارين وتغذية مخصصة',
              ] : [
                'Valid fitness certification from a recognized organization',
                'Minimum 1 year of professional training experience',
                'Passion for helping others achieve their fitness goals',
                'Excellent communication skills',
                'Ability to create personalized workout and nutrition plans',
              ]).map((req, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-forma-teal/10">
                    <Check className="h-3 w-3 text-forma-teal" />
                  </div>
                  <span className="text-muted-foreground">{req}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-forma-teal">500+</p>
              <p className="text-sm text-muted-foreground">{isAr ? 'مدرب نشط' : 'Active Trainers'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-forma-teal">50,000+</p>
              <p className="text-sm text-muted-foreground">{isAr ? 'مستخدم نشط' : 'Active Users'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-forma-teal">85%</p>
              <p className="text-sm text-muted-foreground">{isAr ? 'نسبة الأرباح' : 'Revenue Share'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 lg:ml-64 lg:pb-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <Button variant="ghost" onClick={prevStep}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            {isAr ? 'رجوع' : 'Back'}
          </Button>
          <span className="text-sm text-muted-foreground">
            {isAr ? `خطوة ${currentStep} من ${steps.length}` : `Step ${currentStep} of ${steps.length}`}
          </span>
        </div>
        <Progress value={progress} className="h-2" />

        {/* Step Indicators */}
        <div className="mt-6 flex justify-between">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex flex-col items-center ${
                step.id <= currentStep ? 'text-forma-teal' : 'text-muted-foreground'
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  step.id < currentStep
                    ? 'bg-forma-teal text-white'
                    : step.id === currentStep
                    ? 'border-2 border-forma-teal bg-forma-teal/10'
                    : 'border-2 border-muted bg-muted/50'
                }`}
              >
                {step.id < currentStep ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              <span className="mt-2 hidden text-xs font-medium sm:block">
                {isAr ? step.nameAr : step.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Personal Info */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>{isAr ? 'كلمنا عن نفسك' : 'Tell Us About Yourself'}</CardTitle>
            <CardDescription>
              {isAr ? 'شاركنا خلفيتك وإيه اللي بيميزك كمدرب' : 'Share your background and what makes you a great trainer'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>{t.becomeTrainer.bio}</Label>
              <Textarea
                placeholder={isAr ? 'اكتب نبذة عنك توضح خبرتك وفلسفتك في التدريب وإيه اللي العملاء هيستفادوه معاك...' : 'Write a compelling bio that highlights your experience, training philosophy, and what clients can expect when working with you...'}
                className="mt-1.5 min-h-[150px]"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
              <p className="mt-1.5 text-sm text-muted-foreground">
                {formData.bio.length}/500 {isAr ? 'حرف' : 'characters'}
              </p>
            </div>

            <div>
              <Label>{t.becomeTrainer.experience}</Label>
              <Select
                value={formData.yearsExperience}
                onValueChange={(value) =>
                  setFormData({ ...formData, yearsExperience: value })
                }
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder={isAr ? 'اختار سنين الخبرة' : 'Select years of experience'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-2">{isAr ? '١-٢ سنين' : '1-2 years'}</SelectItem>
                  <SelectItem value="3-5">{isAr ? '٣-٥ سنين' : '3-5 years'}</SelectItem>
                  <SelectItem value="5-10">{isAr ? '٥-١٠ سنين' : '5-10 years'}</SelectItem>
                  <SelectItem value="10+">{isAr ? '+١٠ سنين' : '10+ years'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t.becomeTrainer.specialization}</Label>
              <p className="mb-3 text-sm text-muted-foreground">
                {isAr ? 'اختار كل المجالات اللي متخصص فيها' : 'Select all areas you specialize in'}
              </p>
              <div className="flex flex-wrap gap-2">
                {specializations.map((spec) => (
                  <Badge
                    key={spec.value}
                    variant={
                      formData.specializations.includes(spec.value) ? 'forma' : 'outline'
                    }
                    className="cursor-pointer"
                    onClick={() => handleSpecializationToggle(spec.value)}
                  >
                    {formData.specializations.includes(spec.value) && (
                      <Check className="mr-1 h-3 w-3" />
                    )}
                    {isAr ? spec.labelAr : spec.value}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="forma"
                onClick={nextStep}
                disabled={
                  !formData.bio ||
                  !formData.yearsExperience ||
                  formData.specializations.length === 0
                }
              >
                {t.common.continue}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Experience */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>{t.becomeTrainer.experience}</CardTitle>
            <CardDescription>
              {isAr ? 'كلمنا عن خلفيتك المهنية' : 'Tell us about your professional background'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>{isAr ? 'التفرّغ' : 'Availability'}</Label>
              <Select
                value={formData.availability}
                onValueChange={(value) =>
                  setFormData({ ...formData, availability: value })
                }
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">{isAr ? 'دوام كامل (+٤٠ ساعة/أسبوع)' : 'Full-time (40+ hours/week)'}</SelectItem>
                  <SelectItem value="part-time">{isAr ? 'دوام جزئي (٢٠-٤٠ ساعة/أسبوع)' : 'Part-time (20-40 hours/week)'}</SelectItem>
                  <SelectItem value="flexible">{isAr ? 'مرن (أقل من ٢٠ ساعة/أسبوع)' : 'Flexible (Less than 20 hours/week)'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{isAr ? 'اللغات' : 'Languages'}</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {([
                  { value: 'Arabic', labelAr: 'عربي' },
                  { value: 'English', labelAr: 'إنجليزي' },
                  { value: 'French', labelAr: 'فرنساوي' },
                  { value: 'German', labelAr: 'ألماني' },
                ] as const).map((lang) => (
                  <Badge
                    key={lang.value}
                    variant={formData.languages.includes(lang.value) ? 'forma' : 'outline'}
                    className="cursor-pointer"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        languages: formData.languages.includes(lang.value)
                          ? formData.languages.filter((l) => l !== lang.value)
                          : [...formData.languages, lang.value],
                      })
                    }
                  >
                    {formData.languages.includes(lang.value) && (
                      <Check className="mr-1 h-3 w-3" />
                    )}
                    {isAr ? lang.labelAr : lang.value}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>{isAr ? 'لينكات السوشيال ميديا (اختياري)' : 'Social Links (Optional)'}</Label>
              <div className="mt-2 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-24 text-sm text-muted-foreground">Instagram</span>
                  <Input
                    placeholder="@username"
                    value={formData.socialLinks.instagram}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: {
                          ...formData.socialLinks,
                          instagram: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-24 text-sm text-muted-foreground">YouTube</span>
                  <Input
                    placeholder={isAr ? 'لينك القناة' : 'Channel URL'}
                    value={formData.socialLinks.youtube}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: {
                          ...formData.socialLinks,
                          youtube: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-24 text-sm text-muted-foreground">{isAr ? 'موقع' : 'Website'}</span>
                  <Input
                    placeholder="https://..."
                    value={formData.socialLinks.website}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: {
                          ...formData.socialLinks,
                          website: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="forma" onClick={nextStep}>
                {t.common.continue}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Certifications */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>{t.becomeTrainer.certifications}</CardTitle>
            <CardDescription>
              {isAr ? 'اختار شهاداتك وارفع الإثبات' : 'Select your certifications and upload proof'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>{t.becomeTrainer.certifications}</Label>
              <p className="mb-3 text-sm text-muted-foreground">
                {isAr ? 'اختار كل الشهادات اللي عندك' : 'Select all certifications you hold'}
              </p>
              <div className="space-y-2">
                {certifications.map((cert) => (
                  <div
                    key={cert}
                    className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors ${
                      formData.certifications.includes(cert)
                        ? 'border-forma-teal bg-forma-teal/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleCertificationToggle(cert)}
                  >
                    <span>{cert}</span>
                    {formData.certifications.includes(cert) && (
                      <Check className="h-5 w-5 text-forma-teal" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>{isAr ? 'ارفع مستندات الشهادات' : 'Upload Certification Documents'}</Label>
              <p className="mb-3 text-sm text-muted-foreground">
                {isAr ? 'ارفع صور أو سكان من شهاداتك (PDF, JPG, PNG)' : 'Upload scans or photos of your certifications (PDF, JPG, PNG)'}
              </p>
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8">
                <Upload className="h-10 w-10 text-muted-foreground" />
                <p className="mt-4 text-sm font-medium">
                  {isAr ? 'اسحب الملفات هنا أو اضغط عشان تختار' : 'Drag and drop files here, or click to browse'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isAr ? 'أقصى حجم للملف: 10MB' : 'Max file size: 10MB'}
                </p>
                <Button variant="outline" className="mt-4">
                  {isAr ? 'اختار ملفات' : 'Select Files'}
                </Button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="forma"
                onClick={nextStep}
                disabled={formData.certifications.length === 0}
              >
                {t.common.continue}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Pricing */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>{isAr ? 'حدد أسعارك' : 'Set Your Rates'}</CardTitle>
            <CardDescription>
              {isAr ? 'حدد تسعيرك للخدمات المختلفة' : 'Define your pricing for different services'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                {isAr ? 'فورما بتاخد 15% رسوم منصة. إنت بتاخد 85% من كل الأرباح.' : 'Forma takes a 15% platform fee. You keep 85% of all earnings.'}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>{isAr ? 'سعر الساعة (جنيه)' : 'Hourly Rate (EGP)'}</Label>
                <div className="relative mt-1.5">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="250"
                    className="pl-9"
                    value={formData.hourlyRate}
                    onChange={(e) =>
                      setFormData({ ...formData, hourlyRate: e.target.value })
                    }
                  />
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {isAr ? 'لجلسات الفيديو الفردية' : 'For 1-on-1 video sessions'}
                </p>
              </div>

              <div>
                <Label>{isAr ? 'سعر الباقة الشهرية (جنيه)' : 'Monthly Plan Rate (EGP)'}</Label>
                <div className="relative mt-1.5">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="1500"
                    className="pl-9"
                    value={formData.monthlyRate}
                    onChange={(e) =>
                      setFormData({ ...formData, monthlyRate: e.target.value })
                    }
                  />
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {isAr ? 'لبرامج التدريب الشهرية الكاملة' : 'For full month coaching programs'}
                </p>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h4 className="font-medium">{isAr ? 'معاينة الأرباح' : 'Earnings Preview'}</h4>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">{isAr ? 'لكل جلسة (هتاخد)' : 'Per Session (You Earn)'}</p>
                  <p className="text-xl font-bold text-forma-teal">
                    {formData.hourlyRate
                      ? `${Math.round(Number(formData.hourlyRate) * 0.85)} ${isAr ? 'جنيه' : 'EGP'}`
                      : `- ${isAr ? 'جنيه' : 'EGP'}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{isAr ? 'في الشهر (هتاخد)' : 'Per Month (You Earn)'}</p>
                  <p className="text-xl font-bold text-forma-teal">
                    {formData.monthlyRate
                      ? `${Math.round(Number(formData.monthlyRate) * 0.85)} ${isAr ? 'جنيه' : 'EGP'}`
                      : `- ${isAr ? 'جنيه' : 'EGP'}`}
                  </p>
                </div>
              </div>
            </div>

            {submitError && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                {submitError}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                variant="forma"
                onClick={handleSubmit}
                disabled={!formData.hourlyRate || !formData.monthlyRate || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isAr ? 'جاري التقديم...' : 'Submitting...'}
                  </>
                ) : (
                  t.becomeTrainer.submit
                )}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
