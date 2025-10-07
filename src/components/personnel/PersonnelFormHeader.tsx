
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';
import { Personnel } from '@/contexts/EnhancedDataContext';

interface PersonnelFormHeaderProps {
  personnel?: Personnel;
  onClose: () => void;
}

export const PersonnelFormHeader: React.FC<PersonnelFormHeaderProps> = ({
  personnel,
  onClose
}) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle className="text-lg">
        {personnel ? 'Editar Profissional' : 'Novo Profissional'}
      </CardTitle>
      <Button variant="ghost" size="icon" onClick={onClose}>
        <X className="w-4 h-4" />
      </Button>
    </CardHeader>
  );
};
