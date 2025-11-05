import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { usePersonnelQuery } from '@/hooks/queries/usePersonnelQuery';

interface PaymentFiltersProps {
  filters: {
    status?: 'pending' | 'paid' | 'cancelled';
    personnelId?: string;
  };
  onChange: (filters: any) => void;
}

export const PaymentFilters = ({ filters, onChange }: PaymentFiltersProps) => {
  const { data: personnel } = usePersonnelQuery();

  return (
    <div className="bg-card p-4 rounded-lg border space-y-4">
      <h3 className="font-semibold">Filtros</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => 
              onChange({ ...filters, status: value === 'all' ? undefined : value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="paid">Pago</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Pessoa</Label>
          <Select
            value={filters.personnelId || 'all'}
            onValueChange={(value) =>
              onChange({ ...filters, personnelId: value === 'all' ? undefined : value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {personnel?.map((person) => (
                <SelectItem key={person.id} value={person.id}>
                  {person.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
