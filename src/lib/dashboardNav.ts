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
  Shield,
  UserCog,
  HeartPulse,
  Building2,
  ClipboardList,
  Stethoscope,
  FolderHeart,
  RefreshCw,
  ShieldCheck,
  Activity,
  FileSearch,
  Network,
} from 'lucide-react';

export type DashboardNavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  description: string;
};

/** HydroSentry (GIS + telemetry) navigation. */
export const hydroSentryNavItems: DashboardNavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/dashboard', description: 'Main dashboard view' },
  { id: 'wet-season', label: 'Wet Season (Flood Shield)', icon: Droplets, path: '/dashboard?season=wet', description: 'Flood monitoring mode' },
  { id: 'dry-season', label: 'Dry Season (Conflict Engine)', icon: Sun, path: '/dashboard?season=dry', description: 'Drought & conflict mode' },
  { id: 'sensors', label: 'Sensor Network', icon: Radio, path: '/sensors', description: 'Live LoRaWAN node health' },
  { id: 'analytics', label: 'Water Level Analytics', icon: BarChart3, path: '/analytics', description: 'Hydrological data charts' },
  { id: 'alerts', label: 'Alert History', icon: Bell, path: '/alerts', description: 'Alert timeline & SMS log' },
  { id: 'wardens', label: 'Sensor Wardens', icon: Users, path: '/wardens', description: 'Youth employment program' },
  { id: 'field-report', label: 'Warden Mode', icon: Shield, path: '/field-report', description: 'Guild field reporting' },
  { id: 'team', label: 'Team Settings', icon: UserCog, path: '/team', description: 'Manage SMS recipients' },
  { id: 'dispatcher', label: 'Dispatcher', icon: Send, path: '/dispatcher', description: 'Work order management' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings', description: 'System configuration' },
];

/** OpenMed Lite (clinical) navigation. */
export const openMedLiteNavItems: DashboardNavItem[] = [
  { id: 'patient-registry', label: 'Patient Registry', icon: FolderHeart, path: '/openmed', description: 'Patient registry (demo)' },
  { id: 'triage-console', label: 'Triage Console', icon: Stethoscope, path: '/openmed?tab=triage', description: 'Triage console (demo)' },
  { id: 'conflict-desk', label: 'Conflict Resolution Desk', icon: HeartPulse, path: '/openmed?tab=conflicts', description: 'Resolve CRDT conflicts' },
  { id: 'sync-logs', label: 'Sync Logs', icon: RefreshCw, path: '/openmed?tab=sync', description: 'Replication & sync audit' },
];

/** Admin Core (B2G clearance) navigation. */
export const adminCoreNavItems: DashboardNavItem[] = [
  { id: 'clearance-queue', label: 'Clearance Queue', icon: Building2, path: '/admin-core', description: 'Pending clearance requests' },
  { id: 'rbac-audit', label: 'RBAC Audit Logs', icon: FileSearch, path: '/admin-core?tab=rbac', description: 'Role & policy audit trail' },
  { id: 'tenant-access', label: 'Tenant Access', icon: Network, path: '/admin-core?tab=tenant', description: 'Tenant isolation & access' },
  { id: 'system-health', label: 'System Health', icon: Activity, path: '/admin-core?tab=health', description: 'Platform status' },
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
