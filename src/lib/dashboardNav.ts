import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Droplets,
  Sun,
  Send,
  Settings,
  Radio,
  BarChart3,
  Bell,
  Users,
  Smartphone,
} from 'lucide-react';

export type DashboardNavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  description: string;
};

export const dashboardNavItems: DashboardNavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/dashboard', description: 'Main dashboard view' },
  { id: 'wet-season', label: 'Wet Season (Flood Shield)', icon: Droplets, path: '/dashboard?season=wet', description: 'Flood monitoring mode' },
  { id: 'dry-season', label: 'Dry Season (Conflict Engine)', icon: Sun, path: '/dashboard?season=dry', description: 'Drought & conflict mode' },
  { id: 'sensors', label: 'Sensor Network', icon: Radio, path: '/sensors', description: 'Live LoRaWAN node health' },
  { id: 'analytics', label: 'Water Level Analytics', icon: BarChart3, path: '/analytics', description: 'Hydrological data charts' },
  { id: 'alerts', label: 'Alert History', icon: Bell, path: '/alerts', description: 'Alert timeline & SMS log' },
  { id: 'wardens', label: 'Sensor Wardens', icon: Users, path: '/wardens', description: 'Youth employment program' },
  { id: 'field-report', label: 'Warden Mode', icon: Smartphone, path: '/field-report', description: 'Mobile field hardware reporting' },
  { id: 'dispatcher', label: 'Dispatcher', icon: Send, path: '/dispatcher', description: 'Work order management' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings', description: 'System configuration' },
];

export function isDashboardNavItemActive(
  pathname: string,
  search: string,
  item: DashboardNavItem,
): boolean {
  const currentPath = pathname + search;
  if (item.path.includes('?season=')) {
    return currentPath === item.path;
  }
  if (item.path === '/dashboard') {
    return pathname === '/dashboard' && !search.includes('season=');
  }
  return pathname === item.path;
}
