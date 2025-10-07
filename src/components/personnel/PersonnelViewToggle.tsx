
import React from 'react';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List } from 'lucide-react';

interface PersonnelViewToggleProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export const PersonnelViewToggle: React.FC<PersonnelViewToggleProps> = ({
  viewMode,
  onViewModeChange
}) => {
  return (
    <div className="flex justify-center sm:justify-end">
      <div className="flex gap-1 bg-muted p-1 rounded-lg">
        <Button
          variant={viewMode === 'list' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('list')}
          className="px-3 py-2"
        >
          <List className="w-4 h-4" />
          <span className="ml-1 hidden sm:inline">Lista</span>
        </Button>
        <Button
          variant={viewMode === 'grid' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('grid')}
          className="px-3 py-2"
        >
          <LayoutGrid className="w-4 h-4" />
          <span className="ml-1 hidden sm:inline">Grade</span>
        </Button>
      </div>
    </div>
  );
};
