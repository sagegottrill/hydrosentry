import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { HydroSentryLogo } from '@/components/HydroSentryLogo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { dashboardNavItems, isDashboardNavItemActive } from '@/lib/dashboardNav';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function DashboardSidebar({ collapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside
      className={cn(
        'z-30 flex h-screen flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-out',
        collapsed ? 'w-[4.25rem]' : 'w-60',
      )}
    >
      <div className="flex h-14 items-center justify-between px-3">
        {!collapsed && <HydroSentryLogo size="small" />}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted/80 hover:text-foreground"
        >
          <ChevronLeft
            className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')}
          />
        </Button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <div className="mb-4 px-2 pt-1">
          {!collapsed && (
            <p className="text-2xs font-normal uppercase tracking-wide text-muted-foreground/80">
              Navigation
            </p>
          )}
        </div>
        {dashboardNavItems.map((item) => {
          const active = isDashboardNavItemActive(location.pathname, location.search, item);
          const Icon = item.icon;
          const isGuild = item.id === 'field-report';

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.path)}
              className={cn(
                'group flex w-full items-center gap-3 rounded-md py-3 text-left text-sm font-normal transition-colors',
                collapsed ? 'justify-center px-0' : 'px-3',
                active
                  ? collapsed
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'bg-primary/[0.06] font-medium text-primary shadow-[inset_2px_0_0_0_hsl(var(--primary))]'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={cn(
                  'h-[1.125rem] w-[1.125rem] shrink-0',
                  active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                )}
                strokeWidth={1.75}
              />
              {!collapsed ? (
                <span className="flex min-w-0 items-center gap-2">
                  <span className="truncate">{item.label}</span>
                  {isGuild ? (
                    <span className="rounded border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide text-primary">
                      Guild
                    </span>
                  ) : null}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
