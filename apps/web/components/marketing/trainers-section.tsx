'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Award, Shield, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';

const benefits = [
  {
    icon: Users,
    title: 'Reach More Clients',
    titleAr: 'وصّل لعملاء أكتر',
    description: 'Access thousands of fitness enthusiasts across Egypt looking for professional guidance.',
    descriptionAr: 'وصّل لآلاف عشاق اللياقة في مصر اللي بيدوروا على توجيه احترافي.',
  },
  {
    icon: Shield,
    title: 'Verified Credentials',
    titleAr: 'شهادات موثقة',
    description: 'Stand out with our certification verification. Build trust with verified badges.',
    descriptionAr: 'اتميز بتوثيق شهاداتك. ابني ثقة مع شارات التحقق.',
  },
  {
    icon: TrendingUp,
    title: 'Grow Your Business',
    titleAr: 'كبّر شغلك',
    description: 'Use our tools to manage clients, track progress, and scale your coaching practice.',
    descriptionAr: 'استخدم أدواتنا لإدارة العملاء وتتبع التقدم وتكبير ممارستك التدريبية.',
  },
  {
    icon: Award,
    title: 'Competitive Commission',
    titleAr: 'عمولة تنافسية',
    description: 'Keep 85% of your earnings. No hidden fees, no surprises. Get paid weekly.',
    descriptionAr: 'خد 85% من أرباحك. مفيش رسوم مخفية. الدفع أسبوعياً.',
  },
];

export function TrainersSection() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <section id="trainers" className="py-20 md:py-32">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              {isAr ? (
                <>أنت <span className="text-forma-orange">مدرب لياقة</span> محترف؟</>
              ) : (
                <>Are you a{' '}<span className="text-forma-orange">fitness professional</span>?</>
              )}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {isAr
                ? 'انضم لمجتمع المدربين المعتمدين في مصر. ابني شغلك في التدريب أونلاين مع أدوات فورما القوية ووصّل لعملاء في كل مكان.'
                : "Join Egypt's growing community of certified trainers. Build your online coaching business with Forma's powerful tools and reach clients nationwide."}
            </p>
          </motion.div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                className="flex gap-4 rounded-xl border bg-card p-5"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="shrink-0 rounded-lg bg-forma-orange/10 p-2.5 text-forma-orange h-fit">
                  <benefit.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">{isAr ? benefit.titleAr : benefit.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {isAr ? benefit.descriptionAr : benefit.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button variant="forma" size="lg" asChild>
              <Link href="/trainer/apply">
                {isAr ? 'قدم كمدرب' : 'Apply as a Trainer'}
                <ArrowRight className="ms-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
