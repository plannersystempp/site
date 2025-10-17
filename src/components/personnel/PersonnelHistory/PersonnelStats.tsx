import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { usePersonnelStats } from '@/hooks/queries/usePersonnelHistoryQuery';
import { formatCurrency } from '@/utils/formatters';

interface PersonnelStatsProps {
  personnelId: string;
}

export const PersonnelStats: React.FC<PersonnelStatsProps> = ({ personnelId }) => {
  const { data: stats, isLoading } = usePersonnelStats(personnelId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
      {/* Total de Eventos */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Eventos</p>
              <p className="text-2xl font-bold">{stats.totalEvents}</p>
            </div>
            <Calendar className="h-8 w-8 text-primary/70" />
          </div>
        </CardContent>
      </Card>

      {/* Total Pago */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Pago</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalPaidAllTime)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600/70" />
          </div>
        </CardContent>
      </Card>

      {/* Total Pendente */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Valores Pendentes</p>
              <p className={`text-2xl font-bold ${stats.totalPending > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {formatCurrency(stats.totalPending)}
              </p>
            </div>
            <AlertCircle className={`h-8 w-8 ${stats.totalPending > 0 ? 'text-orange-600/70' : 'text-green-600/70'}`} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
