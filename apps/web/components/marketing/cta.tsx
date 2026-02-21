'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';

export function CTA() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <section className="py-20 md:py-32">
      <div className="container">
        <motion.div
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-forma-orange to-forma-orange-dark p-8 sm:p-12 md:p-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.15),transparent)]" />
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-forma-navy sm:text-3xl md:text-4xl lg:text-5xl">
              {isAr ? 'جاهز تغير رحلتك الرياضية؟' : 'Ready to transform your fitness journey?'}
            </h2>
            <p className="mt-6 text-lg text-forma-navy/80">
              {isAr
                ? 'ابدأ تحولك الرياضي مع فورما. أول أسبوع عليناا.'
                : 'Start your fitness transformation with Forma. Your first week is on us.'}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="xl"
                className="bg-forma-navy text-white hover:bg-forma-navy-light"
                asChild
              >
                <Link href="/signup">
                  {isAr ? 'ابدأ تجربتك المجانية' : 'Start Your Free Trial'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="xl"
                variant="outline"
                className="border-forma-navy/30 text-forma-navy hover:bg-forma-navy/10"
                asChild
              >
                <Link href="/demo">{isAr ? 'شاهد العرض' : 'View Demo'}</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
