'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Mail,
  MessageCircle,
  HelpCircle,
  BookOpen,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';

const faqs = [
  {
    question: 'How do I create a workout plan?',
    questionAr: 'إزاي أعمل برنامج تمرين؟',
    answer: 'Go to Workouts → Create Plan, add exercises, set your schedule, and save your custom plan. You can also use "What Now?" to get a personalized recommendation.',
    answerAr: 'روح على التمارين ← إنشاء برنامج، ضيف التمارين، حدد مواعيدك، واحفظ البرنامج. كمان ممكن تستخدم "إيه اللي هعمله دلوقتي؟" وهيرشحلك البرنامج المناسب ليك.',
  },
  {
    question: 'How do I track my nutrition?',
    questionAr: 'إزاي أتابع أكلي وتغذيتي؟',
    answer: 'Navigate to Nutrition, search for Egyptian and international foods, and log your meals. The app tracks calories, protein, carbs, and fats automatically.',
    answerAr: 'روح على التغذية، ابحث عن الأكل المصري والأجنبي، وسجل وجباتك. التطبيق بيحسب السعرات والبروتين والكارب والدهون تلقائيًا.',
  },
  {
    question: 'How do I log my weight and progress?',
    questionAr: 'إزاي أسجل وزني ومتابعة تقدمي؟',
    answer: 'Go to Progress → Log Weight to record your current weight. You can also take progress photos and view your trends over time.',
    answerAr: 'روح على التقدم ← تسجيل الوزن وسجل وزنك الحالي. كمان ممكن تاخد صور للتقدم وتشوف مؤشراتك على مدار الوقت.',
  },
  {
    question: 'How do I find exercises for a specific muscle?',
    questionAr: 'إزاي ألاقي تمارين لعضلة معينة؟',
    answer: 'Go to Exercises and use the filters to select your target muscle group, equipment, and difficulty level.',
    answerAr: 'روح على التمارين واستخدم الفلاتر تحدد العضلة المستهدفة والمعدات ومستوى الصعوبة.',
  },
  {
    question: 'How does the "What Now?" feature work?',
    questionAr: 'خاصية "إيه اللي هعمله دلوقتي؟" بتشتغل إزاي؟',
    answer: 'Tell it your available time, energy level, and location (gym/home/outdoor), and it will suggest the perfect workout for your situation.',
    answerAr: 'قوله الوقت المتاح عندك ومستوى طاقتك ومكانك (جيم / بيت / برا)، وهو هيرشحلك التمرين المثالي لظروفك.',
  },
  {
    question: 'How do Fitness Tests work?',
    questionAr: 'اختبارات اللياقة بتشتغل إزاي؟',
    answer: 'Fitness Tests measure your actual capabilities (push-ups, plank hold, pull-ups) so the app can personalize your workouts to your real level, not just what you say.',
    answerAr: 'اختبارات اللياقة بتقيس قدراتك الحقيقية (بوش أب، بلانك، عقلة) عشان التطبيق يخصصلك التمرين على مستواك الفعلي، مش اللي إنت بتقوله.',
  },
  {
    question: 'How do I connect with a trainer?',
    questionAr: 'إزاي أتواصل مع مدرب؟',
    answer: 'Visit the Trainers marketplace to browse certified trainers. You can view their specialties, ratings, and book sessions directly.',
    answerAr: 'روح على سوق المدربين وتصفح المدربين المعتمدين. ممكن تشوف تخصصاتهم وتقييماتهم وتحجز جلسة مباشرة.',
  },
  {
    question: 'How do I become a trainer on Forma?',
    questionAr: 'إزاي أبقى مدرب على Forma؟',
    answer: 'Go to Settings → Become a Trainer, fill out your qualifications, upload certifications, and submit your application for review.',
    answerAr: 'روح على الإعدادات ← انضم كمدرب، املا مؤهلاتك، ارفع شهاداتك، وابعت الطلب للمراجعة.',
  },
  {
    question: 'What are the subscription tiers?',
    questionAr: 'إيه هي باقات الاشتراك؟',
    answer: 'Premium (299 LE/mo) includes AI coaching, personalized recommendations, and full app access. Premium Plus (999 LE/mo) adds personal owner review, white-glove coaching, and health stats.',
    answerAr: 'بريميوم (299 جنيه/شهر) فيها مدرب AI وتوصيات مخصصة ووصول كامل للتطبيق. بريميوم بلس (999 جنيه/شهر) فيها مراجعة شخصية من المالك وتدريب متكامل وإحصائيات صحية.',
  },
  {
    question: 'How do I change my language?',
    questionAr: 'إزاي أغير اللغة؟',
    answer: 'Go to Settings and select your preferred language. Forma supports both English and Arabic.',
    answerAr: 'روح على الإعدادات واختار اللغة اللي تحبها. Forma بتدعم العربي والإنجليزي.',
  },
  {
    question: 'Is my chat private?',
    questionAr: 'محادثاتي سرية؟',
    answer: 'Yes, all messages are end-to-end encrypted. Only you and your conversation partner can read them.',
    answerAr: 'أيوه، كل الرسايل مشفرة من طرف لطرف. بس انت والشخص التاني اللي بتكلمه تقدروا تقراوها.',
  },
];

export default function HelpPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <div className="container max-w-4xl py-8 space-y-8" dir={isAr ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold">
          {isAr ? 'المساعدة والدعم' : 'Help & Support'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isAr
            ? 'لاقي إجابات للأسئلة الشائعة أو تواصل مع فريقنا'
            : 'Find answers to common questions or get in touch with our team'}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:border-primary transition-colors">
          <CardContent className="pt-6 text-center">
            <MessageCircle className="h-10 w-10 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold">
              {isAr ? 'دردشة مباشرة' : 'Live Chat'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {isAr ? 'تكلم فريق الدعم' : 'Chat with support'}
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors">
          <CardContent className="pt-6 text-center">
            <Mail className="h-10 w-10 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold">
              {isAr ? 'ابعتلنا إيميل' : 'Email Us'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">support@formaeg.com</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors">
          <CardContent className="pt-6 text-center">
            <BookOpen className="h-10 w-10 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold">
              {isAr ? 'الأدلة والشروحات' : 'Guides'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {isAr ? 'اتعلم إزاي تستخدم Forma' : 'Learn how to use Forma'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            {isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
              <h4 className="font-medium flex items-center gap-2">
                <ChevronRight className={`h-4 w-4 text-primary flex-shrink-0 ${isAr ? 'rotate-180' : ''}`} />
                {isAr ? faq.questionAr : faq.question}
              </h4>
              <p className="text-sm text-muted-foreground mt-1 ms-6">
                {isAr ? faq.answerAr : faq.answer}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="text-center">
        <p className="text-muted-foreground mb-4">
          {isAr ? 'مش لاقي اللي بتدور عليه؟' : "Can't find what you're looking for?"}
        </p>
        <Link href="/dashboard">
          <Button>{isAr ? 'الرجوع للرئيسية' : 'Back to Dashboard'}</Button>
        </Link>
      </div>
    </div>
  );
}
