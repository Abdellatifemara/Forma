'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  iconOnly?: boolean;
}

export function Logo({ className, size = 'md', iconOnly = false }: LogoProps) {
  const iconSizes = {
    sm: 24,
    md: 28,
    lg: 36,
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const iconSize = iconSizes[size];

  return (
    <span className={cn('inline-flex items-center gap-2 font-bold tracking-tight', className)}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <path d="M60 40h392l-44 88H124v114h190l-44 88H124v172H60V40z" fill="currentColor"/>
        <path d="M388 40l64 0-44 88h-64l44-88z" fill="currentColor" opacity="0.6"/>
        <path d="M286 242l64 0-44 88h-64l44-88z" fill="currentColor" opacity="0.6"/>
      </svg>
      {!iconOnly && (
        <span className={cn(textSizes[size])}>
          Forma<span className="text-muted-foreground font-normal text-[0.65em] ml-0.5">EG</span>
        </span>
      )}
    </span>
  );
}

export default Logo;
