import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Droplets,
  Sun,
  Send,
  Settings,
  User,
  ChevronLeft,
  Radio,
  BarChart3,
  Bell,
  Users,
  Smartphone,
} from 'lucide-react';
import { HydroSentryLogo } from '@/components/HydroSentryLogo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    path: '/dashboard',
    description: 'Main dashboard view'
  },
  {
    id: 'wet-season',
    label: 'Wet Season (Flood Shield)',
    icon: Droplets,
    path: '/dashboard?season=wet',
    description: 'Flood monitoring mode'
  },
  {
    id: 'dry-season',
    label: 'Dry Season (Conflict Engine)',
    icon: Sun,
    path: '/dashboard?season=dry',
    description: 'Drought & conflict mode'
  },
  {
    id: 'sensors',
    label: 'Sensor Network',
    icon: Radio,
    path: '/sensors',
    description: 'Live LoRaWAN node health'
  },
  {
    id: 'analytics',
    label: 'Water Level Analytics',
    icon: BarChart3,
    path: '/analytics',
    description: 'Hydrological data charts'
  },
  {
    id: 'alerts',
    label: 'Alert History',
    icon: Bell,
    path: '/alerts',
    description: 'Alert timeline & SMS log'
  },
  {
    id: 'wardens',
    label: 'Sensor Wardens',
    icon: Users,
    path: '/wardens',
    description: 'Youth employment program'
  },
  {
    id: 'field-report',
    label: 'Warden Mode',
    icon: Smartphone,
    path: '/field-report',
    description: 'Mobile field hardware reporting'
  },
  {
    id: 'dispatcher',
    label: 'Dispatcher',
    icon: Send,
    path: '/dispatcher',
    description: 'Work order management'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/settings',
    description: 'System configuration'
  },
];

export function DashboardSidebar({ collapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (item: typeof navItems[0]) => {
    const currentPath = location.pathname + location.search;

    // For wet/dry season links, check for query param
    if (item.path.includes('?season=')) {
      return currentPath === item.path;
    }

    // Overview is active when on /dashboard without season param
    if (item.path === '/dashboard') {
      return location.pathname === '/dashboard' && !location.search.includes('season=');
    }

    // Exact pathname match for all other routes
    return location.pathname === item.path;
  };

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
          <ChevronLeft className={cn(
            "h-4 w-4 transition-transform",
            collapsed && "rotate-180"
          )} />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <div className="mb-4 px-2 pt-1">
          {!collapsed && (
            <p className="text-2xs font-normal uppercase tracking-wide text-muted-foreground/80">Navigation</p>
          )}
        </div>
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;

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
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
