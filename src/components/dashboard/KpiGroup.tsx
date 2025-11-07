import React from 'react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface KpiGroupProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const KpiGroup: React.FC<KpiGroupProps> = ({ title, icon, children, className }) => {
  return (
    <section className={cn('space-y-2', className)} aria-label={title}>
      <div className="flex items-center gap-2">
        {icon ? <span className="inline-flex items-center justify-center">{icon}</span> : null}
        <h2 className="text-sm font-semibold text-muted-foreground">{title}</h2>
      </div>
      <Separator className="my-1" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {children}
      </div>
    </section>
  );
};

export default KpiGroup;