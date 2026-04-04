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
      <span className="relative flex h-2 w-2" aria-hidden>
        {pulsing ? (
          <>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/35" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </>
        ) : (
          <span className="relative inline-flex h-2 w-2 rounded-full bg-muted-foreground/35" />
        )}
      </span>
      {children}
    </div>
  );
}
