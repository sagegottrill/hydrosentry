import { useState, useMemo } from 'react';
import { useOpsAlertsRealtimePrepend } from '@/hooks/useOpsAlertsRealtime';
import type { 
  RiskZone, 
  Borehole, 
  Alert, 
  Route, 
  DashboardMetrics,
  Season 
} from '@/types/hydrosentry';
import { EDGE_HARDWARE_SPEC } from '@/types/hydrosentry';

// Mock data - structured for easy Supabase migration
const mockRiskZones: RiskZone[] = [
  {
    id: 'rz-001',
    name: 'Monday Market Bridge',
    type: 'waste',
    coordinates: [11.8456, 13.1523],
    severity: 'high',
    season: 'wet',
    blockageType: 'Solid Waste',
    description: 'Major drainage blockage causing flood risk',
    linkedSensorNodeId: 'SN-001',
    lastTelemetry: {
      water_level_cm: 228,
      battery_voltage: 3.30,
      node_status: 'online',
    },
  },
  {
    id: 'rz-002',
    name: 'Gwange Drainage',
    type: 'flood',
    coordinates: [11.8380, 13.1400],
    severity: 'high',
    season: 'wet',
    blockageType: 'Debris & Sediment',
    description: 'Recurring flood zone during heavy rains',
    linkedSensorNodeId: 'SN-002',
    lastTelemetry: {
      water_level_cm: 198,
      battery_voltage: 3.30,
      node_status: 'online',
    },
  },
  {
    id: 'rz-003',
    name: 'Lagos Street Channel',
    type: 'overflow',
    coordinates: [11.8520, 13.1350],
    severity: 'medium',
    season: 'wet',
    blockageType: 'Construction Waste',
    description: 'Channel overflow risk area',
    linkedSensorNodeId: 'SN-003',
    lastTelemetry: {
      water_level_cm: 172,
      battery_voltage: 3.30,
      node_status: 'online',
    },
  }
];

const mockBoreholes: Borehole[] = [
  {
    id: 'bh-001',
    name: 'Dikwa Water Point Borehole',
    location: 'Dikwa',
    coordinates: [12.0361, 13.9180],
    status: 'failure',
    thirstIndex: 9.2,
    crpdScore: 9.8,
    lastMaintenanceDate: '2024-08-15'
  },
  {
    id: 'bh-002',
    name: 'Gwoza Central Well',
    location: 'Gwoza LGA',
    coordinates: [11.0833, 13.5167],
    status: 'failure',
    thirstIndex: 8.5,
    crpdScore: 8.2,
    lastMaintenanceDate: '2024-09-01'
  },
  {
    id: 'bh-003',
    name: 'Bama Water Point',
    location: 'Bama',
    coordinates: [11.5218, 13.6883],
    status: 'maintenance',
    thirstIndex: 6.0,
    crpdScore: 5.5,
    lastMaintenanceDate: '2024-10-20'
  }
];

/** Baseline Action Dispatcher alerts — kept as default React state; live rows prepend via Realtime. */
export const DISPATCH_MOCK_ALERTS_INITIAL: Alert[] = [
  {
    id: 'alert-001',
    priority: 'critical',
    title: 'Waste Blockage at Ngadda Bridge',
    description: 'Severe solid waste accumulation blocking primary drainage channel',
    location: 'Monday Market Bridge',
    recommendation: 'Deploy Excavator',
    actionLabel: 'Deploy Excavator',
    estimatedCost: 350000,
    season: 'wet',
    zoneId: 'rz-001',
    createdAt: new Date().toISOString()
  },
  {
    id: 'alert-002',
    priority: 'warning',
    title: 'Borehole Down in Gwoza',
    description: 'Primary water source non-functional. Risk of herder trespass to neighboring farmlands.',
    location: 'Gwoza LGA',
    recommendation: 'Deploy Repair Team',
    actionLabel: 'Alert Technician',
    estimatedCost: 75000,
    season: 'dry',
    boreholeId: 'bh-002',
    createdAt: new Date().toISOString()
  },
  {
    id: 'alert-003',
    priority: 'warning',
    title: 'Drainage Overflow Risk',
    description: 'Lagos Street Channel showing early signs of overflow',
    location: 'Lagos Street',
    recommendation: 'Preventive Clearance',
    actionLabel: 'Schedule Inspection',
    estimatedCost: 25000,
    season: 'wet',
    zoneId: 'rz-003',
    createdAt: new Date().toISOString()
  },
  {
    id: 'alert-004',
    priority: 'critical',
    title: 'Anomalous Movement — Safe Corridor Route 12',
    description:
      'Machine learning model predicts high likelihood of route obstruction or armed movement in Yelwata Sector over the next 12 hours based on recent displacement data.',
    location: 'Yelwata Sector',
    recommendation: 'Coordinate Warden Guild field validation and corridor status reporting',
    actionLabel: 'Alert Warden Guild (Validation)',
    estimatedCost: 15000,
    season: 'dry',
    createdAt: new Date().toISOString()
  },
  /** Wet-season climate–security nexus (dual-crisis engine must surface in flood shield mode). */
  {
    id: 'alert-005',
    priority: 'warning',
    title: 'CRPD spike — herder transit near Konduga corridor',
    description:
      'Conflict risk probability index rose to 8.4/10 on pastoral movement patterns overlapping farm parcels east of Konduga. Coordinate joint agency–security assessment.',
    location: 'Konduga',
    recommendation: 'Activate ward focal mediation and corridor monitoring',
    actionLabel: 'Alert Warden Guild (Validation)',
    estimatedCost: 12000,
    season: 'wet',
    createdAt: new Date().toISOString()
  },
];

