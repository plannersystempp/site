
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar, CheckSquare, Square } from 'lucide-react';

interface WorkDaysChipsProps {
  availableDays: string[];
  selectedDays: string[];
  onDayToggle: (day: string) => void;
  onSelectAllDays: () => void;
}

export const WorkDaysChips: React.FC<WorkDaysChipsProps> = ({
  availableDays,
  selectedDays,
  onDayToggle,
  onSelectAllDays
}) => {
  const formatDayChip = (day: string) => {
    const date = new Date(day + 'T12:00:00');
    return {
      short: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
      dayMonth: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    };
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Dias de Trabalho *
        </Label>
        {availableDays.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSelectAllDays}
            className="text-xs h-8"
          >
            {selectedDays.length === availableDays.length ? (
              <>
                <Square className="h-3 w-3 mr-1" />
                Desmarcar
              </>
            ) : (
              <>
                <CheckSquare className="h-3 w-3 mr-1" />
                Todos
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
        <div className="space-y-3">
          {/* Chips dos dias */}
          <div className="flex flex-wrap gap-2">
            {availableDays.map((day) => {
              const isSelected = selectedDays.includes(day);
              const dayInfo = formatDayChip(day);
              
              return (
                <Button
                  key={day}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => onDayToggle(day)}
                  className={`h-auto py-2 px-3 flex flex-col items-center gap-1 min-w-0 transition-all ${
                    isSelected 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'hover:bg-muted'
                  }`}
                >
                  <span className="text-xs font-medium leading-tight">
                    {dayInfo.short}
                  </span>
                  <span className="text-xs leading-tight">
                    {dayInfo.dayMonth}
                  </span>
                </Button>
              );
            })}
          </div>
          
          {/* Contador */}
          <p className="text-xs text-muted-foreground">
            Selecionados: {selectedDays.length} de {availableDays.length} dias
          </p>
        </div>
      )}
    </div>
  );
};
