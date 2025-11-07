import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FreelancerRatingMetrics } from './FreelancerRatingMetrics';

interface FreelancerPerformanceCardProps {
  freelancerId: string;
  freelancerName?: string;
}

export const FreelancerPerformanceCard: React.FC<FreelancerPerformanceCardProps> = ({ freelancerId, freelancerName }) => {
  return (
    <Card className="bg-card border border-border shadow-sm rounded-lg">
      <CardContent className="p-2 sm:p-3">
        <FreelancerRatingMetrics freelancerId={freelancerId} />
      </CardContent>
    </Card>
  );
};