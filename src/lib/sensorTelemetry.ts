import type { Alert, Season, SensorNode } from '@/types/hydrosentry';
import { LIFePO4_CELL_DEAD_V, LIFePO4_CELL_FULL_V, LIFePO4_CELL_NOMINAL_V } from '@/types/hydrosentry';
import { formatAssetTag } from '@/lib/assetTags';
import { formatFixed2 } from '@/lib/formatters';

export type WaterLevelSeverity = 'normal' | 'warning' | 'critical' | 'n/a';

/** SoC-style % along LiFePO₄ envelope: dead ≤3.0 V → 0%, full ~3.65 V → 100%. */
export function batteryVoltageToHealthPercent(voltage: number): number {
  if (voltage <= 0) return 0;
  const span = LIFePO4_CELL_FULL_V - LIFePO4_CELL_DEAD_V;
  const pct = ((voltage - LIFePO4_CELL_DEAD_V) / span) * 100;
  return Math.min(100, Math.max(0, Math.round(pct * 10) / 10));
}

/**
 * JSN-SR04T reports distance **down** to the water surface (cm). Flood = **smaller** distance.
 * Thresholds are minimum safe clearance: below `criticalThreshold` → critical, below `warningThreshold` → warning
 * (with criticalThreshold < warningThreshold).
 */
export function getWaterLevelSeverity(
  node: SensorNode,
  floors?: { warning: number; critical: number },
): WaterLevelSeverity {
  if (node.type !== 'water_level') return 'n/a';
  if (node.node_status === 'offline') return 'n/a';
  const cm = node.water_level_cm;
  const crit = floors?.critical ?? node.criticalThreshold;
  const warn = floors?.warning ?? node.warningThreshold;
  if (cm <= crit) return 'critical';
  if (cm <= warn) return 'warning';
  return 'normal';
}

/** SoC % for UI; low_battery rows stay &lt;20% when V is on the discharge cliff (≈3.05–3.10 V). */
export function displayCellHealthPercent(node: SensorNode): number | null {
  if (node.node_status === 'offline') return null;
  const pct = batteryVoltageToHealthPercent(node.battery_voltage);
  if (node.node_status === 'low_battery') {
    return Math.min(19, Math.round(pct * 10) / 10);
  }
  return Math.round(pct * 10) / 10;
}

/** Combined card / map emphasis: connectivity first, then flood risk. */
export function getSensorDisplaySeverity(
  node: SensorNode,
): 'offline' | 'low_battery' | 'critical' | 'warning' | 'online' {
  if (node.node_status === 'offline') return 'offline';
  const w = getWaterLevelSeverity(node);
  if (w === 'critical') return 'critical';
  if (node.node_status === 'low_battery' || w === 'warning') return 'warning';
  return 'online';
}

/** Telemetry-driven alerts are flood-season context (ultrasonic + rain + flow). */
function inferTelemetryAlertSeason(): Season {
  return 'wet';
}

/**
 * Synthetic alerts from live mock nodes (ESP32 + JSN-SR04T + LiFePO4).
 * IDs are stable so Action Dispatcher keys stay stable across ticks.
 */
export function buildTelemetryAlerts(nodes: SensorNode[]): Alert[] {
  const out: Alert[] = [];

  for (const node of nodes) {
    const season = inferTelemetryAlertSeason();
    const wl = getWaterLevelSeverity(node);

    if (node.node_status === 'low_battery') {
      const tag = formatAssetTag(node.publicCode ?? node.id);
      out.push({
        id: `tel-${node.id}-battery`,
        priority: 'warning',
        title: `Low LiFePO₄ cell — ${node.name}`,
        description: `Node ${tag} reports ${formatFixed2(node.battery_voltage)} V (nominal ${LIFePO4_CELL_NOMINAL_V} V). Dispatch warden for battery swap before discharge cliff (3.0V).`,
        location: node.location,
        recommendation: 'Schedule field visit — battery service',
        actionLabel: 'Alert Warden',
        estimatedCost: 12000,
        season,
        sensorNodeId: node.publicCode ?? node.id,
        telemetry: {
          water_level_cm: node.water_level_cm,
          battery_voltage: node.battery_voltage,
          node_status: node.node_status,
        },
        createdAt: new Date().toISOString(),
        alertSource: 'telemetry',
      });
    }

    if (node.node_status === 'offline') {
      const tag = formatAssetTag(node.publicCode ?? node.id);
      out.push({
        id: `tel-${node.id}-offline`,
        priority: 'critical',
        title: `Sensor offline — ${node.name}`,
        description: `No recent uplink from ${tag}. Last known water level ${formatFixed2(node.water_level_cm)} cm. Verify ESP32 power, antenna, and mesh relay.`,
        location: node.location,
        recommendation: 'Deploy maintenance crew — restore uplink',
        actionLabel: 'Dispatch Crew',
        estimatedCost: 35000,
        season,
        sensorNodeId: node.publicCode ?? node.id,
        telemetry: {
          water_level_cm: node.water_level_cm,
          battery_voltage: node.battery_voltage,
          node_status: node.node_status,
        },
        createdAt: new Date().toISOString(),
        alertSource: 'telemetry',
      });
    }

    if (wl === 'critical') {
      const tag = formatAssetTag(node.publicCode ?? node.id);
      out.push({
        id: `tel-${node.id}-water-crit`,
        priority: 'critical',
        title: `Critical water depth — ${node.name}`,
        description: `JSN-SR04T clearance ${formatFixed2(node.water_level_cm)} cm on ${tag} is at or below the critical floor (${formatFixed2(node.criticalThreshold)} cm). Immediate flood / drainage response required.`,
        location: node.location,
        recommendation: 'Emergency clearance and flow diversion',
        actionLabel: 'Dispatch Crew',
        estimatedCost: 85000,
        season,
        zoneId: undefined,
        sensorNodeId: node.publicCode ?? node.id,
        telemetry: {
          water_level_cm: node.water_level_cm,
          battery_voltage: node.battery_voltage,
          node_status: node.node_status,
        },
        createdAt: new Date().toISOString(),
        alertSource: 'telemetry',
      });
    } else if (wl === 'warning') {
      out.push({
        id: `tel-${node.id}-water-warn`,
        priority: 'warning',
        title: `Elevated water level — ${node.name}`,
        description: `Ultrasonic reading ${formatFixed2(node.water_level_cm)} cm on ${formatAssetTag(node.publicCode ?? node.id)} is below warning clearance (${formatFixed2(node.warningThreshold)} cm). Imminent overflow risk.`,
        location: node.location,
        recommendation: 'Preventive inspection and channel check',
        actionLabel: 'Schedule Inspection',
        estimatedCost: 28000,
        season,
        sensorNodeId: node.publicCode ?? node.id,
        telemetry: {
          water_level_cm: node.water_level_cm,
          battery_voltage: node.battery_voltage,
          node_status: node.node_status,
        },
        createdAt: new Date().toISOString(),
        alertSource: 'telemetry',
      });
    }
  }

  const priorityOrder: Record<Alert['priority'], number> = {
    critical: 0,
    warning: 1,
    info: 2,
  };
  return out.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}
