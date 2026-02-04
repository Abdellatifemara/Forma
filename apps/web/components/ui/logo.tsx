'use client';

import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text';
  theme?: 'light' | 'dark' | 'auto';
}

const sizes = {
  sm: { icon: 24, text: 'text-lg' },
  md: { icon: 32, text: 'text-xl' },
  lg: { icon: 40, text: 'text-2xl' },
  xl: { icon: 56, text: 'text-4xl' },
};

export function Logo({ className, size = 'md', variant = 'full', theme = 'auto' }: LogoProps) {
  const { icon: iconSize, text: textSize } = sizes[size];

  const LogoIcon = () => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      {/* Background Circle with Gradient */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00D4AA" />
          <stop offset="50%" stopColor="#00E5BE" />
          <stop offset="100%" stopColor="#00F5D4" />
        </linearGradient>
        <linearGradient id="logoGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00B894" />
          <stop offset="100%" stopColor="#00D4AA" />
        </linearGradient>
      </defs>

      {/* Main Shape - Abstract F formed by fitness elements */}
      <rect width="48" height="48" rx="12" fill="url(#logoGradient)" />

      {/* Stylized "F" made of geometric shapes representing strength */}
      {/* Top horizontal bar */}
      <rect x="12" y="10" width="24" height="5" rx="2.5" fill="white" />

      {/* Middle horizontal bar (shorter) */}
      <rect x="12" y="21" width="18" height="5" rx="2.5" fill="white" />

      {/* Vertical bar */}
      <rect x="12" y="10" width="5" height="28" rx="2.5" fill="white" />

      {/* Dynamic accent - represents upward movement/progress */}
      <path
        d="M30 28L36 22L36 34L30 28Z"
        fill="white"
        fillOpacity="0.9"
      />

      {/* Small dot accent - represents a goal/target */}
      <circle cx="36" cy="14" r="3" fill="white" fillOpacity="0.7" />
    </svg>
  );

  const LogoText = () => (
    <span className={cn(
      'font-bold tracking-tight',
      textSize,
      theme === 'light' ? 'text-forma-navy' : theme === 'dark' ? 'text-white' : 'text-foreground'
    )}>
      Forma
    </span>
  );

  if (variant === 'icon') {
    return <LogoIcon />;
  }

  if (variant === 'text') {
    return <LogoText />;
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <LogoIcon />
      <LogoText />
    </div>
  );
}

// Simplified icon for favicon/small sizes
export function LogoMark({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoMarkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00D4AA" />
          <stop offset="100%" stopColor="#00F5D4" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#logoMarkGradient)" />
      <rect x="12" y="10" width="24" height="5" rx="2.5" fill="white" />
      <rect x="12" y="21" width="18" height="5" rx="2.5" fill="white" />
      <rect x="12" y="10" width="5" height="28" rx="2.5" fill="white" />
      <path d="M30 28L36 22L36 34L30 28Z" fill="white" fillOpacity="0.9" />
      <circle cx="36" cy="14" r="3" fill="white" fillOpacity="0.7" />
    </svg>
  );
}

export default Logo;
