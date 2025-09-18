import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DollarSign, Users, AlertTriangle, CheckCircle, Send, Unlock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface DriverCommission {
  driverId: number;
  driverName: string;
  email: string;
  phone: string;
  totalEarnings: string;
  commissionOwed: string;
  commissionPaid: string;
  commissionRate: string;
  reminderCount: number;
  lastReminderSent?: string;
  isBlocked: boolean;
  weeklyStartDate: string;
  isActive: boolean;
  servicesUsed?: string[];
}

const SimpleAdminCommission: React.FC = () => {
  const { data: driverCommissions, isLoading } = useQuery<DriverCommission[]>({
    queryKey: ['/api/commissions/admin/overview'],
    refetchInterval: 3000,
  });

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

  const totalDrivers = driverCommissions?.length || 0;
  const blockedDrivers = driverCommissions?.filter(d => d.isBlocked).length || 0;
  const totalCommissionOwed = driverCommissions?.reduce((sum, d) => 
    sum + parseFloat(d.commissionOwed.replace('LKR ', '')), 0) || 0;
  const totalCommissionPaid = driverCommissions?.reduce((sum, d) => 
    sum + parseFloat(d.commissionPaid.replace('LKR ', '')), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Commission Management</h2>
          <p className="text-gray-600">Driver commission tracking for earnings above LKR 1,000</p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 px-4 py-2">
          8% Commission Rate
        </Badge>
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
          <CardTitle>Driver Commission Status (8% Rate)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <h3 className="font-medium text-blue-900">Commission System Threshold</h3>
                <p className="text-sm text-blue-700">
                  <strong>Key Rule:</strong> Commission calculated on earnings above LKR 1,000. <br/>
                  <strong>Reminders/Blocking:</strong> Only triggered when commission owed ≥ LKR 1,000. <br/>
                  <strong>Below threshold:</strong> Drivers can pay voluntarily but no reminders sent.
                </p>
              </div>
              <Badge className="bg-blue-600 text-white">Active</Badge>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Total Earnings</TableHead>
                  <TableHead>Commission Owed (8%)</TableHead>
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
                          >
                            <Unlock className="w-3 h-3 mr-1" />
                            Unlock
                          </Button>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                            >
                              <Send className="w-3 h-3 mr-1" />
                              Remind
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
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
          </div>

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

export default SimpleAdminCommission;