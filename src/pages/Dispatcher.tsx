import { useState } from 'react';
import {
  ClipboardList,
  Plus,
  Eye,
  AlertTriangle,
  Clock,
  CheckCircle,
  Filter,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useWorkOrders, issueTypeOptions, locationOptions, type Priority, type WorkOrder } from '@/hooks/useWorkOrders';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const priorityConfig = {
  critical: {
    label: 'Critical',
    className: 'bg-rose-50 text-rose-700 border-rose-200'
  },
  high: {
    label: 'High',
    className: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  normal: {
    label: 'Normal',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }
};

const statusConfig = {
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'text-slate-500 bg-slate-50 border-slate-200'
  },
  dispatched: {
    label: 'Dispatched',
    icon: AlertTriangle,
    className: 'text-amber-700 bg-amber-50 border-amber-200'
  },
  resolved: {
    label: 'Resolved',
    icon: CheckCircle,
    className: 'text-emerald-700 bg-emerald-50 border-emerald-200'
  }
};

type FilterStatus = 'all' | 'pending' | 'dispatched' | 'resolved';

export default function Dispatcher() {
  const { toast } = useToast();
  const {
    workOrders,
    stats,
    createWorkOrder,
    dispatchWorkOrder,
    resolveWorkOrder,
    deleteWorkOrder
  } = useWorkOrders();

  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);

  // Form state for new ticket
  const [newTicket, setNewTicket] = useState({
    priority: 'normal' as Priority,
    issueType: '',
    location: '',
    estimatedCost: '',
    description: '',
  });

  const filteredOrders = filterStatus === 'all'
    ? workOrders
    : workOrders.filter(o => o.status === filterStatus);

  const formatCurrency = (amount: number) => {
    if (amount === 0) return '—';
    return `₦${amount.toLocaleString()}`;
  };

  const handleCreateTicket = () => {
    if (!newTicket.issueType || !newTicket.location || !newTicket.description) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const order = createWorkOrder({
      priority: newTicket.priority,
      issueType: newTicket.issueType,
      location: newTicket.location,
      estimatedCost: parseInt(newTicket.estimatedCost) || 0,
      description: newTicket.description,
    });

    toast({
      title: "✓ Ticket Created",
      description: `Work order ${order.ticketId} has been created.`,
      className: "bg-emerald-50 text-emerald-800 border-emerald-200",
    });

    setNewTicket({
      priority: 'normal',
      issueType: '',
      location: '',
      estimatedCost: '',
      description: '',
    });
    setIsCreateDialogOpen(false);
  };

  const handleDispatch = (orderId: string) => {
    const provider = dispatchWorkOrder(orderId);
    const order = workOrders.find(o => o.id === orderId);

    toast({
      title: "✓ Team Dispatched",
      description: `${order?.ticketId} assigned to ${provider}`,
      className: "bg-emerald-50 text-emerald-800 border-emerald-200",
    });
    setSelectedOrder(null);
  };

  const handleResolve = (orderId: string) => {
    resolveWorkOrder(orderId);
    const order = workOrders.find(o => o.id === orderId);

    toast({
      title: "✓ Issue Resolved",
      description: `${order?.ticketId} marked as resolved.`,
      className: "bg-emerald-50 text-emerald-800 border-emerald-200",
    });
    setSelectedOrder(null);
  };

  const handleDelete = (orderId: string) => {
    const order = workOrders.find(o => o.id === orderId);
    deleteWorkOrder(orderId);

    toast({
      title: "Ticket Deleted",
      description: `${order?.ticketId} has been removed.`,
    });
    setSelectedOrder(null);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-8 px-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
              <ClipboardList className="h-6 w-6 text-[#005587]" />
              Work Order Management System
            </h1>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1.5">
              Track and manage field operations across Borno State
            </p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#005587] hover:bg-[#00446b] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create New Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Work Order</DialogTitle>
                <DialogDescription>
                  Submit a new ticket for field operations.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Priority *</Label>
                    <Select
                      value={newTicket.priority}
                      onValueChange={(v) => setNewTicket(prev => ({ ...prev, priority: v as Priority }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Est. Cost (NGN)</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 50000"
                      value={newTicket.estimatedCost}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, estimatedCost: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Issue Type *</Label>
                  <Select
                    value={newTicket.issueType}
                    onValueChange={(v) => setNewTicket(prev => ({ ...prev, issueType: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select issue type" />
                    </SelectTrigger>
                    <SelectContent>
                      {issueTypeOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Location *</Label>
                  <Select
                    value={newTicket.location}
                    onValueChange={(v) => setNewTicket(prev => ({ ...prev, location: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locationOptions.map(loc => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Textarea
                    placeholder="Describe the issue in detail..."
                    value={newTicket.description}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleCreateTicket} className="bg-[#005587] hover:bg-[#00446b] text-white">
                  Create Ticket
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-px rounded-xl border border-slate-200 overflow-hidden bg-slate-200 shadow-sm">
          <div
            className={cn("bg-white p-5 flex flex-col justify-center gap-2 cursor-pointer transition-all hover:bg-slate-50", filterStatus === 'pending' && "ring-inset ring-2 ring-[#005587]")}
            onClick={() => setFilterStatus(filterStatus === 'pending' ? 'all' : 'pending')}
          >
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-500" />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pending</p>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats.totalPending}</p>
          </div>

          <div
            className={cn("bg-white p-5 flex flex-col justify-center gap-2 cursor-pointer transition-all hover:bg-slate-50", filterStatus === 'dispatched' && "ring-inset ring-2 ring-amber-500")}
            onClick={() => setFilterStatus(filterStatus === 'dispatched' ? 'all' : 'dispatched')}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">In Progress</p>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats.totalDispatched}</p>
          </div>

          <div
            className={cn("bg-white p-5 flex flex-col justify-center gap-2 cursor-pointer transition-all hover:bg-slate-50", filterStatus === 'resolved' && "ring-inset ring-2 ring-emerald-500")}
            onClick={() => setFilterStatus(filterStatus === 'resolved' ? 'all' : 'resolved')}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Resolved</p>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats.totalResolved}</p>
          </div>

          <div className="bg-white p-5 flex flex-col justify-center gap-2">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-[#005587]" />
              <p className="text-[10px] font-bold text-[#005587] uppercase tracking-widest">Total Budget</p>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">₦{(stats.totalCost / 1000).toFixed(0)}K</p>
          </div>
        </div>

        {/* Work Orders Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {filterStatus === 'all' ? 'All Work Orders' : `${statusConfig[filterStatus].label} Orders`}
              <span className="ml-2 text-[10px] uppercase font-bold tracking-widest text-[#005587] bg-sky-50 px-2 py-1 rounded">
                {filteredOrders.length} {filteredOrders.length === 1 ? 'ticket' : 'tickets'}
              </span>
            </h2>
            <div className="flex gap-2">
              {filterStatus !== 'all' && (
                <Button variant="ghost" size="sm" onClick={() => setFilterStatus('all')}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Show All
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                    All Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('pending')}>
                    Pending Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('dispatched')}>
                    Dispatched Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('resolved')}>
                    Resolved Only
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow className="border-b border-slate-200">
                    <TableHead className="w-[120px] text-[10px] uppercase font-bold tracking-widest text-slate-500">Ticket ID</TableHead>
                    <TableHead className="w-[100px] text-[10px] uppercase font-bold tracking-widest text-slate-500">Priority</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Issue Type</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Location</TableHead>
                    <TableHead className="w-[100px] text-[10px] uppercase font-bold tracking-widest text-slate-500">Est. Cost</TableHead>
                    <TableHead className="w-[120px] text-[10px] uppercase font-bold tracking-widest text-slate-500">Status</TableHead>
                    <TableHead className="w-[100px] text-[10px] uppercase font-bold tracking-widest text-slate-500 text-right pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                        No work orders found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => {
                      const priority = priorityConfig[order.priority];
                      const status = statusConfig[order.status];
                      const StatusIcon = status.icon;

                      return (
                        <TableRow key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <TableCell className="font-mono text-sm font-semibold text-slate-700">
                            {order.ticketId}
                          </TableCell>
                          <TableCell>
                            <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border", priority.className)}>
                              {priority.label}
                            </span>
                          </TableCell>
                          <TableCell className="font-bold text-slate-900">{order.issueType}</TableCell>
                          <TableCell className="text-sm font-medium text-slate-600">{order.location}</TableCell>
                          <TableCell className="font-bold text-slate-900">
                            {formatCurrency(order.estimatedCost)}
                          </TableCell>
                          <TableCell>
                            <span className={cn(
                              "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border",
                              status.className
                            )}>
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </span>
                          </TableCell>
                          <TableCell className="text-right pr-4">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedOrder(order)}
                                  className="text-[#005587] hover:text-[#00446b] hover:bg-sky-50"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <span className="font-mono font-bold tracking-tight">{order.ticketId}</span>
                                    <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border", priority.className)}>
                                      {priority.label}
                                    </span>
                                  </DialogTitle>
                                  <DialogDescription className="text-left pt-5 space-y-5">
                                    <div>
                                      <p className="text-[10px] uppercase font-bold tracking-widest text-[#005587] mb-1">Issue Type</p>
                                      <p className="text-sm font-bold text-slate-900">{order.issueType}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] uppercase font-bold tracking-widest text-[#005587] mb-1">Location</p>
                                      <p className="text-sm font-medium text-slate-700">{order.location}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] uppercase font-bold tracking-widest text-[#005587] mb-1">Description</p>
                                      <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">{order.description}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-0.5">Est. Cost</p>
                                        <p className="text-base font-extrabold text-slate-900">{formatCurrency(order.estimatedCost)}</p>
                                      </div>
                                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-0.5">Created</p>
                                        <p className="text-sm font-medium text-slate-700">{order.createdAt}</p>
                                      </div>
                                    </div>
                                    {order.assignedTo && (
                                      <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                        <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-700 mb-0.5">Assigned To</p>
                                        <p className="text-sm font-bold text-emerald-900">{order.assignedTo}</p>
                                      </div>
                                    )}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="flex gap-3 pt-5 border-t border-slate-100 mt-2">
                                  {order.status === 'pending' && (
                                    <Button
                                      className="flex-1 bg-[#005587] hover:bg-[#00446b] text-white"
                                      onClick={() => handleDispatch(order.id)}
                                    >
                                      <AlertTriangle className="h-4 w-4 mr-2" />
                                      Dispatch Team
                                    </Button>
                                  )}
                                  {order.status === 'dispatched' && (
                                    <Button
                                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                      onClick={() => handleResolve(order.id)}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Mark Resolved
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                                    onClick={() => handleDelete(order.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
