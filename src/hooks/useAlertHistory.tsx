import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import { toast } from 'sonner';

// ── Types ──────────────────────────────────────────────────────
export interface AlertEvent {
    id: string;
    timestamp: string;
    relativeTime: string;
    sensorId: string;
    sensorName: string;
    type: 'flood_warning' | 'anomaly' | 'equipment_failure' | 'low_battery' | 'siren_activated' | 'conflict_signal';
    severity: 'critical' | 'warning' | 'info';
    /** Optional headline (e.g. Conflict Engine / ops title); body stays in `message`. */
    title?: string;
    message: string;
    smsDelivery?: {
        sent: number;
        delivered: number;
        failed: number;
        /** In-transit / queued (explicit or implied); omit to derive from sent − delivered − failed. */
        pending?: number;
    };
    sirenActivated: boolean;
    resolvedAt?: string;
    resolvedBy?: string;
    status: 'active' | 'resolved' | 'acknowledged';
}

export interface AlertStats {
    totalAlerts: number;
    totalSmsSent: number;
    totalSmsDelivered: number;
    avgResponseMin: number;
    sirensActivated: number;
    activeAlerts: number;
}

export type FieldReportKind = 'nominal' | 'battery' | 'silt';

interface AlertHistoryContextValue {
    alerts: AlertEvent[];
    stats: AlertStats;
    /** Inserts a field-warden report at the top of the timeline (demo / command-center sync). */
    recordFieldReport: (input: {
        nodeId: string;
        nodeName: string;
        location: string;
        publicCode?: string;
        report: FieldReportKind;
    }) => void;
}

const AlertHistoryContext = createContext<AlertHistoryContextValue | null>(null);

