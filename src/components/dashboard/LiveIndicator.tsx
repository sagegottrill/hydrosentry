import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface LiveIndicatorProps {
  /** When true, shows a subtle pulse (e.g. while refetching). */
  pulsing?: boolean;
  className?: string;
  children: ReactNode;
}

export function LiveIndicator({ pulsing = true, className, children }: LiveIndicatorProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border border-border/80 bg-card px-2.5 py-1 text-[0.8125rem] font-medium text-muted-foreground',
        className,
      )}
    >
      <span className="relative flex h-2.5 w-2.5" aria-hidden>
        {pulsing ? (
          <>
            <span className="absolute inline-flex h-full w-full animate-ping-slow rounded-full bg-primary/30 motion-reduce:animate-none" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_1px_hsl(var(--card))] motion-reduce:animate-none animate-live-dot-breathe" />
          </>
        ) : (
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
        )}
      </span>
      {children}
    </div>
  );
}
