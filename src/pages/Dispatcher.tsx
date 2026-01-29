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
    className: 'bg-destructive text-destructive-foreground font-bold' 
  },
  high: { 
    label: 'High', 
    className: 'bg-warning text-warning-foreground font-bold' 
  },
  normal: { 
    label: 'Normal', 
    className: 'bg-primary text-primary-foreground font-semibold' 
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
      className: "bg-success text-success-foreground border-success",
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
      className: "bg-success text-success-foreground border-success",
    });
    setSelectedOrder(null);
  };

  const handleResolve = (orderId: string) => {
    resolveWorkOrder(orderId);
    const order = workOrders.find(o => o.id === orderId);
    
    toast({
      title: "✓ Issue Resolved",
      description: `${order?.ticketId} marked as resolved.`,
      className: "bg-success text-success-foreground border-success",
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
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
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
                  <Button onClick={handleCreateTicket} className="bg-primary hover:bg-primary/90">
                    Create Ticket
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card 
              className={cn("cursor-pointer transition-all", filterStatus === 'pending' && "ring-2 ring-destructive")}
              onClick={() => setFilterStatus(filterStatus === 'pending' ? 'all' : 'pending')}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-3xl font-bold text-foreground">{stats.totalPending}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-destructive" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card 
              className={cn("cursor-pointer transition-all", filterStatus === 'dispatched' && "ring-2 ring-warning")}
              onClick={() => setFilterStatus(filterStatus === 'dispatched' ? 'all' : 'dispatched')}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-3xl font-bold text-foreground">{stats.totalDispatched}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-warning" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card 
              className={cn("cursor-pointer transition-all", filterStatus === 'resolved' && "ring-2 ring-success")}
              onClick={() => setFilterStatus(filterStatus === 'resolved' ? 'all' : 'resolved')}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Resolved</p>
                    <p className="text-3xl font-bold text-foreground">{stats.totalResolved}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Budget</p>
                    <p className="text-3xl font-bold text-foreground">₦{(stats.totalCost / 1000).toFixed(0)}K</p>
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
                <CardTitle className="text-lg">
                  {filterStatus === 'all' ? 'All Work Orders' : `${statusConfig[filterStatus].label} Orders`}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({filteredOrders.length} {filteredOrders.length === 1 ? 'ticket' : 'tickets'})
                  </span>
                </CardTitle>
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
                    {filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No work orders found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order) => {
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
                            <TableCell>{order.location}</TableCell>
                            <TableCell className="font-bold text-foreground">
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
                                      <Button 
                                        className="flex-1 bg-primary hover:bg-primary/90"
                                        onClick={() => handleDispatch(order.id)}
                                      >
                                        Dispatch Team
                                      </Button>
                                    )}
                                    {order.status === 'dispatched' && (
                                      <Button 
                                        className="flex-1 bg-success hover:bg-success/90"
                                        onClick={() => handleResolve(order.id)}
                                      >
                                        Mark Resolved
                                      </Button>
                                    )}
                                    <Button 
                                      variant="destructive" 
                                      size="icon"
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
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
