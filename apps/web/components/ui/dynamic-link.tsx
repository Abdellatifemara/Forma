'use client';

import React from 'react';

/**
 * A link component for dynamic routes on Cloudflare static export.
 *
 * Next.js <Link> does client-side navigation which breaks with _placeholder
 * static params (it resolves to _placeholder in the URL). This component
 * uses a regular <a> tag so the browser does a full page load, allowing
 * the Worker to serve the correct _placeholder HTML while the browser
 * URL shows the real path.
 *
 * Use this ONLY for dynamic routes like /trainers/:id, /workouts/:id, etc.
 * For static routes, keep using Next.js <Link> for faster navigation.
 */
export function DynamicLink({
  href,
  className,
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  );
}
