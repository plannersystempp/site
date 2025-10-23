import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PersonnelFormActionsProps {
  loading: boolean;
  onCancel: () => void;
  hasUnsavedPhoto?: boolean;
}

export const PersonnelFormActions: React.FC<PersonnelFormActionsProps> = ({
  loading,
  onCancel,
  hasUnsavedPhoto = false
}) => {
  return (
    <div className="flex gap-2 pt-4">
      <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
        Cancelar
      </Button>
      <Button 
        type="submit" 
        disabled={loading} 
        className={cn(
          "flex-1",
          hasUnsavedPhoto && "animate-pulse ring-2 ring-primary ring-offset-2"
        )}
      >
        {loading ? 'Salvando...' : 'Salvar'}
      </Button>
    </div>
  );
};