
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronDown, X } from 'lucide-react';
import type { Func } from '@/contexts/EnhancedDataContext';

interface FunctionMultiSelectProps {
  functions: Func[];
  selectedFunctionIds: string[];
  onSelectionChange: (functionIds: string[]) => void;
  placeholder?: string;
}

export const FunctionMultiSelect: React.FC<FunctionMultiSelectProps> = ({
  functions,
  selectedFunctionIds,
  onSelectionChange,
  placeholder = "Selecione as funções"
}) => {
  const [open, setOpen] = React.useState(false);

  const selectedFunctions = functions.filter(func => 
    selectedFunctionIds.includes(func.id)
  );

  const toggleFunction = (functionId: string) => {
    if (selectedFunctionIds.includes(functionId)) {
      onSelectionChange(selectedFunctionIds.filter(id => id !== functionId));
    } else {
      onSelectionChange([...selectedFunctionIds, functionId]);
    }
  };

  const removeFunction = (functionId: string) => {
    onSelectionChange(selectedFunctionIds.filter(id => id !== functionId));
  };

  return (
    <div className="space-y-2">
      <Label>Funções <span className="text-red-500">*</span></Label>
      
      {/* Selected functions display */}
      {selectedFunctions.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/10">
          {selectedFunctions.map(func => (
            <Badge 
              key={func.id} 
              variant="secondary" 
              className="px-2 py-1 text-sm flex items-center gap-1"
            >
              {func.name}
              <button
                type="button"
                onClick={() => removeFunction(func.id)}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Multi-select dropdown */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <span className="truncate">
              {selectedFunctions.length > 0 
                ? `${selectedFunctions.length} função(ões) selecionada(s)`
                : placeholder
              }
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Pesquisar funções..." />
            <CommandList>
              <CommandEmpty>Nenhuma função encontrada.</CommandEmpty>
              <CommandGroup>
                {functions.map((func) => (
                  <CommandItem
                    key={func.id}
                    onSelect={() => toggleFunction(func.id)}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedFunctionIds.includes(func.id)}
                      onChange={() => toggleFunction(func.id)}
                      className="self-center"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{func.name}</div>
                      {func.description && (
                        <div className="text-sm text-muted-foreground">
                          {func.description}
                        </div>
                      )}
                    </div>
                    {selectedFunctionIds.includes(func.id) && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
