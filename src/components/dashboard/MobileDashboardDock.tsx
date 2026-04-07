import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Radio, Bell, Smartphone, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { path: '/dashboard', label: 'Home', icon: LayoutDashboard, match: (pathname: string) => pathname === '/dashboard' },
  { path: '/sensors', label: 'Sensors', icon: Radio, match: (pathname: string) => pathname === '/sensors' },
  { path: '/alerts', label: 'Alerts', icon: Bell, match: (pathname: string) => pathname === '/alerts' },
  {
    path: '/field-report',
    label: 'Field',
    icon: Smartphone,
    match: (pathname: string) => pathname === '/field-report',
  },
] as const;

interface MobileDashboardDockProps {
  onOpenMenu: () => void;
}

export function MobileDashboardDock({ onOpenMenu }: MobileDashboardDockProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-border/80 bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/85 md:hidden"
      aria-label="Primary mobile navigation"
    >
      <div className="flex w-full max-w-[100vw] pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1">
        {items.map(({ path, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              className={cn(
                'flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium transition-colors',
                active ? 'text-primary' : 'text-muted-foreground active:bg-muted/50',
              )}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2.25 : 1.75} aria-hidden />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium text-muted-foreground active:bg-muted/50"
        >
          <Menu className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
          <span>More</span>
        </button>
      </div>
    </nav>
  );
}
