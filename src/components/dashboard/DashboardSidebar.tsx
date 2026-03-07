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
  Users
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
        "h-screen bg-white flex flex-col transition-all duration-300 shadow-sm z-30",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="h-16 px-4 flex items-center justify-between">
        {!collapsed && <HydroSentryLogo size="small" />}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8 text-slate-500 hover:bg-slate-200 hover:text-slate-700 rounded-lg"
        >
          <ChevronLeft className={cn(
            "h-4 w-4 transition-transform",
            collapsed && "rotate-180"
          )} />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="mb-4 px-2">
          {!collapsed && <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Command Center</p>}
        </div>
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group",
                active
                  ? "bg-[#005587]/10 text-[#005587] shadow-sm ring-1 ring-[#005587]/20"
                  : "text-slate-500 hover:bg-slate-200 hover:text-slate-900"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={cn(
                "h-5 w-5 flex-shrink-0 transition-colors",
                active ? "text-[#005587]" : "text-slate-400 group-hover:text-slate-600"
              )} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
