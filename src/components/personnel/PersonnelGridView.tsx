import React, { useState } from 'react';
import { useTeam } from '@/contexts/TeamContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Mail, Phone, User, DollarSign, Briefcase, History } from 'lucide-react';
import { formatCurrency, formatPhoneNumber } from '@/utils/formatters';
import type { Personnel, Func } from '@/contexts/EnhancedDataContext';
import { FreelancerAverageRating } from './FreelancerAverageRating';
import { FreelancerRatingMetrics } from './FreelancerRatingMetrics';
import { FreelancerRatingDialog } from './FreelancerRatingDialog';
import { FreelancerPerformanceCard } from './FreelancerPerformanceCard';
import { WhatsAppButton } from './WhatsAppButton';
import { PersonnelHistoryDialog } from './PersonnelHistory/PersonnelHistoryDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PersonnelGridViewProps {
  personnel: Personnel[];
  functions: Func[];
  onEdit: (person: Personnel) => void;
  onDelete: (id: string) => Promise<void>;
  canEdit: (person: Personnel) => boolean;
  onRate?: (person: Personnel) => void;
}

export const PersonnelGridView: React.FC<PersonnelGridViewProps> = ({
  personnel,
  functions,
  onEdit,
  onDelete,
  canEdit,
  onRate
}) => {
  const { userRole } = useTeam();
  const isCoordinator = userRole === 'coordinator';
  const [historyPersonnel, setHistoryPersonnel] = useState<Personnel | null>(null);
  const [expandedPerformanceId, setExpandedPerformanceId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  
  return (
    <div className="w-full mx-auto px-2 sm:px-3 md:px-4 grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
      {personnel.map((person) => {
        const personFunctions = person.functions || [];
        return (
          <Card key={person.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="p-3 sm:p-4 flex-1">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Photo or avatar */}
              {person.photo_url ? (
                <img 
                  src={person.photo_url}
                  alt={person.name}
                  crossOrigin="anonymous"
                  loading="lazy"
                  className="w-10 h-10 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0 cursor-zoom-in"
                  onClick={() => {
                    setPreviewImageUrl(person.photo_url!);
                    setPreviewOpen(true);
                  }}
                  onError={(e) => {
                    const img = e.currentTarget;
                    img.style.display = 'none';
                    const fallback = img.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
                  <div 
                    className="w-10 h-10 sm:w-8 sm:h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ display: person.photo_url ? 'none' : 'flex' }}
                  >
                    <User className="w-5 h-5 sm:w-4 sm:h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base sm:text-sm truncate">{person.name}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge 
                        variant={person.type === 'fixo' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {person.type === 'fixo' ? 'Fixo' : 'Freelancer'}
                      </Badge>
                      {person.shirt_size && (
                        <Badge variant="outline" className="text-xs">
                          👕 {person.shirt_size}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Mobile-optimized action buttons */}
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setHistoryPersonnel(person)}
                    className="h-9 w-9 sm:h-8 sm:w-8 p-0"
                    title="Ver Histórico"
                  >
                    <History className="h-4 w-4" />
                  </Button>
                  {canEdit(person) && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(person)}
                        className="h-9 w-9 sm:h-8 sm:w-8 p-0"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(person.id)}
                        className="h-9 w-9 sm:h-8 sm:w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {/* Functions - Compact view */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase className="w-3 h-3 text-muted-foreground" />
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Funções</h4>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {personFunctions.length > 0 ? (
                      personFunctions.slice(0, 2).map((func) => (
                        <Badge key={func.id} variant="outline" className="text-xs">
                          {func.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">Nenhuma função</span>
                    )}
                    {personFunctions.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{personFunctions.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Contact - Essential only */}
                <div className="space-y-1">
                  {person.email && (
                    <div className="flex items-center gap-2 text-xs">
                      <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="truncate text-muted-foreground">{person.email}</span>
                    </div>
                  )}
                  {person.phone && (
                    <div className="flex items-center gap-2 text-xs">
                      <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="flex-1 text-muted-foreground">{formatPhoneNumber(person.phone)}</span>
                      <WhatsAppButton phone={person.phone} name={person.name} size="sm" variant="ghost" />
                    </div>
                  )}
                </div>

                {/* Financial info - Compact */}
                <div className="bg-muted/30 rounded-lg p-2">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-3 h-3 text-muted-foreground" />
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Valores</h4>
                  </div>
                  <div className="space-y-1 text-xs">
                    {person.type === 'fixo' && person.monthly_salary > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Salário:</span>
                        <span className="font-medium text-green-600">{formatCurrency(person.monthly_salary)}</span>
                      </div>
                    )}
                    {!isCoordinator && person.event_cache > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cachê:</span>
                        <span className="font-medium text-blue-600">{formatCurrency(person.event_cache)}</span>
                      </div>
                    )}
                    {!isCoordinator && person.overtime_rate > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">H. extra:</span>
                        <span className="font-medium text-orange-600">{formatCurrency(person.overtime_rate)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Freelancer rating - Bottom action */}
                {person.type === 'freelancer' && (
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <FreelancerAverageRating
                        freelancerId={person.id}
                        showCount={false}
                        clickable
                        onClick={() => setExpandedPerformanceId(prev => prev === person.id ? null : person.id)}
                      />
                      {onRate && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onRate(person)}
                          className="text-xs h-8 min-h-[32px] sm:min-h-0"
                        >
                          Avaliar
                        </Button>
                      )}
                    </div>
                    {expandedPerformanceId === person.id && (
                      <div className="mt-1">
                        <FreelancerPerformanceCard freelancerId={person.id} freelancerName={person.name} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}

      {historyPersonnel && (
        <PersonnelHistoryDialog
          open={!!historyPersonnel}
          onOpenChange={(open) => {
            if (!open) setHistoryPersonnel(null);
          }}
          personnel={historyPersonnel}
        />
      )}
      {/* Dialog de pré-visualização da foto */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl p-0">
          <DialogHeader>
            <DialogTitle className="sr-only">Pré-visualização da Foto</DialogTitle>
          </DialogHeader>
          {previewImageUrl && (
            <img
              src={previewImageUrl}
              alt="Pré-visualização da foto"
              crossOrigin="anonymous"
              className="w-full h-auto object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
