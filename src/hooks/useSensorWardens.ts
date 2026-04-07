import { useState } from 'react';

// ── Types ──────────────────────────────────────────────────────
export interface SensorWarden {
    id: string;
    name: string;
    age: number;
    gender: 'male' | 'female';
    location: string;
    phone: string;
    assignedNodes: string[];
    trainingStatus: 'completed' | 'in_progress' | 'pending';
    trainingModules: { name: string; completed: boolean }[];
    onboardDate: string;
    lastCheckIn: string;
    payoutStatus: 'paid' | 'pending' | 'overdue';
    /** Year-to-date gig payouts (task/dispatch based). */
    ytdPayout: number;
    incidentsReported: number;
    maintenanceCompleted: number;
}

export interface WardenStats {
    totalWardens: number;
    trainingCompleted: number;
    trainingInProgress: number;
    trainingPending: number;
    nodesCovered: number;
    totalNodes: number;
    /** Monthly gig dispatch pool (not a salary). */
    monthlyTaskPool: number;
    /** Total disbursed YTD across task/dispatch payouts (grant narrative metric). */
    totalDisbursed: number;
    totalIncidents: number;
    totalMaintenance: number;
}

// ── Mock Wardens ───────────────────────────────────────────────
const trainingModules = [
    'IoT Hardware Basics',
    'Solar Panel Maintenance',
    'LoRaWAN Troubleshooting',
    'Community Alert Protocols',
    'Data Reporting via SMS',
];

const TASK_PAYOUT_NGN = 12_000;

function calcYtdPayout(warden: Pick<SensorWarden, 'incidentsReported' | 'maintenanceCompleted'>): number {
  const tasks = Math.max(0, warden.incidentsReported) + Math.max(0, warden.maintenanceCompleted);
  return tasks * TASK_PAYOUT_NGN;
}

