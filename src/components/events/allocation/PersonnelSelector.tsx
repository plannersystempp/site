
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ChevronDown } from 'lucide-react';
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
  const [open, setOpen] = useState(false);

  const handlePersonnelChange = (personnelId: string) => {
    onPersonnelChange(personnelId);
    // Reset function selection when personnel changes
    onFunctionChange('');
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="personnel">Pessoa <span className="text-red-500">*</span></Label>
        {/* Combobox com busca para Pessoa */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              <span className="truncate">
                {selectedPerson?.name || 'Selecione uma pessoa'}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[700px] max-w-[calc(100vw-2rem)] p-0"
            align="start"
          >
            <Command>
              <CommandInput placeholder="Pesquisar por nome ou email..." className="h-10" />
              <CommandList className="max-h-[500px] md:max-h-[600px] overflow-y-auto">
                <CommandEmpty>Nenhuma pessoa encontrada.</CommandEmpty>
                <CommandGroup>
                  {personnel
                    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
                    .map((person) => (
                      <CommandItem
                        key={person.id}
                        value={`${person.name} ${person.email || ''}`}
                        onSelect={() => {
                          handlePersonnelChange(person.id);
                          setOpen(false);
                        }}
                      >
                        <div className="flex items-center justify-between w-full gap-3">
                          <span className="text-sm font-medium truncate max-w-[45%]">{person.name}</span>
                          {person.email && (
                            <span className="text-xs text-muted-foreground truncate max-w-[50%]">{person.email}</span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
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
