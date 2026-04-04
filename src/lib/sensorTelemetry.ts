import type { Alert, Season, SensorNode } from '@/types/hydrosentry';
import { LIFePO4_CELL_NOMINAL_V } from '@/types/hydrosentry';

export type WaterLevelSeverity = 'normal' | 'warning' | 'critical' | 'n/a';

/** Linear UI scale: 3.2 V = full, 0 V = empty (offline). */
export function batteryVoltageToHealthPercent(voltage: number): number {
  if (voltage <= 0) return 0;
  return Math.min(100, Math.round((voltage / LIFePO4_CELL_NOMINAL_V) * 1000) / 10);
}

export function getWaterLevelSeverity(node: SensorNode): WaterLevelSeverity {
  if (node.type !== 'water_level') return 'n/a';
  if (node.node_status === 'offline') return 'n/a';
  const cm = node.water_level_cm;
  if (cm >= node.criticalThreshold) return 'critical';
  if (cm >= node.warningThreshold) return 'warning';
  return 'normal';
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
      out.push({
        id: `tel-${node.id}-battery`,
        priority: 'warning',
        title: `Low LiFePO₄ cell — ${node.name}`,
        description: `Node ${node.id} reports ${node.battery_voltage.toFixed(2)} V (nominal ${LIFePO4_CELL_NOMINAL_V} V). Dispatch warden for battery swap or charging before uplink loss.`,
        location: node.location,
        recommendation: 'Schedule field visit — battery service',
        actionLabel: 'Alert Warden',
        estimatedCost: 12000,
        season,
        sensorNodeId: node.id,
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
      out.push({
        id: `tel-${node.id}-offline`,
        priority: 'critical',
        title: `Sensor offline — ${node.name}`,
        description: `No recent uplink from ${node.id}. Last known water level ${node.water_level_cm} cm. Verify ESP32 power, antenna, and mesh relay.`,
        location: node.location,
        recommendation: 'Deploy maintenance crew — restore uplink',
        actionLabel: 'Dispatch Crew',
        estimatedCost: 35000,
        season,
        sensorNodeId: node.id,
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
      out.push({
        id: `tel-${node.id}-water-crit`,
        priority: 'critical',
        title: `Critical water depth — ${node.name}`,
        description: `JSN-SR04T reports ${node.water_level_cm} cm (critical ≥ ${node.criticalThreshold} cm). Immediate flood / drainage response required.`,
        location: node.location,
        recommendation: 'Emergency clearance and flow diversion',
        actionLabel: 'Dispatch Crew',
        estimatedCost: 85000,
        season,
        zoneId: undefined,
        sensorNodeId: node.id,
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
        description: `Ultrasonic reading ${node.water_level_cm} cm exceeds warning threshold (${node.warningThreshold} cm).`,
        location: node.location,
        recommendation: 'Preventive inspection and channel check',
        actionLabel: 'Schedule Inspection',
        estimatedCost: 28000,
        season,
        sensorNodeId: node.id,
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
