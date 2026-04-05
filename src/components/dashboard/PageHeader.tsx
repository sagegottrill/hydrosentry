import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  className?: string;
  /** Tight bar for viewport-locked overview (fits with KPI grid). */
  variant?: 'default' | 'compact';
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  className,
  variant = 'default',
}: PageHeaderProps) {
  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex shrink-0 flex-col gap-1.5 border-b border-border/50 pb-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:pb-3',
          className,
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          {Icon ? (
            <Icon className="h-[1.125rem] w-[1.125rem] shrink-0 text-primary sm:h-5 sm:w-5" strokeWidth={1.5} aria-hidden />
          ) : null}
          <h1 className="truncate text-sm font-semibold tracking-tight text-foreground sm:text-base">
            {title}
          </h1>
        </div>
        <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:gap-3">
          {description ? (
            <p className="line-clamp-2 text-[0.8125rem] leading-snug text-muted-foreground sm:line-clamp-1 sm:max-w-xl sm:text-right">
              {description}
            </p>
          ) : null}
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-4 border-b border-border/40 pb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-6 md:pb-8',
        className,
      )}
    >
      <div className="min-w-0 space-y-1.5">
        <h1 className="flex items-center gap-2.5 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {Icon ? (
            <Icon className="h-6 w-6 shrink-0 text-primary" strokeWidth={1.5} aria-hidden />
          ) : null}
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm font-normal leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
