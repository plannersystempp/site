
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatDateTime } from '@/utils/formatters';
import { Calendar, User, FileText } from 'lucide-react';
import type { AbsenceDetail } from '@/components/payroll/types';

interface AbsencesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personnelName: string;
  absences: AbsenceDetail[];
  eventName: string;
}

export const AbsencesModal: React.FC<AbsencesModalProps> = ({
  open,
  onOpenChange,
  personnelName,
  absences,
  eventName
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Histórico de Faltas - {personnelName}
          </DialogTitle>
          <DialogDescription>
            Evento: {eventName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {absences.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                Nenhuma falta registrada para este evento.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {absences.map((absence) => (
                <div
                  key={absence.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {formatDate(absence.work_date)}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {formatDateTime(absence.created_at)}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>
                      Registrado por: {absence.logged_by_name || 'Sistema'}
                    </span>
                  </div>

                  {absence.notes && (
                    <div className="flex items-start gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <span className="text-muted-foreground">Observações: </span>
                        <span>{absence.notes}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
