'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  iconOnly?: boolean;
}

export function Logo({ className, size = 'md', iconOnly = false }: LogoProps) {
  const iconSizes = {
    sm: 24,
    md: 28,
    lg: 36,
    xl: 48,
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const iconSize = iconSizes[size];

  return (
    <span className={cn('inline-flex items-center gap-2 font-bold tracking-tight', className)}>
      <Image
        src="/logo-64.png"
        alt="Forma"
        width={iconSize}
        height={iconSize}
        className="shrink-0 rounded-lg"
        unoptimized
      />
      {!iconOnly && (
        <span className={cn(textSizes[size])}>
          Forma<span className="text-muted-foreground font-normal text-[0.65em] ms-0.5">EG</span>
        </span>
      )}
    </span>
  );
}

export default Logo;
