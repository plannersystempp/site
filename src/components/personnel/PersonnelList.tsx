
import React, { useState } from 'react';
import { PersonnelViewToggle } from './PersonnelViewToggle';
import { PersonnelGridView } from './PersonnelGridView';
import { PersonnelListView } from './PersonnelListView';
import type { Personnel, Func } from '@/contexts/EnhancedDataContext';

interface PersonnelListProps {
  personnel: Personnel[];
  functions: Func[];
  viewMode: 'grid' | 'list';
  onEdit: (person: Personnel) => void;
  onDelete: (id: string) => Promise<void>;
  canEdit: (person: Personnel) => boolean;
  onRate?: (person: Personnel) => void;
}

export const PersonnelList: React.FC<PersonnelListProps> = ({
  personnel,
  functions,
  viewMode,
  onEdit,
  onDelete,
  canEdit,
  onRate
}) => {
  return (
    <div className="space-y-4">
      {viewMode === 'grid' ? (
        <PersonnelGridView
          personnel={personnel}
          functions={functions}
          onEdit={onEdit}
          onDelete={onDelete}
          canEdit={canEdit}
          onRate={onRate}
        />
      ) : (
        <PersonnelListView
          personnel={personnel}
          functions={functions}
          onEdit={onEdit}
          onDelete={onDelete}
          canEdit={canEdit}
          onRate={onRate}
        />
      )}
    </div>
  );
};
