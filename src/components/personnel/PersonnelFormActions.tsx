import React from 'react';
import { Button } from '@/components/ui/button';

interface PersonnelFormActionsProps {
  loading: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

export const PersonnelFormActions: React.FC<PersonnelFormActionsProps> = ({
  loading,
  onCancel,
  onSubmit
}) => {
  return (
    <div className="flex gap-2 pt-4">
      <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
        Cancelar
      </Button>
      <Button type="submit" disabled={loading} className="flex-1" onClick={onSubmit}>
        {loading ? 'Salvando...' : 'Salvar'}
      </Button>
    </div>
  );
};