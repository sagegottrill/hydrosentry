import { useState, useEffect, useRef } from 'react';

// ── Types ──────────────────────────────────────────────────────
export interface SensorNode {
  id: string;
  name: string;
  location: string;
  coordinates: [number, number];
  type: 'water_level' | 'rain_gauge' | 'flow_meter';
  status: 'online' | 'offline' | 'warning' | 'critical';
  battery: number;
  signalStrength: number;
  currentReading: number;
  readingUnit: string;
  lastUpdated: string;
  tinymlStatus: 'normal' | 'anomaly_detected' | 'processing';
  firmwareVersion: string;
  installedDate: string;
  assignedWarden: string;
  warningThreshold: number;
  criticalThreshold: number;
}

export interface ReadingPoint {
  time: string;
  value: number;
}

// ── Helpers ────────────────────────────────────────────────────
function generateHistory(baseline: number, hours: number): ReadingPoint[] {
  const pts: ReadingPoint[] = [];
  const now = Date.now();
  for (let i = hours; i >= 0; i--) {
    const t = new Date(now - i * 3600000);
    const noise = (Math.random() - 0.5) * 0.4;
    const drift = ((hours - i) / hours) * 0.3;
    pts.push({
      time: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: Math.round((baseline + noise + drift) * 100) / 100,
    });
  }
  return pts;
}

