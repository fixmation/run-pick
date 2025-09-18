
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const HealthCheck = () => {
  const [status, setStatus] = useState<{api: string, db: string}>({ api: 'checking...', db: 'checking...' });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        // Check API health
        const apiResponse = await fetch('/api/health', { credentials: 'include' });
        const apiData = apiResponse.ok ? await apiResponse.json() : { status: 'failed' };
        
        // Check DB health
        const dbResponse = await fetch('/api/db-test', { credentials: 'include' });
        const dbData = dbResponse.ok ? await dbResponse.json() : { status: 'failed' };
        
        setStatus({
          api: apiData.status || 'failed',
          db: dbData.status || 'failed'
        });
      } catch (error) {
        console.error('Health check failed:', error);
        setStatus({ api: 'error', db: 'error' });
      }
    };

    checkHealth();
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle>System Health</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>API:</span>
            <span className={status.api === 'ok' ? 'text-green-600' : 'text-red-600'}>
              {status.api}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Database:</span>
            <span className={status.db.includes('connected') ? 'text-green-600' : 'text-red-600'}>
              {status.db}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthCheck;
