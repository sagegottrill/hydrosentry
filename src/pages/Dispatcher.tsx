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
import { toast as sonnerToast } from 'sonner';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PageHeader } from '@/components/dashboard/PageHeader';
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
      <div className="dashboard-shell">
        <PageHeader
          variant="compact"
          icon={ClipboardList}
          title="Work orders"
          actions={
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                New ticket
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
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                <Button onClick={handleCreateTicket} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Create ticket
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          }
        />

        <div className="stat-grid">
          <div
            className={cn(
              'stat-tile cursor-pointer transition-colors hover:bg-muted/25',
              filterStatus === 'pending' && 'ring-2 ring-primary/25 ring-inset',
            )}
            onClick={() => setFilterStatus(filterStatus === 'pending' ? 'all' : 'pending')}
          >
            <div className="stat-tile-head">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p className="stat-tile-label">Pending</p>
            </div>
            <p className="stat-tile-value text-foreground">{stats.totalPending}</p>
          </div>

          <div
            className={cn(
              'stat-tile cursor-pointer transition-colors hover:bg-muted/25',
              filterStatus === 'dispatched' && 'ring-2 ring-amber-400/35 ring-inset',
            )}
            onClick={() => setFilterStatus(filterStatus === 'dispatched' ? 'all' : 'dispatched')}
          >
            <div className="stat-tile-head">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <p className="stat-tile-label text-amber-800/90">In progress</p>
            </div>
            <p className="stat-tile-value text-foreground">{stats.totalDispatched}</p>
          </div>

          <div
            className={cn(
              'stat-tile cursor-pointer transition-colors hover:bg-muted/25',
              filterStatus === 'resolved' && 'ring-2 ring-emerald-400/35 ring-inset',
            )}
            onClick={() => setFilterStatus(filterStatus === 'resolved' ? 'all' : 'resolved')}
          >
            <div className="stat-tile-head">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <p className="stat-tile-label text-emerald-800/90">Resolved</p>
            </div>
            <p className="stat-tile-value text-foreground">{stats.totalResolved}</p>
          </div>

          <div className="stat-tile">
            <div className="stat-tile-head">
              <ClipboardList className="h-4 w-4 text-primary" />
              <p className="stat-tile-label text-primary">Total budget</p>
            </div>
            <p className="stat-tile-value text-foreground">₦{(stats.totalCost / 1000).toFixed(0)}K</p>
          </div>
        </div>

        <div className="dashboard-card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 p-4 sm:p-5">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              {filterStatus === 'all' ? 'All tickets' : `${statusConfig[filterStatus].label} orders`}
              <span className="ml-2 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
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
            <div className="table-scroll overflow-x-auto">
              <Table>
                <TableHeader className="sticky top-0 z-[1] bg-muted/40 backdrop-blur-sm">
                  <TableRow className="border-b border-border">
                    <TableHead className="w-[120px] text-xs font-medium text-muted-foreground">Ticket ID</TableHead>
                    <TableHead className="w-[100px] text-xs font-medium text-muted-foreground">Priority</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">Issue type</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">Location</TableHead>
                    <TableHead className="w-[100px] text-xs font-medium text-muted-foreground">Est. cost</TableHead>
                    <TableHead className="w-[120px] text-xs font-medium text-muted-foreground">Status</TableHead>
                    <TableHead className="w-[100px] pr-6 text-right text-xs font-medium text-muted-foreground">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                        No work orders found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => {
                      const priority = priorityConfig[order.priority];
                      const status = statusConfig[order.status];
                      const StatusIcon = status.icon;

                      return (
                        <TableRow key={order.id} className="border-b border-border/60 hover:bg-muted/30">
                          <TableCell className="font-mono text-sm font-medium text-foreground">
                            {order.ticketId}
                          </TableCell>
                          <TableCell>
                            <span className={cn('rounded-md border px-2 py-0.5 text-xs font-medium', priority.className)}>
                              {priority.label}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium text-foreground">{order.issueType}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{order.location}</TableCell>
                          <TableCell className="font-medium text-foreground">
                            {formatCurrency(order.estimatedCost)}
                          </TableCell>
                          <TableCell>
                            <span className={cn(
                              'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium',
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
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    sonnerToast.message('Work order', {
                                      description: `${order.ticketId} — detail panel opened.`,
                                    });
                                  }}
                                  className="text-primary hover:bg-primary/10 hover:text-primary"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <span className="font-mono font-bold tracking-tight">{order.ticketId}</span>
                                    <span className={cn('rounded-md border px-2 py-0.5 text-xs font-medium', priority.className)}>
                                      {priority.label}
                                    </span>
                                  </DialogTitle>
                                  <DialogDescription className="space-y-5 pt-5 text-left">
                                    <div>
                                      <p className="mb-1 text-xs font-medium text-primary">Issue type</p>
                                      <p className="text-sm font-semibold text-foreground">{order.issueType}</p>
                                    </div>
                                    <div>
                                      <p className="mb-1 text-xs font-medium text-primary">Location</p>
                                      <p className="text-sm text-muted-foreground">{order.location}</p>
                                    </div>
                                    <div>
                                      <p className="mb-1 text-xs font-medium text-primary">Description</p>
                                      <p className="rounded-lg border border-border bg-muted/25 p-4 text-sm leading-relaxed text-foreground">{order.description}</p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                      <div className="rounded-lg border border-border bg-muted/20 p-3">
                                        <p className="mb-0.5 text-xs text-muted-foreground">Est. cost</p>
                                        <p className="text-base font-bold tabular-nums text-foreground">{formatCurrency(order.estimatedCost)}</p>
                                      </div>
                                      <div className="rounded-lg border border-border bg-muted/20 p-3">
                                        <p className="mb-0.5 text-xs text-muted-foreground">Created</p>
                                        <p className="text-sm text-foreground">{order.createdAt}</p>
                                      </div>
                                    </div>
                                    {order.assignedTo && (
                                      <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-3">
                                        <p className="mb-0.5 text-xs font-medium text-emerald-800">Assigned to</p>
                                        <p className="text-sm font-semibold text-emerald-900">{order.assignedTo}</p>
                                      </div>
                                    )}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="mt-2 flex gap-3 border-t border-border pt-5">
                                  {order.status === 'pending' && (
                                    <Button
                                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
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
