import { useState } from 'react';
import { 
  ClipboardList, 
  Plus, 
  Eye, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { cn } from '@/lib/utils';

type Priority = 'critical' | 'high' | 'normal';
type Status = 'pending' | 'dispatched' | 'resolved';

interface WorkOrder {
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

// Mock work orders data
const mockWorkOrders: WorkOrder[] = [
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

const priorityConfig = {
  critical: { 
    label: 'Critical', 
    className: 'bg-destructive text-destructive-foreground' 
  },
  high: { 
    label: 'High', 
    className: 'bg-warning text-warning-foreground' 
  },
  normal: { 
    label: 'Normal', 
    className: 'bg-primary text-primary-foreground' 
  }
};

const statusConfig = {
  pending: { 
    label: 'Pending', 
    icon: Clock,
    className: 'text-muted-foreground bg-muted' 
  },
  dispatched: { 
    label: 'Dispatched', 
    icon: AlertTriangle,
    className: 'text-warning bg-warning/10' 
  },
  resolved: { 
    label: 'Resolved', 
    icon: CheckCircle,
    className: 'text-success bg-success/10' 
  }
};

export default function Dispatcher() {
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);

  const formatCurrency = (amount: number) => {
    if (amount === 0) return '—';
    return `₦${amount.toLocaleString()}`;
  };

  const totalPending = mockWorkOrders.filter(o => o.status === 'pending').length;
  const totalDispatched = mockWorkOrders.filter(o => o.status === 'dispatched').length;
  const totalCost = mockWorkOrders.reduce((sum, o) => sum + o.estimatedCost, 0);

  return (
    <DashboardLayout>
    <div className="min-h-screen bg-secondary/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ClipboardList className="h-7 w-7 text-primary" />
              Work Order Management System
            </h1>
            <p className="text-muted-foreground mt-1">
              Track and manage field operations across Borno State
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Create New Ticket
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Orders</p>
                  <p className="text-3xl font-bold text-foreground">{totalPending}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-3xl font-bold text-foreground">{totalDispatched}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Est. Budget</p>
                  <p className="text-3xl font-bold text-foreground">₦{(totalCost / 1000).toFixed(0)}K</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <ClipboardList className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Work Orders Table */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Active Work Orders</CardTitle>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Ticket ID</TableHead>
                    <TableHead className="w-[100px]">Priority</TableHead>
                    <TableHead>Issue Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="w-[100px]">Est. Cost</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[100px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockWorkOrders.map((order) => {
                    const priority = priorityConfig[order.priority];
                    const status = statusConfig[order.status];
                    const StatusIcon = status.icon;
                    
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm font-medium">
                          {order.ticketId}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("text-xs", priority.className)}>
                            {priority.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{order.issueType}</TableCell>
                        <TableCell className="text-muted-foreground">{order.location}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(order.estimatedCost)}
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                            status.className
                          )}>
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSelectedOrder(order)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <span className="font-mono">{order.ticketId}</span>
                                  <Badge className={cn("text-xs", priority.className)}>
                                    {priority.label}
                                  </Badge>
                                </DialogTitle>
                                <DialogDescription className="text-left pt-4 space-y-4">
                                  <div>
                                    <p className="text-sm font-medium text-foreground">Issue Type</p>
                                    <p className="text-muted-foreground">{order.issueType}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-foreground">Location</p>
                                    <p className="text-muted-foreground">{order.location}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-foreground">Description</p>
                                    <p className="text-muted-foreground">{order.description}</p>
                                  </div>
                                  <div className="flex gap-8">
                                    <div>
                                      <p className="text-sm font-medium text-foreground">Est. Cost</p>
                                      <p className="text-muted-foreground">{formatCurrency(order.estimatedCost)}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-foreground">Created</p>
                                      <p className="text-muted-foreground">{order.createdAt}</p>
                                    </div>
                                  </div>
                                  {order.assignedTo && (
                                    <div>
                                      <p className="text-sm font-medium text-foreground">Assigned To</p>
                                      <p className="text-muted-foreground">{order.assignedTo}</p>
                                    </div>
                                  )}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex gap-2 pt-4">
                                {order.status === 'pending' && (
                                  <Button className="flex-1 bg-primary hover:bg-primary/90">
                                    Dispatch Team
                                  </Button>
                                )}
                                {order.status === 'dispatched' && (
                                  <Button className="flex-1 bg-success hover:bg-success/90">
                                    Mark Resolved
                                  </Button>
                                )}
                                <Button variant="outline" className="flex-1">
                                  Edit Details
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </DashboardLayout>
  );
}
