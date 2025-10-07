
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserCheck, Clock, DollarSign } from 'lucide-react';
import type { Personnel } from '@/contexts/EnhancedDataContext';

interface PersonnelStatsProps {
  personnel: Personnel[];
}

export const PersonnelStats: React.FC<PersonnelStatsProps> = ({ personnel }) => {
  const totalPersonnel = personnel.length;
  const fixedEmployees = personnel.filter(p => p.type === 'fixo').length;
  const freelancers = personnel.filter(p => p.type === 'freelancer').length;
  const avgEventCache = personnel.reduce((sum, p) => sum + (p.event_cache || 0), 0) / totalPersonnel || 0;

  const stats = [
    {
      title: 'Total de Pessoas',
      value: totalPersonnel,
      icon: <Users className="w-5 h-5" />,
      color: 'text-blue-600'
    },
    {
      title: 'Funcionários Fixos',
      value: fixedEmployees,
      icon: <UserCheck className="w-5 h-5" />,
      color: 'text-green-600'
    },
    {
      title: 'Freelancers',
      value: freelancers,
      icon: <Clock className="w-5 h-5" />,
      color: 'text-orange-600'
    },
    {
      title: 'Cachê Médio',
      value: `R$ ${avgEventCache.toFixed(0)}`,
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <div className={`${stat.color} flex-shrink-0`}>
                {stat.icon}
              </div>
              <div className="min-w-0 w-full">
                <p className="text-lg sm:text-xl md:text-2xl font-bold truncate">{stat.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{stat.title}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
