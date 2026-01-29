import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Droplets, 
  Sun, 
  Send, 
  Settings, 
  User, 
  ChevronLeft
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
    
    // Exact match for dispatcher and settings
    if (item.path === '/dispatcher' || item.path === '/settings') {
      return location.pathname === item.path;
    }
    
    // For wet/dry season links, check for query param
    if (item.path.includes('?season=')) {
      return currentPath === item.path;
    }
    
    // Overview is active when on /dashboard without season param
    if (item.path === '/dashboard') {
      return location.pathname === '/dashboard' && !location.search.includes('season=');
    }
    
    return false;
  };

  return (
    <aside 
      className={cn(
        "h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        {!collapsed && <HydroSentryLogo size="small" />}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <ChevronLeft className={cn(
            "h-4 w-4 transition-transform",
            collapsed && "rotate-180"
          )} />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                active 
                  ? "bg-sidebar-accent text-sidebar-primary" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={cn(
                "h-5 w-5 flex-shrink-0",
                active && item.id === 'wet-season' && "text-primary",
                active && item.id === 'dry-season' && "text-warning"
              )} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-3 border-t border-sidebar-border">
        <div className={cn(
          "flex items-center gap-3 px-2 py-2 rounded-md bg-sidebar-accent/50",
          collapsed && "justify-center"
        )}>
          <div className="h-8 w-8 rounded-full bg-sidebar-primary flex items-center justify-center">
            <User className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                Admin
              </p>
              <p className="text-xs text-muted-foreground truncate">
                BOSEPA Command
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
