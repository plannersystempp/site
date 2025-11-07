import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  accentClassName?: string; // ex: "border-yellow-200 bg-yellow-50/50"
  valueClassName?: string; // ex: "text-yellow-600"
  size?: 'sm' | 'md';
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon,
  accentClassName,
  valueClassName,
  size = 'md',
}) => {
  const titleSizeClass = size === 'sm' ? 'text-xs' : 'text-sm';
  const headerPaddingClass = size === 'sm' ? 'pb-1' : 'pb-2';
  const valueSizeClass = size === 'sm' ? 'text-xl' : 'text-2xl';
  return (
    <Card className={cn('bg-muted/30 dark:bg-muted/20 hover:shadow-md transition-shadow group', accentClassName)}>
      <CardHeader className={cn('flex flex-row items-center justify-between space-y-0', headerPaddingClass)}>
        <CardTitle className={cn('font-medium', titleSizeClass)}>{title}</CardTitle>
        {icon ? (
          <span className="inline-flex transition-transform duration-200 ease-out motion-safe:group-hover:scale-110 motion-safe:group-hover:-rotate-3 group-focus-visible:scale-110 group-focus-visible:-rotate-3">
            {icon}
          </span>
        ) : null}
      </CardHeader>
      <CardContent>
        <div className={cn(valueSizeClass, 'font-bold', valueClassName)}>{value}</div>
      </CardContent>
    </Card>
  );
};

export default KpiCard;