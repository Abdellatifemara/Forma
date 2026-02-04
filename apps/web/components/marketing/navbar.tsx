'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#trainers', label: 'For Trainers' },
  { href: '/blog', label: 'Blog' },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-background/80 backdrop-blur-xl border-b shadow-sm'
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
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-forma-teal transition-all group-hover:w-full" />
            </Link>
          ))}
        </div>

        <div className="hidden md:flex md:items-center md:gap-3">
          <Button variant="ghost" className="font-medium" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button className="btn-premium" asChild>
            <Link href="/signup">
              Get Started
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className={cn(
            'relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors md:hidden',
            scrolled ? 'bg-muted hover:bg-muted/80' : 'bg-white/10 hover:bg-white/20'
          )}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="sr-only">Open main menu</span>
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-background/95 backdrop-blur-xl transition-all duration-300 md:hidden',
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
                className={cn(
                  'flex items-center justify-between rounded-2xl px-4 py-4 text-lg font-medium transition-all hover:bg-muted',
                  mobileMenuOpen && 'animate-fade-up'
                )}
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            ))}
          </div>

          <div className="mt-8 space-y-3">
            <Button
              variant="outline"
              size="lg"
              className="w-full justify-center rounded-xl h-12"
              asChild
            >
              <Link href="/login">Log in</Link>
            </Button>
            <Button
              size="lg"
              className="btn-premium w-full justify-center rounded-xl h-12"
              asChild
            >
              <Link href="/signup">
                Get Started Free
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-8 pt-8 border-t">
            <p className="text-center text-sm text-muted-foreground">
              Available on iOS, Android & Web
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
