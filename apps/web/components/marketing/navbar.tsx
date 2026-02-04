'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, ChevronRight, LayoutDashboard, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '#features', label: 'Features', labelAr: 'المميزات' },
  { href: '#pricing', label: 'Pricing', labelAr: 'الأسعار' },
  { href: '/blog', label: 'Blog', labelAr: 'المدونة' },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [lang, setLang] = useState<'en' | 'ar'>('en');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    // Check if user is logged in (has token cookie)
    const hasToken = document.cookie.includes('forma-token');
    setIsLoggedIn(hasToken);

    // Get saved language preference
    const savedLang = localStorage.getItem('forma-lang') as 'en' | 'ar' | null;
    if (savedLang) setLang(savedLang);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLang = () => {
    const newLang = lang === 'en' ? 'ar' : 'en';
    setLang(newLang);
    localStorage.setItem('forma-lang', newLang);
    // Update document direction
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  const t = {
    login: lang === 'ar' ? 'دخول' : 'Log in',
    getStarted: lang === 'ar' ? 'ابدأ مجاناً' : 'Get Started',
    dashboard: lang === 'ar' ? 'لوحة التحكم' : 'Dashboard',
    available: lang === 'ar' ? 'متوفر على iOS و Android و الويب' : 'Available on iOS, Android & Web',
  };

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-background/90 backdrop-blur-xl border-b'
          : 'bg-transparent'
      )}
    >
      <nav className="container flex h-16 items-center justify-between">
        <Link href="/" className="relative z-10">
          <Logo size="md" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {lang === 'ar' ? link.labelAr : link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex md:items-center md:gap-3">
          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Globe className="h-4 w-4" />
            {lang === 'ar' ? 'EN' : 'عربي'}
          </button>

          {isLoggedIn ? (
            <Button className="rounded-full bg-coral-500 text-white hover:bg-coral-600" asChild>
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                {t.dashboard}
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" className="font-medium" asChild>
                <Link href="/login">{t.login}</Link>
              </Button>
              <Button className="rounded-full bg-coral-500 text-white hover:bg-coral-600" asChild>
                <Link href="/signup">
                  {t.getStarted}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile: Language + Menu */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleLang}
            className="flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-medium transition-colors hover:bg-muted"
          >
            {lang === 'ar' ? 'EN' : 'ع'}
          </button>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-colors hover:bg-muted"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-background transition-all duration-300 md:hidden',
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        style={{ top: '64px' }}
      >
        <div className="container py-8">
          <div className="space-y-1">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between rounded-xl px-4 py-4 text-lg font-medium transition-all hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                {lang === 'ar' ? link.labelAr : link.label}
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            ))}
          </div>

          <div className="mt-8 space-y-3">
            {isLoggedIn ? (
              <Button
                size="lg"
                className="w-full rounded-xl h-12 bg-coral-500 text-white hover:bg-coral-600"
                asChild
              >
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  {t.dashboard}
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full rounded-xl h-12"
                  asChild
                >
                  <Link href="/login">{t.login}</Link>
                </Button>
                <Button
                  size="lg"
                  className="w-full rounded-xl h-12 bg-coral-500 text-white hover:bg-coral-600"
                  asChild
                >
                  <Link href="/signup">
                    {t.getStarted}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}
          </div>

          <div className="mt-8 pt-8 border-t">
            <p className="text-center text-sm text-muted-foreground">
              {t.available}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