// ── Mock Alert History ─────────────────────────────────────────
function buildAlertHistory(): AlertEvent[] {
    return [
        {
            id: 'AH-001', timestamp: '2026-03-06T18:42:00Z', relativeTime: '3 hours ago',
            sensorId: 'SN-004', sensorName: 'Alau Dam Monitor',
            type: 'flood_warning', severity: 'critical',
            message: 'Clearance dropped to 0.7m (Critical threshold < 0.8m). Immediate evacuation advisory triggered.',
            smsDelivery: { sent: 847, delivered: 839, failed: 8 },
            sirenActivated: true, status: 'active',
        },
        {
            id: 'AH-002', timestamp: '2026-03-06T16:15:00Z', relativeTime: '5 hours ago',
            sensorId: 'SN-004', sensorName: 'Alau Dam Monitor',
            type: 'anomaly', severity: 'warning',
            message: 'TinyML anomaly: clearance drop pattern detected — ~0.3m/hour sustained over a 4-hour window (downward-facing JSN-SR04T).',
            smsDelivery: { sent: 215, delivered: 212, failed: 3 },
            sirenActivated: false, status: 'acknowledged',
        },
        {
            id: 'AH-003', timestamp: '2026-03-06T09:30:00Z', relativeTime: '12 hours ago',
            sensorId: 'SN-008', sensorName: 'Bama North Sensor',
            type: 'low_battery', severity: 'warning',
            message: 'Battery at 22%. Warden dispatched for solar panel inspection.',
            sirenActivated: false, status: 'acknowledged',
        },
        {
            id: 'AH-004', timestamp: '2026-03-05T22:10:00Z', relativeTime: '1 day ago',
            sensorId: 'SN-001', sensorName: 'Ngadda Bridge Alpha',
            type: 'flood_warning', severity: 'warning',
            message: 'Clearance dropped to 1.4m (Warning threshold < 1.5m). Monitoring escalated.',
            smsDelivery: { sent: 412, delivered: 408, failed: 4 },
            sirenActivated: false, status: 'resolved', resolvedAt: '2026-03-06T02:30:00Z', resolvedBy: 'System (auto)',
        },
        {
            id: 'AH-005', timestamp: '2026-03-05T14:45:00Z', relativeTime: '1 day ago',
            sensorId: 'SN-010', sensorName: 'Marte Relay Node',
            type: 'equipment_failure', severity: 'critical',
            message: 'Node offline — no LoRaWAN heartbeat received for 6 hours. Vandalism suspected.',
            sirenActivated: false, status: 'active',
        },
        {
            id: 'AH-006', timestamp: '2026-03-04T18:00:00Z', relativeTime: '2 days ago',
            sensorId: 'SN-002', sensorName: 'Gwange Drainage Sensor',
            type: 'flood_warning', severity: 'critical',
            message: 'Drainage overflow detected. Clearance dropped to 0.9m (Critical threshold < 0.8m). Siren protocol executed.',
            smsDelivery: { sent: 634, delivered: 628, failed: 6 },
            sirenActivated: true, status: 'resolved', resolvedAt: '2026-03-05T06:00:00Z', resolvedBy: 'Aisha Bukar',
        },
        {
            id: 'AH-007', timestamp: '2026-03-04T11:20:00Z', relativeTime: '2 days ago',
            sensorId: 'SN-006', sensorName: 'Konduga Flow Meter',
            type: 'anomaly', severity: 'info',
            message: 'Unusual flow velocity spike detected — 2.1 m³/s (baseline 0.8). Likely upstream rainfall.',
            sirenActivated: false, status: 'resolved', resolvedAt: '2026-03-04T14:00:00Z', resolvedBy: 'System (auto)',
        },
        {
            id: 'AH-008', timestamp: '2026-03-03T20:00:00Z', relativeTime: '3 days ago',
            sensorId: 'SN-007', sensorName: 'Dikwa Observation Post',
            type: 'flood_warning', severity: 'warning',
            message: 'Clearance dropped to 1.6m (Warning threshold < 1.5m). Pre-emptive SMS advisory sent; monitoring elevated.',
            smsDelivery: { sent: 318, delivered: 312, failed: 6 },
            sirenActivated: false, status: 'resolved', resolvedAt: '2026-03-04T08:00:00Z', resolvedBy: 'Abdullahi Mala',
        },
        {
            id: 'AH-009', timestamp: '2026-03-03T07:15:00Z', relativeTime: '3 days ago',
            sensorId: 'SN-005', sensorName: 'Jere LGA Rain Station',
            type: 'anomaly', severity: 'warning',
            message: 'Rainfall intensity exceeding seasonal forecast — 32mm/h sustained for 2 hours.',
            smsDelivery: { sent: 156, delivered: 154, failed: 2 },
            sirenActivated: false, status: 'resolved', resolvedAt: '2026-03-03T12:00:00Z', resolvedBy: 'System (auto)',
        },
        {
            id: 'AH-010', timestamp: '2026-03-02T16:00:00Z', relativeTime: '4 days ago',
            sensorId: 'SN-003', sensorName: 'Lagos Street Node',
            type: 'siren_activated', severity: 'critical',
            message: 'Physical siren activated at Lagos Street. Community evacuation drill completed successfully.',
            smsDelivery: { sent: 523, delivered: 518, failed: 5 },
            sirenActivated: true, status: 'resolved', resolvedAt: '2026-03-02T17:30:00Z', resolvedBy: 'Mohammed Yusuf',
        },
        {
            id: 'AH-011', timestamp: '2026-03-01T09:45:00Z', relativeTime: '5 days ago',
            sensorId: 'SN-007', sensorName: 'Dikwa Observation Post',
            type: 'low_battery', severity: 'info',
            message: 'Brief LiFePO₄ sag to ~3.09 V during storm window; recovered after solar input.',
            sirenActivated: false, status: 'resolved', resolvedAt: '2026-03-02T10:00:00Z', resolvedBy: 'Abdullahi Mala',
        },
        {
            id: 'AH-012', timestamp: '2026-02-28T14:30:00Z', relativeTime: '6 days ago',
            sensorId: 'HS-GWOZA-012', sensorName: 'Gwoza Valley Checkpoint',
            type: 'conflict_signal', severity: 'critical',
            title: 'Anomalous Movement Detected',
            message:
                'ML anomaly matched displacement signature on Safe Corridor Route 12. Warden Guild dispatched to validate. No armed threat confirmed.',
            sirenActivated: false,
            status: 'resolved',
            resolvedAt: '2026-02-28T22:15:00Z',
            resolvedBy: 'Youth Guild field lead',
        },
        {
            id: 'AH-013', timestamp: '2026-02-27T06:00:00Z', relativeTime: '7 days ago',
            sensorId: 'SN-001', sensorName: 'Ngadda Bridge Alpha',
            type: 'anomaly', severity: 'info',
            message: 'Minor debris buildup detected via flow analysis. Clearance crew notified.',
            sirenActivated: false, status: 'resolved', resolvedAt: '2026-02-27T15:00:00Z', resolvedBy: 'Ibrahim Musa',
        },
        {
            id: 'AH-014', timestamp: '2026-02-25T20:00:00Z', relativeTime: '9 days ago',
            sensorId: 'SN-008', sensorName: 'Bama North Sensor',
            type: 'equipment_failure', severity: 'warning',
            message: 'Solar panel degradation — charging rate at 40% of baseline. Warden inspection scheduled.',
            sirenActivated: false, status: 'resolved', resolvedAt: '2026-02-26T12:00:00Z', resolvedBy: 'Zainab Kyari',
        },
        {
            id: 'AH-015', timestamp: '2026-02-23T11:30:00Z', relativeTime: '11 days ago',
            sensorId: 'SN-002', sensorName: 'Gwange Drainage Sensor',
            type: 'siren_activated', severity: 'critical',
            message: 'Emergency siren test — system validation successful across 3 community zones.',
            smsDelivery: { sent: 287, delivered: 285, failed: 2 },
            sirenActivated: true, status: 'resolved', resolvedAt: '2026-02-23T12:00:00Z', resolvedBy: 'Aisha Bukar',
        },
    ];
}

