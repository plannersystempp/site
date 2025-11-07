
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

interface PersonnelListViewProps {
  personnel: Personnel[];
  functions: Func[];
  onEdit: (person: Personnel) => void;
  onDelete: (id: string) => Promise<void>;
  canEdit: (person: Personnel) => boolean;
  onRate?: (person: Personnel) => void;
}

export const PersonnelListView: React.FC<PersonnelListViewProps> = ({
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
    <div className="space-y-3 overflow-x-auto">
      {personnel.map((person) => {
        return (
        <Card key={person.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            {/* Desktop Layout */}
            <div className="hidden md:flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Photo or avatar */}
                {person.photo_url ? (
                  <img 
                    src={person.photo_url}
                    alt={person.name}
                    crossOrigin="anonymous"
                    loading="lazy"
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0 cursor-zoom-in"
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
                  className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ display: person.photo_url ? 'none' : 'flex' }}
                >
                  <User className="w-5 h-5 text-primary" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm whitespace-normal break-words leading-snug">{person.name}</h3>
                    <Badge variant={person.type === 'fixo' ? 'default' : 'secondary'} className="text-xs flex-shrink-0">
                      {person.type === 'fixo' ? 'Fixo' : 'Freelancer'}
                    </Badge>
                    {person.type === 'freelancer' && (
                      <div className="flex flex-col gap-1.5 w-full">
                        <div className="flex items-center gap-2">
                          <FreelancerAverageRating
                            freelancerId={person.id}
                            showCount={false}
                            clickable
                            onClick={() => setExpandedPerformanceId(prev => prev === person.id ? null : person.id)}
                          />
                          {onRate && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRate(person)}
                              className="h-6 px-2 text-xs"
                            >
                              Avaliar
                            </Button>
                          )}
                        </div>
                        {expandedPerformanceId === person.id && (
                          <div className="mt-2">
                            <FreelancerPerformanceCard freelancerId={person.id} freelancerName={person.name} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {/* Display multiple functions */}
                    {person.functions && person.functions.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {person.functions.map(func => (
                          <Badge key={func.id} variant="outline" className="text-xs">
                            {func.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {person.email && (
                      <div className="flex items-center gap-1 min-w-0">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{person.email}</span>
                      </div>
                    )}
                    
                     {person.phone && (
                       <div className="flex items-center gap-1">
                         <Phone className="w-3 h-3" />
                         <span>{formatPhoneNumber(person.phone)}</span>
                         <WhatsAppButton 
                           phone={person.phone} 
                           name={person.name} 
                           size="sm" 
                           variant="ghost" 
                         />
                       </div>
                     )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="flex gap-4 text-xs">
                  {person.type === 'fixo' && person.monthly_salary && (
                    <div className="text-center">
                      <div className="font-medium">{formatCurrency(person.monthly_salary)}</div>
                      <div className="text-muted-foreground">Salário</div>
                    </div>
                  )}
                  {!isCoordinator && (
                    <>
                      <div className="text-center">
                        <div className="font-medium text-blue-600">{formatCurrency(person.event_cache)}</div>
                        <div className="text-muted-foreground">Cachê</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-orange-600">{formatCurrency(person.overtime_rate)}</div>
                        <div className="text-muted-foreground">H.Extra</div>
                      </div>
                    </>
                  )}
                </div>

              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setHistoryPersonnel(person)}
                  title="Ver Histórico"
                >
                  <History className="w-4 h-4" />
                </Button>
                {canEdit(person) && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(person)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(person.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Photo or avatar */}
                  {person.photo_url ? (
                    <img 
                      src={person.photo_url}
                      alt={person.name}
                      crossOrigin="anonymous"
                      loading="lazy"
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0 cursor-zoom-in"
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
                    className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ display: person.photo_url ? 'none' : 'flex' }}
                  >
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-base whitespace-normal break-words leading-snug">{person.name}</h3>
                    <div className="space-y-1 mt-1">
                      <div className="flex flex-wrap gap-1">
                        <Badge variant={person.type === 'fixo' ? 'default' : 'secondary'} className="text-xs">
                          {person.type === 'fixo' ? 'Fixo' : 'Freelancer'}
                        </Badge>
                      </div>
                      {person.type === 'freelancer' && (
                        <div className="flex flex-col gap-1.5 w-full">
                          <div className="flex items-center gap-2">
                            <FreelancerAverageRating
                              freelancerId={person.id}
                              showCount={true}
                              clickable
                              onClick={() => setExpandedPerformanceId(prev => prev === person.id ? null : person.id)}
                            />
                            {onRate && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRate(person)}
                                className="h-6 px-2 text-xs"
                              >
                                Avaliar
                              </Button>
                            )}
                          </div>
                          {expandedPerformanceId === person.id && (
                            <div className="mt-2">
                              <FreelancerPerformanceCard freelancerId={person.id} freelancerName={person.name} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setHistoryPersonnel(person)}
                    title="Ver Histórico"
                  >
                    <History className="w-4 h-4" />
                  </Button>
                  {canEdit(person) && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(person)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(person.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Functions display for mobile */}
              {person.functions && person.functions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Briefcase className="w-3 h-3" />
                    <span>Funções</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {person.functions.map(func => (
                      <Badge key={func.id} variant="outline" className="text-xs">
                        {func.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {(person.email || person.phone) && (
                <div className="space-y-2 text-sm">
                  {person.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate text-muted-foreground">{person.email}</span>
                    </div>
                  )}
                   {person.phone && (
                     <div className="flex items-center gap-2">
                       <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                       <span className="text-muted-foreground">{formatPhoneNumber(person.phone)}</span>
                       <WhatsAppButton 
                         phone={person.phone} 
                         name={person.name} 
                         size="sm" 
                         variant="ghost" 
                       />
                     </div>
                   )}
                </div>
              )}

              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm font-medium">Valores</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {person.type === 'fixo' && person.monthly_salary && (
                    <div className="text-center">
                      <div className="font-medium text-green-600">{formatCurrency(person.monthly_salary)}</div>
                      <div className="text-xs text-muted-foreground">Salário</div>
                    </div>
                  )}
                  {!isCoordinator && (
                    <>
                      <div className="text-center">
                        <div className="font-medium text-blue-600">{formatCurrency(person.event_cache)}</div>
                        <div className="text-xs text-muted-foreground">Cachê</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-orange-600">{formatCurrency(person.overtime_rate)}</div>
                        <div className="text-xs text-muted-foreground">H.Extra</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
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
