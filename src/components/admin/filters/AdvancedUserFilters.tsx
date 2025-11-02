import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface UserFilters {
  role?: string;
  isApproved?: string;
  hasTeam?: string;
  dateRange?: string;
}

interface AdvancedUserFiltersProps {
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
  onSave?: () => void;
  onClear: () => void;
}

export function AdvancedUserFilters({
  filters,
  onFiltersChange,
  onSave,
  onClear,
}: AdvancedUserFiltersProps) {
  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  const updateFilter = (key: keyof UserFilters, value: string | undefined) => {
    onFiltersChange({ ...filters, [key]: value || undefined });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Filtros Avançados</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">{activeFiltersCount} ativos</Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {onSave && (
            <Button size="sm" variant="outline" onClick={onSave}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          )}
          {activeFiltersCount > 0 && (
            <Button size="sm" variant="ghost" onClick={onClear}>
              <X className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Role</label>
          <Select
            value={filters.role || 'all'}
            onValueChange={(v) => updateFilter('role', v === 'all' ? undefined : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas as roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as roles</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="coordinator">Coordinator</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="superadmin">SuperAdmin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Status de Aprovação</label>
          <Select
            value={filters.isApproved || 'all'}
            onValueChange={(v) => updateFilter('isApproved', v === 'all' ? undefined : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="true">Aprovados</SelectItem>
              <SelectItem value="false">Pendentes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Equipe</label>
          <Select
            value={filters.hasTeam || 'all'}
            onValueChange={(v) => updateFilter('hasTeam', v === 'all' ? undefined : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="true">Com Equipe</SelectItem>
              <SelectItem value="false">Sem Equipe</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Cadastro</label>
          <Select
            value={filters.dateRange || 'all'}
            onValueChange={(v) => updateFilter('dateRange', v === 'all' ? undefined : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todo período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo período</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