function fieldReportToAlert(input: {
    nodeId: string;
    nodeName: string;
    location: string;
    publicCode?: string;
    report: FieldReportKind;
}): AlertEvent {
    const sensorId = input.publicCode ?? input.nodeId.slice(0, 8).toUpperCase();
    const base = {
        id: `AH-FR-${Date.now()}`,
        timestamp: new Date().toISOString(),
        relativeTime: 'Just now',
        sensorId,
        sensorName: input.nodeName,
        sirenActivated: false,
        status: 'acknowledged' as const,
    };

    switch (input.report) {
        case 'nominal':
            return {
                ...base,
                type: 'anomaly',
                severity: 'info',
                message: `Data Scout — ${input.nodeName} (${input.location}): hardware check **nominal**. Field report synced to command center.`,
            };
        case 'battery':
            return {
                ...base,
                type: 'low_battery',
                severity: 'warning',
                message: `Data Scout — ${input.nodeName}: **battery degraded / swollen** reported from the field. Maintenance queued for review.`,
            };
        case 'silt':
            return {
                ...base,
                type: 'equipment_failure',
                severity: 'warning',
                message: `Data Scout — ${input.nodeName}: **sensor fouled (silt/mud)**. Cleaning or recalibration may be required.`,
            };
    }
}

export function AlertHistoryProvider({ children }: { children: ReactNode }) {
    const [alerts, setAlerts] = useState<AlertEvent[]>(buildAlertHistory);
    const injectRef = useRef(false);

    const recordFieldReport = useCallback(
        (input: {
            nodeId: string;
            nodeName: string;
            location: string;
            publicCode?: string;
            report: FieldReportKind;
        }) => {
            const entry = fieldReportToAlert(input);
            setAlerts((prev) => [entry, ...prev]);
        },
        [],
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            if (injectRef.current) return;
            injectRef.current = true;

            const liveAlert: AlertEvent = {
                id: `AH-LIVE-${Date.now()}`,
                timestamp: new Date().toISOString(),
                relativeTime: 'Just now',
                sensorId: 'SN-004',
                sensorName: 'Alau Dam Monitor',
                type: 'flood_warning',
                severity: 'critical',
                message:
                    '⚡ LIVE — TinyML anomaly confirmed. Clearance dropped to 0.7m (Critical threshold < 0.8m). Autonomous SMS blast and siren activation triggered.',
                smsDelivery: { sent: 847, delivered: 790, failed: 0, pending: 57 },
                sirenActivated: true,
                status: 'active',
            };

            setAlerts((prev) => [liveAlert, ...prev]);
            toast.warning('New critical alert', {
                description: 'Alau Dam Monitor — check notifications or Alert history.',
                duration: 8000,
            });
        }, 15000);

        return () => clearTimeout(timer);
    }, []);

    const stats = useMemo((): AlertStats => ({
        totalAlerts: alerts.length,
        totalSmsSent: alerts.reduce((a, e) => a + (e.smsDelivery?.sent ?? 0), 0),
        totalSmsDelivered: alerts.reduce((a, e) => a + (e.smsDelivery?.delivered ?? 0), 0),
        avgResponseMin: 4.2,
        sirensActivated: alerts.filter((a) => a.sirenActivated).length,
        activeAlerts: alerts.filter((a) => a.status === 'active').length,
    }), [alerts]);

    const value = useMemo(
        () => ({ alerts, stats, recordFieldReport }),
        [alerts, stats, recordFieldReport],
    );

    return (
        <AlertHistoryContext.Provider value={value}>
            {children}
        </AlertHistoryContext.Provider>
    );
}

export function useAlertHistory() {
    const ctx = useContext(AlertHistoryContext);
    if (!ctx) {
        throw new Error('useAlertHistory must be used within AlertHistoryProvider');
    }
    return ctx;
}
