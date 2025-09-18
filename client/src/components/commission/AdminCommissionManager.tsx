import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { 
  DollarSign, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  Send,
  Unlock,
  Clock
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface DriverCommission {
  driverId: number;
  driverName: string;
  email: string;
  phone: string;
  totalEarnings: string;
  commissionOwed: string;
  commissionPaid: string;
  reminderCount: number;
  lastReminderSent?: string;
  isBlocked: boolean;
  blockedAt?: string;
  unblockedAt?: string;
  weeklyStartDate: string;
  isActive: boolean;
}

const AdminCommissionManager: React.FC = () => {
  const [selectedDriver, setSelectedDriver] = useState<DriverCommission | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const { toast } = useToast();


  const { data: driverCommissions, isLoading } = useQuery<DriverCommission[]>({
    queryKey: ['/api/commissions/admin/overview'],
    refetchInterval: 30000,
  });

  const sendRemindersMutation = useMutation({
    mutationFn: () => apiRequest('/api/commissions/admin/send-reminders', { method: 'POST' }),
    onSuccess: (data: any) => {
      toast({
        title: "Reminders Sent",
        description: `Processed ${data.totalProcessed} drivers. ${data.blocked} blocked, ${data.failed} failed.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/commissions/admin/all'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send reminders",
        variant: "destructive",
      });
    },
  });

  const processPaymentMutation = useMutation({
    mutationFn: (data: { driverId: number; paidAmount: number; adminId: number }) =>
      apiRequest('/api/commissions/admin/payment', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      }),
    onSuccess: (data: any) => {
      toast({
        title: "Payment Processed",
        description: `Payment of LKR ${data.paidAmount} processed successfully. ${data.isFullyPaid ? 'Driver unblocked.' : ''}`,
      });
      setIsPaymentDialogOpen(false);
      setPaymentAmount('');
      setSelectedDriver(null);
      queryClient.invalidateQueries({ queryKey: ['/api/commissions/admin/all'] });
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    },
  });

  const handleProcessPayment = () => {
    if (!selectedDriver || !paymentAmount) return;
    
    const amount = parseFloat(paymentAmount);
    if (amount <= 0 || amount > parseFloat(selectedDriver.commissionOwed)) {
      toast({
        title: "Invalid Amount",
        description: "Payment amount must be positive and not exceed commission owed",
        variant: "destructive",
      });
      return;
    }

    processPaymentMutation.mutate({
      driverId: selectedDriver.driverId,
      paidAmount: amount,
      adminId: 1, // In real app, get from current user session
    });
  };

  const totalDrivers = driverCommissions?.length || 0;
  const blockedDrivers = driverCommissions?.filter(d => d.isBlocked).length || 0;
  const totalCommissionOwed = driverCommissions?.reduce((sum, d) => sum + parseFloat(d.commissionOwed), 0) || 0;
  const totalCommissionPaid = driverCommissions?.reduce((sum, d) => sum + parseFloat(d.commissionPaid), 0) || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Commission Management</h2>
        <Button 
          onClick={() => sendRemindersMutation.mutate()}
          disabled={sendRemindersMutation.isPending}
        >
          <Send className="w-4 h-4 mr-2" />
          {sendRemindersMutation.isPending ? 'Sending...' : 'Send Weekly Reminders'}
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Drivers</p>
                <p className="text-2xl font-bold">{totalDrivers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Blocked Drivers</p>
                <p className="text-2xl font-bold text-red-600">{blockedDrivers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Owed</p>
                <p className="text-2xl font-bold text-red-600">
                  LKR {totalCommissionOwed.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">
                  LKR {totalCommissionPaid.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Driver Commission Table */}
      <Card>
        <CardHeader>
          <CardTitle>Driver Commission Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing all drivers with their 8% commission status for earnings above LKR 1,000
              </p>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                8% Commission Rate
              </Badge>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Total Earnings</TableHead>
                  <TableHead>Commission Owed</TableHead>
                  <TableHead>Commission Paid</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reminders</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {driverCommissions?.map((driver) => (
                  <TableRow key={driver.driverId}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{driver.driverName}</div>
                        <div className="text-sm text-gray-500">ID: {driver.driverId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{driver.email}</div>
                        <div className="text-gray-500">{driver.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{driver.totalEarnings}</div>
                    </TableCell>
                    <TableCell>
                      <div className={`font-medium ${parseFloat(driver.commissionOwed.replace('LKR ', '')) > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                        {driver.commissionOwed}
                      </div>
                      <div className="text-xs text-gray-500">@ 8% rate</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-green-600">{driver.commissionPaid}</div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={driver.isBlocked ? 'destructive' : 
                                parseFloat(driver.commissionOwed.replace('LKR ', '')) > 0 ? 'default' : 'secondary'}
                      >
                        {driver.isBlocked ? 'Blocked' : 
                         parseFloat(driver.commissionOwed.replace('LKR ', '')) > 0 ? 'Commission Due' : 'Good Standing'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {driver.reminderCount > 0 ? (
                        <div className="text-sm">
                          <div className="font-medium text-orange-600">{driver.reminderCount}/4</div>
                          <div className="text-xs text-gray-500">
                            Last: {driver.lastReminderSent}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {driver.servicesUsed?.map((service, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {driver.isBlocked ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => unlockDriverMutation.mutate(driver.driverId)}
                            disabled={unlockDriverMutation.isPending}
                          >
                            <Unlock className="w-3 h-3 mr-1" />
                            Unlock
                          </Button>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => sendReminderMutation.mutate(driver.driverId)}
                              disabled={sendReminderMutation.isPending}
                            >
                              <Send className="w-3 h-3 mr-1" />
                              Remind
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedDriver(driver);
                                setIsPaymentDialogOpen(true);
                              }}
                            >
                              <DollarSign className="w-3 h-3 mr-1" />
                              Payment
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Commission Payment</DialogTitle>
            <DialogDescription>
              Process payment for {selectedDriver?.driverName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                                <strong>Commission Owed:</strong> LKR {selectedDriver?.commissionOwed}
                              </AlertDescription>
                            </Alert>
                            <div className="space-y-2">
                              <Label htmlFor="payment-amount">Payment Amount (LKR)</Label>
                              <Input
                                id="payment-amount"
                                type="number"
                                step="0.01"
                                min="0"
                                max={selectedDriver?.commissionOwed}
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                placeholder="Enter payment amount"
                              />
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button 
                                onClick={handleProcessPayment}
                                disabled={processPaymentMutation.isPending || !paymentAmount}
                              >
                                {processPaymentMutation.isPending ? 'Processing...' : 'Process Payment'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {!driverCommissions?.length && (
            <div className="text-center py-8 text-gray-500">
              No driver commission data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCommissionManager;