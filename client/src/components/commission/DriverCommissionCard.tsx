import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DollarSign, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  XCircle,
  History
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface DriverCommissionProps {
  driverId: number;
}

interface CommissionStatus {
  totalEarnings: number;
  commissionOwed: number;
  commissionPaid: number;
  isBlocked: boolean;
  reminderCount: number;
  shouldPayCommission: boolean;
  lastReminderSent?: string;
  weeklyStartDate?: string;
}

interface CommissionTransaction {
  id: number;
  orderId: number;
  serviceType: string;
  orderAmount: string;
  commissionAmount: string;
  commissionRate: string;
  isPaid: boolean;
  paidAt?: string;
  createdAt: string;
}

const DriverCommissionCard: React.FC<DriverCommissionProps> = ({ driverId }) => {
  const [showHistory, setShowHistory] = useState(false);

  const { data: commissionStatus, isLoading } = useQuery<CommissionStatus>({
    queryKey: [`/api/commissions/driver/${driverId}`],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: commissionHistory } = useQuery<CommissionTransaction[]>({
    queryKey: [`/api/commissions/driver/${driverId}/history`],
    enabled: showHistory,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!commissionStatus) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            No commission data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = () => {
    if (commissionStatus.isBlocked) return 'destructive';
    if (commissionStatus.shouldPayCommission) return 'warning';
    return 'default';
  };

  const getStatusText = () => {
    if (commissionStatus.isBlocked) return 'Account Blocked';
    if (commissionStatus.shouldPayCommission) return 'Commission Due';
    return 'Good Standing';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Commission Status</CardTitle>
          <Badge variant={getStatusColor()}>
            {getStatusText()}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Account Status Alert */}
          {commissionStatus.isBlocked && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Your account is blocked due to unpaid commission. Please contact admin to resolve.
              </AlertDescription>
            </Alert>
          )}

          {commissionStatus.shouldPayCommission && !commissionStatus.isBlocked && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You have earned over LKR 1,000 and owe commission. Please pay LKR {commissionStatus.commissionOwed.toFixed(2)} to avoid account suspension.
                {commissionStatus.reminderCount > 0 && (
                  <span className="block mt-1 font-medium">
                    Reminder #{commissionStatus.reminderCount} - {4 - commissionStatus.reminderCount} weeks remaining
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Commission Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <DollarSign className="w-4 h-4 mr-1" />
                Total Earnings
              </div>
              <div className="text-2xl font-bold text-green-600">
                LKR {commissionStatus.totalEarnings.toFixed(2)}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <AlertTriangle className="w-4 h-4 mr-1" />
                Commission Owed
              </div>
              <div className={`text-2xl font-bold ${commissionStatus.commissionOwed > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                LKR {commissionStatus.commissionOwed.toFixed(2)}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <CheckCircle className="w-4 h-4 mr-1" />
                Commission Paid
              </div>
              <div className="text-2xl font-bold text-blue-600">
                LKR {commissionStatus.commissionPaid.toFixed(2)}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                Reminders
              </div>
              <div className="text-2xl font-bold text-gray-600">
                {commissionStatus.reminderCount} / 4
              </div>
            </div>
          </div>

          {/* Last Reminder Info */}
          {commissionStatus.lastReminderSent && (
            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
              <span className="font-medium">Last reminder sent:</span>{' '}
              {new Date(commissionStatus.lastReminderSent).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          )}

          {/* Commission Rate Info */}
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
            <strong>Commission Policy:</strong> 8% of earnings above LKR 1,000. 
            Weekly reminders sent for 4 weeks, then account blocked until payment.
          </div>

          {/* Transaction History Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowHistory(!showHistory)}
            className="w-full"
          >
            <History className="w-4 h-4 mr-2" />
            {showHistory ? 'Hide' : 'Show'} Transaction History
          </Button>
        </CardContent>
      </Card>

      {/* Transaction History */}
      {showHistory && (
        <Card>
          <CardHeader>
            <CardTitle>Commission Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {commissionHistory && commissionHistory.length > 0 ? (
              <div className="space-y-3">
                {commissionHistory.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">
                        Order #{transaction.orderId} - {transaction.serviceType.toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="font-medium">
                        LKR {parseFloat(transaction.commissionAmount).toFixed(2)}
                      </div>
                      <Badge variant={transaction.isPaid ? "default" : "secondary"}>
                        {transaction.isPaid ? 'Paid' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                No commission transactions yet
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DriverCommissionCard;