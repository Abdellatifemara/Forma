'use client';

import Link from 'next/link';
import { Instagram, Twitter, Facebook } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const social = [
  { href: 'https://instagram.com/formaeg', icon: Instagram, label: 'Instagram' },
  { href: 'https://twitter.com/formaeg', icon: Twitter, label: 'Twitter' },
  { href: 'https://facebook.com/formaeg', icon: Facebook, label: 'Facebook' },
];

export function Footer() {
  const { t, isRTL } = useLanguage();

  const links = {
    product: [
      { href: '#features', label: t.nav.features },
      { href: '#pricing', label: t.nav.pricing },
    ],
    company: [
      { href: '/contact', label: t.footer.contact },
      { href: '/blog', label: t.footer.blog },
    ],
    legal: [
      { href: '/privacy', label: t.footer.privacy },
      { href: '/terms', label: t.footer.terms },
    ],
  };

  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className={cn(
          'grid gap-8 sm:grid-cols-2 lg:grid-cols-4',
          isRTL && 'text-right'
        )}>
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="text-xl font-bold">
              forma
            </Link>
            <p className={cn('mt-3 text-sm text-muted-foreground max-w-xs', isRTL && 'font-cairo')}>
              {t.footer.tagline}
            </p>
            <div className={cn('mt-4 flex gap-3', isRTL && 'flex-row-reverse justify-end')}>
              {social.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-coral-500 hover:text-white"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className={cn('font-semibold mb-3', isRTL && 'font-cairo')}>
              {t.footer.product}
            </h4>
            <ul className="space-y-2">
              {links.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn('text-sm text-muted-foreground hover:text-foreground', isRTL && 'font-cairo')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className={cn('font-semibold mb-3', isRTL && 'font-cairo')}>
              {t.footer.company}
            </h4>
            <ul className="space-y-2">
              {links.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn('text-sm text-muted-foreground hover:text-foreground', isRTL && 'font-cairo')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className={cn('font-semibold mb-3', isRTL && 'font-cairo')}>
              {t.footer.legal}
            </h4>
            <ul className="space-y-2">
              {links.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn('text-sm text-muted-foreground hover:text-foreground', isRTL && 'font-cairo')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={cn(
          'mt-12 border-t pt-6 text-center text-sm text-muted-foreground',
          isRTL && 'font-cairo'
        )}>
          © {new Date().getFullYear()} Forma. {t.footer.copyright}
        </div>
      </div>
    </footer>
  );
}
