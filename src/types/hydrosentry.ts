// Backend-ready type definitions for HydroSentry

export type Season = 'wet' | 'dry';

export type AlertPriority = 'critical' | 'warning' | 'info';

export type RiskLevel = 'high' | 'medium' | 'low';

export type BoreholeStatus = 'operational' | 'failure' | 'maintenance';

export type RouteStatus = 'verified' | 'unverified' | 'blocked';

// Risk zones for flood warnings
export interface RiskZone {
  id: string;
  name: string;
  type: 'flood' | 'waste' | 'overflow';
  coordinates: [number, number];
  severity: RiskLevel;
  season: Season;
  blockageType?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Borehole infrastructure for drought monitoring
export interface Borehole {
  id: string;
  name: string;
  location: string;
  coordinates: [number, number];
  status: BoreholeStatus;
  thirstIndex: number; // 0-10 scale
  crpdScore: number; // Conflict Risk Prediction score 0-10
  lastMaintenanceDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Priority alerts for action dispatcher
export interface Alert {
  id: string;
  priority: AlertPriority;
  title: string;
  description: string;
  location: string;
  recommendation: string;
  actionLabel: string;
  estimatedCost?: number;
  season: Season;
  zoneId?: string;
  boreholeId?: string;
  createdAt: string;
  resolvedAt?: string;
}

// Safe corridors / herder routes
export interface Route {
  id: string;
  name: string;
  coordinates: [number, number][];
  status: RouteStatus;
  type: 'herder' | 'evacuation' | 'supply';
  season: Season;
  createdAt?: string;
  updatedAt?: string;
}

// Dashboard metrics
export interface DashboardMetrics {
  floodRiskValue: {
    amount: number;
    currency: string;
    trend: number; // percentage change
  };
  boreholeFailures: {
    count: number;
    status: 'critical' | 'warning' | 'stable';
  };
  conflictProbability: {
    percentage: number;
    location: string;
    level: RiskLevel;
  };
  safeCorridors: {
    count: number;
    status: 'verified' | 'partial' | 'unverified';
  };
}

// Work order for dispatched actions
export interface WorkOrder {
  id: string;
  alertId: string;
  type: 'crew_dispatch' | 'technician_alert' | 'inspection';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  estimatedCost?: number;
  ministry: string;
  createdAt: string;
  completedAt?: string;
}

// User session (for future auth)
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'operator' | 'viewer';
  organization: string;
  createdAt: string;
}
