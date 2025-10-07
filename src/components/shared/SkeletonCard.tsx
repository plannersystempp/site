
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonCardProps {
  className?: string;
  showSubtitle?: boolean;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ 
  className = "", 
  showSubtitle = true 
}) => {
  return (
    <div className={`p-4 bg-card rounded-lg border ${className}`}>
      <div className="space-y-3">
        <Skeleton className="h-4 w-3/4" />
        {showSubtitle && <Skeleton className="h-3 w-1/2" />}
        <Skeleton className="h-8 w-1/3" />
      </div>
    </div>
  );
};
