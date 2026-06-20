import { cn } from '@/lib/utils';

interface KryonLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Show only the mark without the KRYON wordmark */
  markOnly?: boolean;
}

const config = {
  sm: {
    mark: 20,
    gap: 'gap-2.5',
    wordmark: 'text-[12px] tracking-[0.16em]',
  },
  md: {
    mark: 28,
    gap: 'gap-3',
    wordmark: 'text-[14px] tracking-[0.14em]',
  },
  lg: {
    mark: 36,
    gap: 'gap-3.5',
    wordmark: 'text-[17px] tracking-[0.12em]',
  },
} as const;

interface KryonMarkProps {
  size: number;
  className?: string;
}

/**
 * Brand mark from /face.png — scales cleanly from 20px to 120px via the `size` prop.
 */
export function KryonMark({ size, className }: KryonMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        'flex-shrink-0',
        'drop-shadow-[0_0_15px_rgba(34,211,238,0.25)]',
        className
      )}
      style={{ width: size, height: size }}
    >
      <defs>
        <linearGradient id="kryon-mark-grad-stem" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
        <linearGradient id="kryon-mark-grad-diagonal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
      </defs>
      {/* Vertical Stem */}
      <rect x="22" y="15" width="12" height="70" rx="6" fill="url(#kryon-mark-grad-stem)" />
      {/* Upper arm (slanted path) */}
      <path d="M 34 46 L 70 17 A 6 6 0 0 1 78 26 L 46 54 Z" fill="url(#kryon-mark-grad-diagonal)" />
      {/* Lower arm (slanted path) */}
      <path d="M 38 46 L 74 72 A 6 6 0 0 1 66 81 L 32 54 Z" fill="url(#kryon-mark-grad-diagonal)" />
      {/* Visual node highlight connection */}
      <circle cx="34" cy="50" r="4.5" fill="#ffffff" className="animate-pulse" />
    </svg>
  );
}

function KryonWordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'relative font-bold leading-none translate-y-px',
        'bg-gradient-to-b from-white via-white to-white/75 bg-clip-text text-transparent',
        className
      )}
    >
      KRYON
    </span>
  );
}

export function KryonLogo({ size = 'md', className, markOnly = false }: KryonLogoProps) {
  const { mark, gap, wordmark } = config[size];

  return (
    <div className={cn('inline-flex items-center select-none', gap, className)}>
      <KryonMark size={mark} />
      {!markOnly && <KryonWordmark className={wordmark} />}
    </div>
  );
}
