
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronDown, X, Star, Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { FunctionForm } from '@/components/functions/FunctionForm';
import { functionKeys } from '@/hooks/queries/useFunctionsQuery';
import type { Func } from '@/contexts/EnhancedDataContext';

interface FunctionMultiSelectProps {
  functions: Func[];
  selectedFunctionIds: string[];
  onSelectionChange: (functionIds: string[]) => void;
  placeholder?: string;
  primaryFunctionId?: string;
  onPrimaryChange?: (functionId: string | null) => void;
}

export const FunctionMultiSelect: React.FC<FunctionMultiSelectProps> = ({
  functions,
  selectedFunctionIds,
  onSelectionChange,
  placeholder = "Selecione as funções",
  primaryFunctionId,
  onPrimaryChange
}) => {
  const [open, setOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const queryClient = useQueryClient();

  const selectedFunctions = functions.filter(func => 
    selectedFunctionIds.includes(func.id)
  );

  const toggleFunction = (functionId: string) => {
    let next: string[];
    if (selectedFunctionIds.includes(functionId)) {
      next = selectedFunctionIds.filter(id => id !== functionId);
    } else {
      next = [...selectedFunctionIds, functionId];
    }
    
    // Auto-selecionar como primária se for a única função
    if (next.length === 1) {
      onSelectionChange(next);
      onPrimaryChange?.(next[0]);
    }
    // Se removeu a função primária e ainda há outras funções, definir a primeira como primária
    else if (!next.includes(primaryFunctionId || '') && next.length > 0) {
      onSelectionChange(next);
      onPrimaryChange?.(next[0]);
    } else {
      onSelectionChange(next);
      if (next.length === 0) {
        onPrimaryChange?.(null);
      }
    }
  };

  const removeFunction = (functionId: string) => {
    const next = selectedFunctionIds.filter(id => id !== functionId);
    onSelectionChange(next);
    if (!next.includes(primaryFunctionId || '')) {
      onPrimaryChange?.(next.length === 1 ? next[0] : null);
    }
  };

  const setPrimary = (functionId: string) => {
    if (!selectedFunctionIds.includes(functionId)) {
      // ensure selected before setting primary
      toggleFunction(functionId);
    }
    onPrimaryChange?.(functionId);
  };

  const handleCreateSuccess = async (createdFunctionId?: string) => {
    setShowCreateDialog(false);
    
    if (createdFunctionId) {
      // Invalidar query para atualizar lista de funções
      await queryClient.invalidateQueries({ queryKey: functionKeys.all });
      
      // Auto-selecionar função criada após pequeno delay para garantir atualização da lista
      setTimeout(() => {
        toggleFunction(createdFunctionId);
      }, 150);
    }
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
              variant={primaryFunctionId === func.id ? "default" : "secondary"}
              className="px-2 py-1 text-sm flex items-center gap-1"
            >
              {primaryFunctionId === func.id && (
                <Star className="w-3 h-3 fill-current" />
              )}
              {func.name}
              {primaryFunctionId !== func.id && selectedFunctions.length > 1 && (
                <button
                  type="button"
                  onClick={() => setPrimary(func.id)}
                  title="Definir como principal"
                  className="ml-1 hover:bg-muted rounded-full p-0.5 transition-colors"
                >
                  <Star className="w-3 h-3 text-muted-foreground hover:text-yellow-500" />
                </button>
              )}
              <button
                type="button"
                onClick={() => removeFunction(func.id)}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {selectedFunctions.length > 1 && !primaryFunctionId && (
            <span className="text-xs text-amber-600 dark:text-amber-500 self-center">
              ⚠️ Selecione uma função principal
            </span>
          )}
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
          {/* Botão Nova Função - sempre visível no topo */}
          <div className="border-b bg-background">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowCreateDialog(true);
                setOpen(false);
              }}
              className="w-full justify-start gap-2 rounded-none hover:bg-primary/10"
            >
              <Plus className="h-4 w-4 text-primary" />
              <span className="font-medium text-primary">Nova Função</span>
            </Button>
          </div>
          
          {/* Command com pesquisa e lista */}
          <Command>
            <CommandInput placeholder="Pesquisar funções..." />
            
            <CommandList className="max-h-[300px] overflow-y-auto">
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
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setPrimary(func.id); }}
                      title="Definir como principal"
                      className="ml-2 hover:bg-muted rounded-full p-1 transition-colors"
                    >
                      <Star className={`h-4 w-4 ${primaryFunctionId === func.id ? 'text-primary fill-current' : 'text-muted-foreground hover:text-yellow-500'}`} />
                    </button>
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

      {/* Dialog para criar nova função */}
      {showCreateDialog && (
        <FunctionForm
          onClose={() => setShowCreateDialog(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
};
