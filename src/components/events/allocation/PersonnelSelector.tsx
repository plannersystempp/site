
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Personnel, type Func } from '@/contexts/EnhancedDataContext';

interface PersonnelSelectorProps {
  personnel: Personnel[];
  functions: Func[];
  selectedPersonnel: string;
  selectedFunction: string;
  onPersonnelChange: (personnelId: string) => void;
  onFunctionChange: (functionName: string) => void;
}

export const PersonnelSelector: React.FC<PersonnelSelectorProps> = ({
  personnel,
  functions,
  selectedPersonnel,
  selectedFunction,
  onPersonnelChange,
  onFunctionChange
}) => {
  // Get available functions for selected personnel
  const selectedPerson = personnel.find(p => p.id === selectedPersonnel);
  const availableFunctions = selectedPerson?.functions || functions;

  const handlePersonnelChange = (personnelId: string) => {
    onPersonnelChange(personnelId);
    // Reset function selection when personnel changes
    onFunctionChange('');
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="personnel">Pessoa <span className="text-red-500">*</span></Label>
        <Select value={selectedPersonnel} onValueChange={handlePersonnelChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma pessoa" />
          </SelectTrigger>
          <SelectContent>
            {personnel
              .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
              .map((person) => (
                <SelectItem key={person.id} value={person.id}>
                  {person.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="function">Função <span className="text-red-500">*</span></Label>
        <Select value={selectedFunction} onValueChange={onFunctionChange} disabled={!selectedPersonnel}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma função" />
          </SelectTrigger>
          <SelectContent>
            {availableFunctions.map((func) => (
              <SelectItem key={func.id} value={func.name}>
                {func.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};
