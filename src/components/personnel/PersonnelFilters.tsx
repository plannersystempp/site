
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Func } from '@/contexts/EnhancedDataContext';

interface PersonnelFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterType: 'all' | 'fixo' | 'freelancer';
  onTypeChange: (value: 'all' | 'fixo' | 'freelancer') => void;
  filterFunction: string;
  onFunctionChange: (value: string) => void;
  functions: Func[];
}

export const PersonnelFilters: React.FC<PersonnelFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filterType,
  onTypeChange,
  filterFunction,
  onFunctionChange,
  functions,
}) => {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col gap-3">
        <div className="w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select value={filterType} onValueChange={onTypeChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="fixo">Fixo</SelectItem>
              <SelectItem value="freelancer">Freelancer</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterFunction} onValueChange={onFunctionChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Função" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as funções</SelectItem>
              {functions.map((func) => (
                <SelectItem key={func.id} value={func.id}>
                  {func.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
