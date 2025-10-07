
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { type Division } from '@/contexts/EnhancedDataContext';

interface DivisionSelectorProps {
  eventDivisions: Division[];
  divisionMode: 'existing' | 'new';
  selectedDivisionId: string;
  newDivisionName: string;
  onDivisionModeChange: (mode: 'existing' | 'new') => void;
  onSelectedDivisionChange: (divisionId: string) => void;
  onNewDivisionNameChange: (name: string) => void;
}

export const DivisionSelector: React.FC<DivisionSelectorProps> = ({
  eventDivisions,
  divisionMode,
  selectedDivisionId,
  newDivisionName,
  onDivisionModeChange,
  onSelectedDivisionChange,
  onNewDivisionNameChange
}) => {
  return (
    <div className="space-y-3">
      <Label>Divisão <span className="text-red-500">*</span></Label>
      
      {eventDivisions.length > 0 && (
        <div className="flex gap-2 mb-3">
          <Button
            type="button"
            variant={divisionMode === 'existing' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onDivisionModeChange('existing')}
          >
            Divisão Existente
          </Button>
          <Button
            type="button"
            variant={divisionMode === 'new' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onDivisionModeChange('new')}
          >
            <Plus className="w-4 h-4 mr-1" />
            Nova Divisão
          </Button>
        </div>
      )}
      
      {divisionMode === 'existing' ? (
        <Select value={selectedDivisionId} onValueChange={onSelectedDivisionChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma divisão" />
          </SelectTrigger>
          <SelectContent>
            {eventDivisions.map((division) => (
              <SelectItem key={division.id} value={division.id}>
                {division.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          value={newDivisionName}
          onChange={(e) => onNewDivisionNameChange(e.target.value)}
          placeholder="Nome da nova divisão (ex: Palco, Segurança)"
        />
      )}
    </div>
  );
};
