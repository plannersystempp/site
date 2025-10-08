import { useState, useCallback } from 'react';
import { type Personnel, type Func } from '@/contexts/EnhancedDataContext';

export interface SelectedPerson {
  personnel: Personnel;
  selectedFunction: string;
}

export interface MultipleSelectionState {
  selectedPersonnel: SelectedPerson[];
  searchQuery: string;
  selectAll: boolean;
}

export const useMultipleSelection = (
  availablePersonnel: Personnel[],
  availableFunctions: Func[]
) => {
  const [selectedPersonnel, setSelectedPersonnel] = useState<SelectedPerson[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectAll, setSelectAll] = useState(false);

  // Filter personnel based on search
  const filteredPersonnel = availablePersonnel
    .filter(person =>
      person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  // Check if person is selected
  const isPersonSelected = useCallback((personnelId: string) => {
    return selectedPersonnel.some(sp => sp.personnel.id === personnelId);
  }, [selectedPersonnel]);

  // Toggle person selection
  const togglePersonSelection = useCallback((person: Personnel) => {
    setSelectedPersonnel(prev => {
      const isSelected = prev.some(sp => sp.personnel.id === person.id);
      
      if (isSelected) {
        // Remove person
        return prev.filter(sp => sp.personnel.id !== person.id);
      } else {
        // Add person - SEMPRE prioriza primaryFunctionId se existir
        let defaultFunction = '';
        
        // 1ª prioridade: função primária do personnel
        if (person.primaryFunctionId && person.functions) {
          const primaryFunc = person.functions.find(f => f.id === person.primaryFunctionId);
          if (primaryFunc) {
            defaultFunction = primaryFunc.name;
          }
        }
        
        // 2ª prioridade: primeira função do personnel
        if (!defaultFunction && person.functions && person.functions.length > 0) {
          defaultFunction = person.functions[0].name;
        }
        
        // 3ª prioridade: primeira função disponível no evento
        if (!defaultFunction && availableFunctions.length > 0) {
          defaultFunction = availableFunctions[0].name;
        }
        
        return [...prev, { personnel: person, selectedFunction: defaultFunction }];
      }
    });
  }, [availableFunctions]);

  // Update function for selected person
  const updatePersonFunction = useCallback((personnelId: string, functionName: string) => {
    setSelectedPersonnel(prev =>
      prev.map(sp =>
        sp.personnel.id === personnelId
          ? { ...sp, selectedFunction: functionName }
          : sp
      )
    );
  }, []);

  // Select/deselect all filtered personnel
  const toggleSelectAll = useCallback(() => {
    if (selectAll) {
      // Deselect all
      setSelectedPersonnel([]);
      setSelectAll(false);
    } else {
      // Select all filtered personnel
      const newSelections = filteredPersonnel
        .filter(person => !isPersonSelected(person.id))
        .map(person => {
          // SEMPRE prioriza primaryFunctionId
          let defaultFunction = '';
          
          // 1ª prioridade: função primária
          if (person.primaryFunctionId && person.functions) {
            const primaryFunc = person.functions.find(f => f.id === person.primaryFunctionId);
            if (primaryFunc) {
              defaultFunction = primaryFunc.name;
            }
          }
          
          // 2ª prioridade: primeira função do personnel
          if (!defaultFunction && person.functions && person.functions.length > 0) {
            defaultFunction = person.functions[0].name;
          }
          
          // 3ª prioridade: primeira função disponível
          if (!defaultFunction && availableFunctions.length > 0) {
            defaultFunction = availableFunctions[0].name;
          }
          
          return {
            personnel: person,
            selectedFunction: defaultFunction
          };
        });
      
      setSelectedPersonnel(prev => [...prev, ...newSelections]);
      setSelectAll(true);
    }
  }, [filteredPersonnel, isPersonSelected, availableFunctions, selectAll]);

  // Clear all selections
  const clearSelections = useCallback(() => {
    setSelectedPersonnel([]);
    setSelectAll(false);
  }, []);

  // Validate selections
  const validateSelections = useCallback(() => {
    if (selectedPersonnel.length === 0) {
      return { isValid: false, message: 'Selecione pelo menos uma pessoa' };
    }

    const invalidSelections = selectedPersonnel.filter(sp => !sp.selectedFunction);
    if (invalidSelections.length > 0) {
      return { 
        isValid: false, 
        message: `Selecione a função para ${invalidSelections.length} pessoa(s)` 
      };
    }

    return { isValid: true, message: '' };
  }, [selectedPersonnel]);

  return {
    selectedPersonnel,
    searchQuery,
    setSearchQuery,
    selectAll,
    filteredPersonnel,
    isPersonSelected,
    togglePersonSelection,
    updatePersonFunction,
    toggleSelectAll,
    clearSelections,
    validateSelections,
    selectedCount: selectedPersonnel.length
  };
};