
import React from 'react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  children
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center px-4">
      {icon && (
        <div className="mb-4 sm:mb-6 text-muted-foreground">
          {React.cloneElement(icon as React.ReactElement, { 
            className: 'w-10 h-10 sm:w-12 sm:h-12 mx-auto' 
          })}
        </div>
      )}
      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4 sm:mb-6 max-w-md">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} className="w-full sm:w-auto">
          {action.label}
        </Button>
      )}
      {children}
    </div>
  );
};
