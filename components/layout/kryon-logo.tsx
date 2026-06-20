import { cn } from '@/lib/utils';

interface KryonLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  /** Show only the mark without the KRYON wordmark */
  markOnly?: boolean;
  onClick?: () => void;
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
  xl: {
    mark: 56,
    gap: 'gap-4.5',
    wordmark: 'text-[28px] tracking-[0.12em] font-extrabold',
  },
  '2xl': {
    mark: 72,
    gap: 'gap-5',
    wordmark: 'text-[36px] tracking-[0.12em] font-extrabold',
  },
} as const;

interface KryonMarkProps {
  size: number;
  className?: string;
}

/**
 * Brand mark using face.png — scales cleanly from 20px to 120px via the `size` prop.
 */
export function KryonMark({ size, className }: KryonMarkProps) {
  return (
    <img
      src="/face.png"
      alt="Kryon Logo"
      width={size}
      height={size}
      className={cn('flex-shrink-0 object-contain rounded-md select-none', className)}
      style={{ width: size, height: size }}
    />
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

export function KryonLogo({ size = 'md', className, markOnly = false, onClick }: KryonLogoProps) {
  const { mark, gap, wordmark } = config[size];

  return (
    <div className={cn('inline-flex items-center select-none', gap, className)} onClick={onClick}>
      <KryonMark size={mark} />
      {!markOnly && <KryonWordmark className={wordmark} />}
    </div>
  );
}
