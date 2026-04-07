// Backend-ready type definitions for HydroSentry

export type Season = 'wet' | 'dry';

export type AlertPriority = 'critical' | 'warning' | 'info';

export type RiskLevel = 'high' | 'medium' | 'low';

export type BoreholeStatus = 'operational' | 'failure' | 'maintenance';

export type RouteStatus = 'verified' | 'unverified' | 'blocked';

/** Single-cell LiFePO₄ reference voltages (field audit envelope). */
export const LIFePO4_CELL_DEAD_V = 3.0;
export const LIFePO4_CELL_NOMINAL_V = 3.2;
export const LIFePO4_CELL_FULL_V = 3.65;

/** Deployed edge stack (Borno field hardware). */
export const EDGE_HARDWARE_SPEC = {
  mcuFamily: 'ESP32',
  ultrasonicModel: 'JSN-SR04T',
  batteryChemistry: 'LiFePO₄',
  cellNominalVoltageV: LIFePO4_CELL_NOMINAL_V,
  cellFullVoltageV: LIFePO4_CELL_FULL_V,
  cellDeadVoltageV: LIFePO4_CELL_DEAD_V,
} as const;

/** ESP32 uplink + power state from the field. */
export type NodeStatus = 'online' | 'offline' | 'low_battery';

/**
 * Minimal telemetry snapshot aligned with ESP32 + JSN-SR04T + battery ADC.
 * `water_level_cm` is the primary JSN-SR04T output (cm); use `0` when the node has no ultrasonic channel.
 */
export interface SensorTelemetrySnapshot {
  water_level_cm: number;
  battery_voltage: number;
  node_status: NodeStatus;
}

export type SensorHardwareType = 'water_level' | 'rain_gauge' | 'flow_meter';

/**
 * LoRaWAN / mesh sensor node (ESP32-class), including ultrasonic water depth and LiFePO₄ voltage.
 * For `water_level` nodes, thresholds are in **cm** (JSN-SR04T). Rain / flow types keep legacy units in `readingUnit`.
 */
export interface SensorNode {
  id: string;
  /** Optional stable field label (e.g. SN-004) when DB uses UUID primary keys. */
  publicCode?: string;
  name: string;
  location: string;
  coordinates: [number, number];
  type: SensorHardwareType;
  water_level_cm: number;
  battery_voltage: number;
  node_status: NodeStatus;
  /** Legacy composite RSSI-style display (0–100). */
  signalStrength: number;
  /** Type-specific scalar (mm/h, m³/s) when not using ultrasonic depth. */
  currentReading: number;
  readingUnit: string;
  lastUpdated: string;
  tinymlStatus: 'normal' | 'anomaly_detected' | 'processing';
  firmwareVersion: string;
  installedDate: string;
  assignedWarden: string;
  /** Ultrasonic / depth thresholds in cm (water_level only). */
  warningThreshold: number;
  criticalThreshold: number;
}

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
  /** Nearest ESP32 / JSN-SR04T node for this polygon (mock linkage). */
  linkedSensorNodeId?: string;
  /** Last uplink snapshot for map popups (mock). */
  lastTelemetry?: SensorTelemetrySnapshot;
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
  /** Warden mobile notes; shown under the title in Action Dispatcher. */
  fieldNotes?: string;
  location: string;
  recommendation: string;
  actionLabel: string;
  estimatedCost?: number;
  season: Season;
  zoneId?: string;
  boreholeId?: string;
  /** Originating edge node when raised from telemetry. */
  sensorNodeId?: string;
  /** Snapshot at alert generation (mock or API). */
  telemetry?: SensorTelemetrySnapshot;
  alertSource?: 'field' | 'operator' | 'telemetry';
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
  /** Human-in-the-loop: Orivon Edge Youth Guild field reports awaiting warden validation. */
  guildFieldReports: {
    activeCount: number;
    subtitle: string;
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
