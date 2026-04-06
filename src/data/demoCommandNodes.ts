/**
 * Hardcoded LoRaWAN / edge nodes for the Live Demo Command Center prototype.
 * No backend — reviewers click through a simulated early-warning console.
 */

export type DemoNodeUiStatus = 'nominal' | 'warning';

export interface DemoCommandNode {
  nodeId: string;
  locationLabel: string;
  lat: number;
  lng: number;
  status: DemoNodeUiStatus;
  /** Human-readable last uplink */
  lastSyncLabel: string;
  /** Baseline label shown when not in synthetic spike */
  waterLevel: string;
  flowVelocity: string;
  batteryPct: number;
  tinyMlLatencyMs: number;
}

export const DEMO_SPIKE_NODE_ID = 'HS-Delta-04';

export const DEMO_COMMAND_NODES: DemoCommandNode[] = [
  {
    nodeId: 'HS-Alpha-01',
    locationLabel: 'Bama Ward',
    lat: 11.5218,
    lng: 13.6883,
    status: 'nominal',
    lastSyncLabel: '12s ago',
    waterLevel: '2.4m (Safe)',
    flowVelocity: '1.2 m/s',
    batteryPct: 88,
    tinyMlLatencyMs: 42,
  },
  {
    nodeId: 'HS-Alpha-02',
    locationLabel: 'Maiduguri Corridor',
    lat: 11.8333,
    lng: 13.15,
    status: 'nominal',
    lastSyncLabel: '9s ago',
    waterLevel: '1.9m (Safe)',
    flowVelocity: '0.9 m/s',
    batteryPct: 91,
    tinyMlLatencyMs: 38,
  },
  {
    nodeId: 'HS-Beta-03',
    locationLabel: 'Ngadda Reach',
    lat: 11.65,
    lng: 13.22,
    status: 'nominal',
    lastSyncLabel: '15s ago',
    waterLevel: '2.1m (Safe)',
    flowVelocity: '1.1 m/s',
    batteryPct: 86,
    tinyMlLatencyMs: 45,
  },
  {
    nodeId: DEMO_SPIKE_NODE_ID,
    locationLabel: 'Dikwa Grid',
    lat: 12.0361,
    lng: 13.918,
    status: 'nominal',
    lastSyncLabel: '11s ago',
    waterLevel: '2.4m (Safe)',
    flowVelocity: '1.2 m/s',
    batteryPct: 88,
    tinyMlLatencyMs: 42,
  },
  {
    nodeId: 'HS-Gamma-05',
    locationLabel: 'Gwoza Upland',
    lat: 11.0833,
    lng: 13.5167,
    status: 'nominal',
    lastSyncLabel: '18s ago',
    waterLevel: '1.7m (Safe)',
    flowVelocity: '0.7 m/s',
    batteryPct: 79,
    tinyMlLatencyMs: 51,
  },
  {
    nodeId: 'HS-Gamma-06',
    locationLabel: 'Alau Forebay',
    lat: 11.0667,
    lng: 13.0833,
    status: 'nominal',
    lastSyncLabel: '7s ago',
    waterLevel: '3.0m (Safe)',
    flowVelocity: '1.4 m/s',
    batteryPct: 93,
    tinyMlLatencyMs: 36,
  },
  {
    nodeId: 'HS-Epsilon-07',
    locationLabel: 'Konduga Transect',
    lat: 11.6533,
    lng: 13.4178,
    status: 'warning',
    lastSyncLabel: '22s ago',
    waterLevel: '2.8m (Safe)',
    flowVelocity: '1.3 m/s',
    batteryPct: 72,
    tinyMlLatencyMs: 48,
  },
  {
    nodeId: 'HS-Zeta-08',
    locationLabel: 'Jere Basin',
    lat: 11.92,
    lng: 13.02,
    status: 'nominal',
    lastSyncLabel: '14s ago',
    waterLevel: '2.0m (Safe)',
    flowVelocity: '1.0 m/s',
    batteryPct: 90,
    tinyMlLatencyMs: 41,
  },
  {
    nodeId: 'HS-Theta-09',
    locationLabel: 'Biu Escarpment',
    lat: 10.6129,
    lng: 12.195,
    status: 'nominal',
    lastSyncLabel: '19s ago',
    waterLevel: '1.5m (Safe)',
    flowVelocity: '0.6 m/s',
    batteryPct: 84,
    tinyMlLatencyMs: 44,
  },
  {
    nodeId: 'HS-Kappa-10',
    locationLabel: 'Chad Shoreline',
    lat: 13.05,
    lng: 14.35,
    status: 'nominal',
    lastSyncLabel: '6s ago',
    waterLevel: '2.2m (Safe)',
    flowVelocity: '1.15 m/s',
    batteryPct: 87,
    tinyMlLatencyMs: 40,
  },
];
