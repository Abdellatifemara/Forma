'use client';

import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text';
  theme?: 'light' | 'dark' | 'auto';
}

const sizes = {
  sm: { icon: 28, text: 'text-lg', stroke: 2 },
  md: { icon: 36, text: 'text-xl', stroke: 2.5 },
  lg: { icon: 44, text: 'text-2xl', stroke: 3 },
  xl: { icon: 56, text: 'text-4xl', stroke: 3.5 },
};

export function Logo({ className, size = 'md', variant = 'full', theme = 'auto' }: LogoProps) {
  const { icon: iconSize, text: textSize, stroke } = sizes[size];

  // Modern hexagonal F logo - outline style (not filled)
  const LogoIcon = () => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      <defs>
        <linearGradient id={`grad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00D4AA" />
          <stop offset="100%" stopColor="#00F5D4" />
        </linearGradient>
      </defs>

      {/* Hexagon outline - NOT filled */}
      <path
        d="M24 3L43 14V34L24 45L5 34V14L24 3Z"
        fill="none"
        stroke={`url(#grad-${size})`}
        strokeWidth={stroke}
        strokeLinejoin="round"
      />

      {/* F letter - clean strokes */}
      <path
        d="M16 14H32"
        stroke={`url(#grad-${size})`}
        strokeWidth={stroke}
        strokeLinecap="round"
      />
      <path
        d="M16 14V34"
        stroke={`url(#grad-${size})`}
        strokeWidth={stroke}
        strokeLinecap="round"
      />
      <path
        d="M16 24H28"
        stroke={`url(#grad-${size})`}
        strokeWidth={stroke}
        strokeLinecap="round"
      />

      {/* Accent elements */}
      <circle cx="35" cy="14" r="2.5" fill="#00D4AA" />
      <path
        d="M28 30L35 24"
        stroke="#00D4AA"
        strokeWidth={stroke * 0.8}
        strokeLinecap="round"
      />
    </svg>
  );

  const LogoText = () => (
    <span className={cn(
      'font-bold tracking-tight lowercase',
      textSize,
      theme === 'light' ? 'text-forma-navy' : theme === 'dark' ? 'text-white' : 'text-foreground'
    )}>
      forma
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

// For favicon - simplified version
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
        <linearGradient id="markGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00D4AA" />
          <stop offset="100%" stopColor="#00F5D4" />
        </linearGradient>
      </defs>
      <path
        d="M24 3L43 14V34L24 45L5 34V14L24 3Z"
        fill="none"
        stroke="url(#markGrad)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M16 14H32" stroke="url(#markGrad)" strokeWidth="3" strokeLinecap="round" />
      <path d="M16 14V34" stroke="url(#markGrad)" strokeWidth="3" strokeLinecap="round" />
      <path d="M16 24H28" stroke="url(#markGrad)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="35" cy="14" r="2.5" fill="#00D4AA" />
    </svg>
  );
}

export default Logo;