function timeAgo(sec: number): string {
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)} min ago`;
  return `${Math.floor(sec / 3600)}h ago`;
}

// ── Initial Sensor Data ────────────────────────────────────────
const buildInitialNodes = (): SensorNode[] => [
  {
    id: 'SN-001', name: 'Ngadda Bridge Alpha', location: 'Monday Market Bridge',
    coordinates: [11.8456, 13.1523], type: 'water_level', status: 'online',
    battery: 87, signalStrength: 92, currentReading: 2.3, readingUnit: 'm',
    lastUpdated: '2 min ago', tinymlStatus: 'normal', firmwareVersion: 'v1.2.4',
    installedDate: '2026-01-15', assignedWarden: 'Ibrahim Musa',
    warningThreshold: 3.5, criticalThreshold: 4.5,
  },
  {
    id: 'SN-002', name: 'Gwange Drainage Sensor', location: 'Gwange Ward',
    coordinates: [11.838, 13.14], type: 'water_level', status: 'online',
    battery: 64, signalStrength: 78, currentReading: 1.8, readingUnit: 'm',
    lastUpdated: '5 min ago', tinymlStatus: 'normal', firmwareVersion: 'v1.2.4',
    installedDate: '2026-01-18', assignedWarden: 'Aisha Bukar',
    warningThreshold: 3.0, criticalThreshold: 4.0,
  },
  {
    id: 'SN-003', name: 'Lagos Street Node', location: 'Lagos Street',
    coordinates: [11.852, 13.135], type: 'water_level', status: 'online',
    battery: 92, signalStrength: 95, currentReading: 1.2, readingUnit: 'm',
    lastUpdated: '1 min ago', tinymlStatus: 'normal', firmwareVersion: 'v1.2.4',
    installedDate: '2026-01-20', assignedWarden: 'Mohammed Yusuf',
    warningThreshold: 3.0, criticalThreshold: 4.0,
  },
  {
    id: 'SN-004', name: 'Alau Dam Monitor', location: 'Alau Dam Spillway',
    coordinates: [11.78, 13.25], type: 'water_level', status: 'online',
    battery: 71, signalStrength: 85, currentReading: 3.1, readingUnit: 'm',
    lastUpdated: '3 min ago', tinymlStatus: 'normal', firmwareVersion: 'v1.2.4',
    installedDate: '2026-01-10', assignedWarden: 'Fatima Ali',
    warningThreshold: 3.5, criticalThreshold: 4.5,
  },
  {
    id: 'SN-005', name: 'Jere LGA Rain Station', location: 'Jere LGA',
    coordinates: [11.88, 13.1], type: 'rain_gauge', status: 'online',
    battery: 45, signalStrength: 70, currentReading: 12.4, readingUnit: 'mm/h',
    lastUpdated: '8 min ago', tinymlStatus: 'normal', firmwareVersion: 'v1.1.8',
    installedDate: '2026-02-01', assignedWarden: 'Usman Babagana',
    warningThreshold: 25.0, criticalThreshold: 40.0,
  },
  {
    id: 'SN-006', name: 'Konduga Flow Meter', location: 'Konduga',
    coordinates: [11.65, 13.38], type: 'flow_meter', status: 'online',
    battery: 83, signalStrength: 88, currentReading: 0.8, readingUnit: 'm³/s',
    lastUpdated: '4 min ago', tinymlStatus: 'normal', firmwareVersion: 'v1.2.4',
    installedDate: '2026-01-25', assignedWarden: 'Halima Suleiman',
    warningThreshold: 2.0, criticalThreshold: 3.5,
  },
  {
    id: 'SN-007', name: 'Dikwa Observation Post', location: 'Dikwa',
    coordinates: [12.03, 13.92], type: 'water_level', status: 'online',
    battery: 56, signalStrength: 62, currentReading: 1.5, readingUnit: 'm',
    lastUpdated: '12 min ago', tinymlStatus: 'normal', firmwareVersion: 'v1.1.8',
    installedDate: '2026-02-05', assignedWarden: 'Abdullahi Mala',
    warningThreshold: 3.0, criticalThreshold: 4.0,
  },
  {
    id: 'SN-008', name: 'Bama North Sensor', location: 'Bama LGA',
    coordinates: [11.522, 13.689], type: 'water_level', status: 'warning',
    battery: 22, signalStrength: 41, currentReading: 2.0, readingUnit: 'm',
    lastUpdated: '25 min ago', tinymlStatus: 'normal', firmwareVersion: 'v1.1.8',
    installedDate: '2026-02-10', assignedWarden: 'Zainab Kyari',
    warningThreshold: 3.5, criticalThreshold: 4.5,
  },
  {
    id: 'SN-009', name: 'Monguno Water Station', location: 'Monguno',
    coordinates: [12.68, 13.61], type: 'water_level', status: 'online',
    battery: 78, signalStrength: 74, currentReading: 1.1, readingUnit: 'm',
    lastUpdated: '6 min ago', tinymlStatus: 'normal', firmwareVersion: 'v1.2.4',
    installedDate: '2026-02-15', assignedWarden: 'Garba Umar',
    warningThreshold: 3.0, criticalThreshold: 4.0,
  },
  {
    id: 'SN-010', name: 'Marte Relay Node', location: 'Marte LGA',
    coordinates: [12.36, 13.83], type: 'water_level', status: 'offline',
    battery: 0, signalStrength: 0, currentReading: 0, readingUnit: 'm',
    lastUpdated: '3 days ago', tinymlStatus: 'normal', firmwareVersion: 'v1.1.8',
    installedDate: '2026-02-20', assignedWarden: 'Amina Lawan',
    warningThreshold: 3.0, criticalThreshold: 4.0,
  },
];

// ── Hook ───────────────────────────────────────────────────────
export function useSensorNetwork() {
  const [nodes, setNodes] = useState<SensorNode[]>(buildInitialNodes);
  const [readingHistories, setReadingHistories] = useState<Record<string, ReadingPoint[]>>(() => {
    const h: Record<string, ReadingPoint[]> = {};
    buildInitialNodes().forEach(n => {
      h[n.id] = generateHistory(n.currentReading, 48);
    });
    return h;
  });
  const tickRef = useRef(0);

  // Real-time simulation — updates every 3 seconds
  useEffect(() => {
    const iv = setInterval(() => {
      tickRef.current += 1;
      const tick = tickRef.current;

      setNodes(prev =>
        prev.map(node => {
          if (node.status === 'offline') return node;

          let newReading = node.currentReading;

          // SN-004 (Alau Dam) trends upward to simulate rising water
          if (node.id === 'SN-004') {
            newReading += 0.03 + Math.random() * 0.02;
          } else {
            newReading += (Math.random() - 0.48) * 0.05;
          }

          newReading = Math.max(0.3, Math.round(newReading * 100) / 100);

          let status: SensorNode['status'] = 'online';
          let tinyml: SensorNode['tinymlStatus'] = 'normal';

          if (node.battery < 25 && node.battery > 0) status = 'warning';
          if (newReading >= node.criticalThreshold) {
            status = 'critical';
            tinyml = 'anomaly_detected';
          } else if (newReading >= node.warningThreshold) {
            status = 'warning';
            tinyml = tick % 4 === 0 ? 'processing' : 'anomaly_detected';
          }

          if (node.status === 'offline') status = 'offline';

          return {
            ...node,
            currentReading: newReading,
            status,
            tinymlStatus: tinyml,
            lastUpdated: timeAgo(Math.floor(Math.random() * 60) + 1),
          };
        }),
      );

      // Append new point to histories
      setReadingHistories(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          const lastVal = next[id][next[id].length - 1]?.value ?? 1;
          const noise = (Math.random() - 0.48) * 0.1;
          const bump = id === 'SN-004' ? 0.04 : 0;
          next[id] = [
            ...next[id].slice(-95),
            {
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              value: Math.round((lastVal + noise + bump) * 100) / 100,
            },
          ];
        });
        return next;
      });
    }, 3000);

    return () => clearInterval(iv);
  }, []);

  const stats = {
    total: nodes.length,
    online: nodes.filter(n => n.status === 'online').length,
    warning: nodes.filter(n => n.status === 'warning').length,
    critical: nodes.filter(n => n.status === 'critical').length,
    offline: nodes.filter(n => n.status === 'offline').length,
    avgBattery: Math.round(nodes.filter(n => n.status !== 'offline').reduce((a, n) => a + n.battery, 0) / Math.max(nodes.filter(n => n.status !== 'offline').length, 1)),
  };

  return { nodes, readingHistories, stats };
}