const buildWardens = (): SensorWarden[] => [
    {
        id: 'SW-001', name: 'Ibrahim Musa', age: 24, gender: 'male',
        location: 'Monday Market, Maiduguri', phone: '+234 803 XXX 1001',
        assignedNodes: ['SN-001'], trainingStatus: 'completed',
        trainingModules: trainingModules.map(m => ({ name: m, completed: true })),
        onboardDate: '2026-01-15', lastCheckIn: '2026-03-06',
        payoutStatus: 'paid', ytdPayout: 96_000,
        incidentsReported: 3, maintenanceCompleted: 5,
    },
    {
        id: 'SW-002', name: 'Aisha Bukar', age: 22, gender: 'female',
        location: 'Gwange Ward, Maiduguri', phone: '+234 803 XXX 1002',
        assignedNodes: ['SN-002'], trainingStatus: 'completed',
        trainingModules: trainingModules.map(m => ({ name: m, completed: true })),
        onboardDate: '2026-01-18', lastCheckIn: '2026-03-06',
        payoutStatus: 'paid', ytdPayout: 48_000,
        incidentsReported: 2, maintenanceCompleted: 2,
    },
    {
        id: 'SW-003', name: 'Mohammed Yusuf', age: 27, gender: 'male',
        location: 'Lagos Street, Maiduguri', phone: '+234 803 XXX 1003',
        assignedNodes: ['SN-003'], trainingStatus: 'completed',
        trainingModules: trainingModules.map(m => ({ name: m, completed: true })),
        onboardDate: '2026-01-20', lastCheckIn: '2026-03-05',
        payoutStatus: 'paid', ytdPayout: 36_000,
        incidentsReported: 1, maintenanceCompleted: 2,
    },
    {
        id: 'SW-004', name: 'Fatima Ali', age: 21, gender: 'female',
        location: 'Alau Village', phone: '+234 803 XXX 1004',
        assignedNodes: ['SN-004'], trainingStatus: 'completed',
        trainingModules: trainingModules.map(m => ({ name: m, completed: true })),
        onboardDate: '2026-01-10', lastCheckIn: '2026-03-06',
        payoutStatus: 'paid', ytdPayout: 60_000,
        incidentsReported: 3, maintenanceCompleted: 2,
    },
    {
        id: 'SW-005', name: 'Usman Babagana', age: 25, gender: 'male',
        location: 'Jere LGA', phone: '+234 803 XXX 1005',
        assignedNodes: ['SN-005'], trainingStatus: 'in_progress',
        trainingModules: trainingModules.map((m, i) => ({ name: m, completed: i < 3 })),
        onboardDate: '2026-02-01', lastCheckIn: '2026-03-04',
        payoutStatus: 'pending', ytdPayout: 24_000,
        incidentsReported: 0, maintenanceCompleted: 2,
    },
    {
        id: 'SW-006', name: 'Halima Suleiman', age: 23, gender: 'female',
        location: 'Konduga', phone: '+234 803 XXX 1006',
        assignedNodes: ['SN-006'], trainingStatus: 'completed',
        trainingModules: trainingModules.map(m => ({ name: m, completed: true })),
        onboardDate: '2026-01-25', lastCheckIn: '2026-03-06',
        payoutStatus: 'paid', ytdPayout: 48_000,
        incidentsReported: 1, maintenanceCompleted: 3,
    },
    {
        id: 'SW-007', name: 'Abdullahi Mala', age: 28, gender: 'male',
        location: 'Dikwa', phone: '+234 803 XXX 1007',
        assignedNodes: ['SN-007'], trainingStatus: 'completed',
        trainingModules: trainingModules.map(m => ({ name: m, completed: true })),
        onboardDate: '2026-02-05', lastCheckIn: '2026-03-05',
        payoutStatus: 'paid', ytdPayout: 24_000,
        incidentsReported: 1, maintenanceCompleted: 1,
    },
    {
        id: 'SW-008', name: 'Zainab Kyari', age: 20, gender: 'female',
        location: 'Bama LGA', phone: '+234 803 XXX 1008',
        assignedNodes: ['SN-008'], trainingStatus: 'in_progress',
        trainingModules: trainingModules.map((m, i) => ({ name: m, completed: i < 2 })),
        onboardDate: '2026-02-10', lastCheckIn: '2026-03-03',
        payoutStatus: 'pending', ytdPayout: 24_000,
        incidentsReported: 0, maintenanceCompleted: 2,
    },
    {
        id: 'SW-009', name: 'Abubakar Shehu', age: 26, gender: 'male',
        location: 'Marte LGA', phone: '+234 803 XXX 1009',
        assignedNodes: ['SN-010'], trainingStatus: 'completed',
        trainingModules: trainingModules.map(m => ({ name: m, completed: true })),
        onboardDate: '2026-02-15', lastCheckIn: '2026-03-06',
        payoutStatus: 'paid', ytdPayout: 36_000,
        incidentsReported: 1, maintenanceCompleted: 2,
    },
    {
        id: 'SW-010', name: 'Garba Umar', age: 19, gender: 'male',
        location: 'Gwoza Valley Checkpoint', phone: '+234 803 XXX 1010',
        assignedNodes: ['HS-GWOZA-012'], trainingStatus: 'pending',
        trainingModules: trainingModules.map(m => ({ name: m, completed: false })),
        onboardDate: '2026-02-20', lastCheckIn: '—',
        payoutStatus: 'overdue', ytdPayout: 0,
        incidentsReported: 0, maintenanceCompleted: 0,
    },
];

// ── Hook ───────────────────────────────────────────────────────
export function useSensorWardens() {
    const [wardens] = useState<SensorWarden[]>(buildWardens);

    const stats: WardenStats = {
        totalWardens: wardens.length,
        trainingCompleted: wardens.filter(w => w.trainingStatus === 'completed').length,
        trainingInProgress: wardens.filter(w => w.trainingStatus === 'in_progress').length,
        trainingPending: wardens.filter(w => w.trainingStatus === 'pending').length,
        /** Sum of assigned field nodes (10/10 when every warden holds one channel). */
        nodesCovered: wardens.reduce((a, w) => a + w.assignedNodes.length, 0),
        totalNodes: 10,
        monthlyTaskPool: 450_000,
        totalDisbursed: 342_000,
        totalIncidents: wardens.reduce((a, w) => a + w.incidentsReported, 0),
        totalMaintenance: wardens.reduce((a, w) => a + w.maintenanceCompleted, 0),
    };

    return { wardens, stats };
}