const mockAlerts = DISPATCH_MOCK_ALERTS_INITIAL;

const mockRoutes: Route[] = [
  {
    id: 'rt-001',
    name: 'Gwoza → Bama Pastoral Corridor',
    coordinates: [
      [11.0833, 13.5167], // Gwoza
      [11.2200, 13.5600],
      [11.3800, 13.6100],
      [11.5218, 13.6883], // Bama
    ],
    status: 'verified',
    type: 'herder',
    season: 'dry'
  },
  {
    id: 'rt-002',
    name: 'Bama → Dikwa North Track',
    coordinates: [
      [11.5218, 13.6883], // Bama
      [11.7200, 13.7800],
      [11.9000, 13.8600],
      [12.0361, 13.9180], // Dikwa
    ],
    status: 'verified',
    type: 'herder',
    season: 'dry'
  },
  {
    id: 'rt-003',
    name: 'Gwoza Ridge Bypass',
    coordinates: [
      [11.0833, 13.5167], // Gwoza
      [11.1600, 13.5800],
      [11.2600, 13.6400],
      [11.3600, 13.6900],
    ],
    status: 'unverified',
    type: 'herder',
    season: 'dry'
  }
];

const mockMetrics: DashboardMetrics = {
  floodRiskValue: {
    amount: 28800000000,
    currency: 'NGN',
    trend: 12
  },
  guildFieldReports: {
    activeCount: 14,
    subtitle: 'Pending validation by Wardens',
  },
  conflictProbability: {
    percentage: 86,
    location: 'Yelwata Sector',
    level: 'high'
  },
  safeCorridors: {
    count: 12,
    status: 'verified'
  }
};

// Sparkline data for trend visualization
export const sparklineData = {
  floodRisk: [
    { day: 1, value: 22 },
    { day: 2, value: 24 },
    { day: 3, value: 23 },
    { day: 4, value: 26 },
    { day: 5, value: 25 },
    { day: 6, value: 28 },
    { day: 7, value: 28.8 }
  ],
  guildFieldReports: [
    { day: 1, value: 8 },
    { day: 2, value: 9 },
    { day: 3, value: 10 },
    { day: 4, value: 11 },
    { day: 5, value: 12 },
    { day: 6, value: 13 },
    { day: 7, value: 14 },
  ],
  conflictProb: [
    { day: 1, value: 65 },
    { day: 2, value: 70 },
    { day: 3, value: 72 },
    { day: 4, value: 78 },
    { day: 5, value: 82 },
    { day: 6, value: 84 },
    { day: 7, value: 86 }
  ],
  corridors: [
    { day: 1, value: 8 },
    { day: 2, value: 9 },
    { day: 3, value: 9 },
    { day: 4, value: 10 },
    { day: 5, value: 11 },
    { day: 6, value: 11 },
    { day: 7, value: 12 }
  ]
};

export function useHydroData() {
  const [season, setSeason] = useState<Season>('wet');

  // Filter data by season
  const riskZones = useMemo(() => 
    mockRiskZones.filter(z => z.season === season),
    [season]
  );

  const boreholes = useMemo(() => 
    season === 'dry' ? mockBoreholes : [],
    [season]
  );

  const alerts = useMemo(() => 
    mockAlerts.filter(a => a.season === season),
    [season]
  );

  const routes = useMemo(() => 
    season === 'dry' ? mockRoutes : [],
    [season]
  );

  return {
    season,
    setSeason,
    riskZones,
    boreholes,
    alerts,
    routes,
    metrics: mockMetrics,
    sparklineData,
    edgeHardwareSpec: EDGE_HARDWARE_SPEC,
    isLoading: false,
    error: null
  };
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>(() => [...DISPATCH_MOCK_ALERTS_INITIAL]);

  useOpsAlertsRealtimePrepend(setAlerts);

  const dispatchAction = (alertId: string) => {
    // Future: This will POST to Supabase
    const workOrderNumber = Math.floor(400 + Math.random() * 100);
    return {
      success: true,
      workOrderId: `WO-${workOrderNumber}`,
      message: `Work Order #${workOrderNumber} Sent to Ministry of Environment`
    };
  };

  return {
    alerts,
    dispatchAction
  };
}
