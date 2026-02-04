'use client';

import Link from 'next/link';
import { Facebook, Instagram, Twitter, Youtube, Mail, MapPin } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

const footerLinks = {
  product: [
    { href: '#features', label: 'Features' },
    { href: '#pricing', label: 'Pricing' },
    { href: '/blog', label: 'Blog' },
  ],
  company: [
    { href: '/contact', label: 'Contact' },
    { href: '#trainers', label: 'For Trainers' },
  ],
  legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
    { href: '/cookies', label: 'Cookie Policy' },
  ],
};

const socialLinks = [
  { href: 'https://facebook.com/formaeg', icon: Facebook, label: 'Facebook' },
  { href: 'https://instagram.com/formaeg', icon: Instagram, label: 'Instagram' },
  { href: 'https://twitter.com/formaeg', icon: Twitter, label: 'Twitter' },
  { href: 'https://youtube.com/@formaeg', icon: Youtube, label: 'YouTube' },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-forma-navy">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute bottom-0 left-1/4 h-[300px] w-[300px] rounded-full bg-forma-teal/10 blur-[100px]" />
        <div className="absolute top-0 right-1/4 h-[200px] w-[200px] rounded-full bg-purple-500/10 blur-[80px]" />
      </div>

      <div className="container py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Logo size="lg" theme="dark" />
            <p className="mt-4 max-w-xs text-sm text-gray-400 leading-relaxed">
              The AI-powered fitness platform built for the Middle East. Transform your body with personalized workouts and smart nutrition.
            </p>
            <div className="mt-6 flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-gray-400 transition-all hover:bg-forma-teal/20 hover:text-forma-teal"
                >
                  <social.icon className="h-5 w-5" />
                  <span className="sr-only">{social.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Product</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-forma-teal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Company</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-forma-teal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Contact</h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="h-4 w-4 text-forma-teal" />
                hello@forma.fitness
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="h-4 w-4 text-forma-teal" />
                Cairo, Egypt
              </li>
            </ul>

            {/* App Store Badges Placeholder */}
            <div className="mt-6 flex gap-3">
              <div className="flex h-10 items-center gap-2 rounded-lg bg-white/5 px-4 text-xs text-gray-400">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                iOS
              </div>
              <div className="flex h-10 items-center gap-2 rounded-lg bg-white/5 px-4 text-xs text-gray-400">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                </svg>
                Android
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Forma. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-500 transition-colors hover:text-forma-teal"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
