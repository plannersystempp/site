
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, CheckSquare, Square } from 'lucide-react';

interface WorkDaysSelectorProps {
  availableDays: string[];
  selectedDays: string[];
  onDayToggle: (day: string, checked: boolean) => void;
  onSelectAllDays: () => void;
}

export const WorkDaysSelector: React.FC<WorkDaysSelectorProps> = ({
  availableDays,
  selectedDays,
  onDayToggle,
  onSelectAllDays
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Dias de Trabalho <span className="text-red-500">*</span>
        </Label>
        {availableDays.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSelectAllDays}
            className="text-xs"
          >
            {selectedDays.length === availableDays.length ? (
              <>
                <Square className="h-3 w-3 mr-1" />
                Desmarcar Todos
              </>
            ) : (
              <>
                <CheckSquare className="h-3 w-3 mr-1" />
                Selecionar Todos
              </>
            )}
          </Button>
        )}
      </div>
      {availableDays.length === 0 ? (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            Configure as datas do evento para ver os dias disponíveis
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border rounded-md">
          {availableDays.map((day) => (
            <div key={day} className="flex items-center space-x-2">
              <Checkbox
                id={day}
                checked={selectedDays.includes(day)}
                onCheckedChange={(checked) => onDayToggle(day, checked as boolean)}
              />
              <Label htmlFor={day} className="text-xs leading-tight">
                {new Date(day + 'T12:00:00').toLocaleDateString('pt-BR', {
                  weekday: 'short',
                  day: '2-digit',
                  month: '2-digit'
                })}
              </Label>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Selecionados: {selectedDays.length} de {availableDays.length} dias
      </p>
    </div>
  );
};
