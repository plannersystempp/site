import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface AllocationSearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  totalCount: number;
  filteredCount: number;
}

export const AllocationSearchFilter: React.FC<AllocationSearchFilterProps> = ({
  searchTerm,
  onSearchChange,
  totalCount,
  filteredCount
}) => {
  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          type="text"
          placeholder="Buscar por nome ou função..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      {searchTerm && (
        <div className="text-sm text-muted-foreground">
          {filteredCount} de {totalCount} pessoa(s) encontrada(s)
        </div>
      )}
    </div>
  );
};