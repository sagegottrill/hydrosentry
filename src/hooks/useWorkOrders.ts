import { useState, useCallback } from 'react';

export type Priority = 'critical' | 'high' | 'normal';
export type Status = 'pending' | 'dispatched' | 'resolved';
export type IssueType = 'waste-blockage' | 'borehole-repair' | 'herder-trespass' | 'drainage-inspection' | 'conflict-mediation' | 'pump-failure';

export interface WorkOrder {
  id: string;
  ticketId: string;
  priority: Priority;
  issueType: string;
  location: string;
  estimatedCost: number;
  status: Status;
  createdAt: string;
  description: string;
  assignedTo?: string;
}

export interface CreateWorkOrderInput {
  priority: Priority;
  issueType: string;
  location: string;
  estimatedCost: number;
  description: string;
}

// Initial mock data - structured for easy Supabase migration
const initialWorkOrders: WorkOrder[] = [
  {
    id: '1',
    ticketId: '#WRK-2026-88',
    priority: 'critical',
    issueType: 'Waste Blockage',
    location: 'Ngadda River Bridge',
    estimatedCost: 120000,
    status: 'pending',
    createdAt: '2026-01-28',
    description: 'Major solid waste accumulation blocking primary drainage channel. Risk of flooding to Monday Market area.'
  },
  {
    id: '2',
    ticketId: '#WRK-2026-87',
    priority: 'high',
    issueType: 'Borehole Pump Failure',
    location: 'Jere IDP Camp',
    estimatedCost: 45000,
    status: 'dispatched',
    createdAt: '2026-01-27',
    description: 'Water pump motor burned out. Camp population of 2,400 affected.',
    assignedTo: 'Musa Technical Services'
  },
  {
    id: '3',
    ticketId: '#WRK-2026-86',
    priority: 'critical',
    issueType: 'Herder Trespass Alert',
    location: 'Yelwata Sector',
    estimatedCost: 0,
    status: 'pending',
    createdAt: '2026-01-27',
    description: 'Security alert: Fulani herder groups detected near farming communities. CRPD Score: 9.2/10.'
  },
  {
    id: '4',
    ticketId: '#WRK-2026-85',
    priority: 'normal',
    issueType: 'Drainage Inspection',
    location: 'Gwange Ward 3',
    estimatedCost: 15000,
    status: 'resolved',
    createdAt: '2026-01-26',
    description: 'Routine quarterly inspection of drainage channels completed.',
    assignedTo: 'BOSEPA Field Team'
  },
  {
    id: '5',
    ticketId: '#WRK-2026-84',
    priority: 'high',
    issueType: 'Borehole Repair',
    location: 'Pulka Zone C',
    estimatedCost: 85000,
    status: 'dispatched',
    createdAt: '2026-01-25',
    description: 'Complete pump replacement required. Parts sourced from Maiduguri.',
    assignedTo: 'WaterAid Nigeria'
  },
  {
    id: '6',
    ticketId: '#WRK-2026-83',
    priority: 'normal',
    issueType: 'Conflict Mediation',
    location: 'Alau Dam Spillway',
    estimatedCost: 25000,
    status: 'pending',
    createdAt: '2026-01-24',
    description: 'Scheduled mediation session between farming communities and pastoralist groups.'
  }
];

// Service providers for dispatching
const serviceProviders = [
  'BOSEPA Field Team',
  'Musa Technical Services',
  'WaterAid Nigeria',
  'UNICEF Emergency Response',
  'State Security Unit',
  'Ministry of Environment'
];

export function useWorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(initialWorkOrders);
  const [nextTicketNumber, setNextTicketNumber] = useState(89);

  // Generate next ticket ID
  const generateTicketId = useCallback(() => {
    const ticketId = `#WRK-2026-${nextTicketNumber}`;
    setNextTicketNumber(prev => prev + 1);
    return ticketId;
  }, [nextTicketNumber]);

  // Create new work order
  const createWorkOrder = useCallback((input: CreateWorkOrderInput) => {
    const newOrder: WorkOrder = {
      id: Date.now().toString(),
      ticketId: generateTicketId(),
      priority: input.priority,
      issueType: input.issueType,
      location: input.location,
      estimatedCost: input.estimatedCost,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      description: input.description,
    };

    setWorkOrders(prev => [newOrder, ...prev]);
    return newOrder;
  }, [generateTicketId]);

  // Dispatch a work order
  const dispatchWorkOrder = useCallback((orderId: string) => {
    const randomProvider = serviceProviders[Math.floor(Math.random() * serviceProviders.length)];
    
    setWorkOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: 'dispatched' as Status, assignedTo: randomProvider }
        : order
    ));

    return randomProvider;
  }, []);

  // Mark as resolved
  const resolveWorkOrder = useCallback((orderId: string) => {
    setWorkOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: 'resolved' as Status }
        : order
    ));
  }, []);

  // Update work order
  const updateWorkOrder = useCallback((orderId: string, updates: Partial<WorkOrder>) => {
    setWorkOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, ...updates }
        : order
    ));
  }, []);

  // Delete work order
  const deleteWorkOrder = useCallback((orderId: string) => {
    setWorkOrders(prev => prev.filter(order => order.id !== orderId));
  }, []);

  // Computed stats
  const stats = {
    totalPending: workOrders.filter(o => o.status === 'pending').length,
    totalDispatched: workOrders.filter(o => o.status === 'dispatched').length,
    totalResolved: workOrders.filter(o => o.status === 'resolved').length,
    totalCost: workOrders.reduce((sum, o) => sum + o.estimatedCost, 0),
  };

  return {
    workOrders,
    stats,
    createWorkOrder,
    dispatchWorkOrder,
    resolveWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
    // Future: Replace with Supabase queries
    isLoading: false,
    error: null,
  };
}

// Issue type options for forms
export const issueTypeOptions = [
  { value: 'Waste Blockage', label: 'Waste Blockage' },
  { value: 'Borehole Repair', label: 'Borehole Repair' },
  { value: 'Borehole Pump Failure', label: 'Borehole Pump Failure' },
  { value: 'Herder Trespass Alert', label: 'Herder Trespass Alert' },
  { value: 'Drainage Inspection', label: 'Drainage Inspection' },
  { value: 'Conflict Mediation', label: 'Conflict Mediation' },
  { value: 'Infrastructure Damage', label: 'Infrastructure Damage' },
  { value: 'Water Contamination', label: 'Water Contamination' },
];

// Location options for forms
export const locationOptions = [
  'Ngadda River Bridge',
  'Monday Market',
  'Gwange Ward 1',
  'Gwange Ward 2', 
  'Gwange Ward 3',
  'Jere IDP Camp',
  'Pulka Zone A',
  'Pulka Zone B',
  'Pulka Zone C',
  'Yelwata Sector',
  'Alau Dam Spillway',
  'Maiduguri Central',
  'Konduga',
  'Bama',
  'Gwoza LGA',
];
