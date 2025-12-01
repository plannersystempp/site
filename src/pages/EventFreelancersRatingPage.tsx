import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEnhancedData } from '@/contexts/EnhancedDataContext';
import { useTeam } from '@/contexts/TeamContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Star } from 'lucide-react';
import { FreelancerRating } from '@/components/personnel/FreelancerRating';
import { FreelancerAverageRating } from '@/components/personnel/FreelancerAverageRating';
import { useIsMobile } from '@/hooks/use-mobile';

export const EventFreelancersRatingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userRole } = useTeam();
  const { events, assignments, personnel, loading } = useEnhancedData();
  const isMobile = useIsMobile();

  const event = events.find(e => e.id === id);

  const freelancers = useMemo(() => {
    if (!event) return [];
    const allocatedIds = assignments
      .filter(a => a.event_id === event.id)
      .map(a => a.personnel_id);
    const allocatedSet = new Set(allocatedIds);
    return personnel
      .filter(p => p.type === 'freelancer' && allocatedSet.has(p.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [event, assignments, personnel]);

  if (loading && !event) {
    return (
      <div className="p-4 md:p-6">
        <div className="h-6 w-24 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-4 md:p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Evento não encontrado.</p>
            <Button onClick={() => navigate('/app/eventos')} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar à Lista de Eventos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!(userRole === 'admin' || userRole === 'coordinator')) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Acesso restrito. Apenas administradores e coordenadores podem avaliar freelancers.</p>
            <Button onClick={() => navigate(`/app/eventos/${event.id}`)} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Evento
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-full ${isMobile ? 'px-0 py-3' : 'p-4 md:p-6'} space-y-3 sm:space-y-4 md:space-y-6`}>
      <div className={`${isMobile ? 'px-3' : ''} flex items-center justify-between`}>
        <Button variant="ghost" onClick={() => navigate(`/app/eventos/${event.id}`)} className="-ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Evento
        </Button>
      </div>

      <Card className={isMobile ? 'border-0' : undefined}>
        <CardHeader className={`${isMobile ? 'px-3 pt-2 pb-1' : 'pb-2'}`}>
          <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-lg' : ''}`}>
            <Star className="w-4 h-4" />
            Avaliar Freelancers
            <Badge variant="outline" className="ml-2">{freelancers.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className={`${isMobile ? 'px-2 sm:px-3 pt-0' : 'p-2 sm:p-3'}`}>
          {freelancers.length === 0 ? (
            <div className="text-sm text-muted-foreground p-3">Nenhum freelancer alocado para este evento.</div>
          ) : (
            <div className="space-y-1 sm:space-y-2">
              {freelancers.map(f => (
                <div key={f.id} className={`${isMobile ? 'px-2 py-2' : 'p-2'} rounded border flex items-center justify-between gap-2`}>
                  <div className={`${isMobile ? 'flex-1 min-w-0' : ''} flex items-start sm:items-center gap-2`}>
                    <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <div className={`${isMobile ? 'text-sm' : 'text-base'} font-medium leading-tight line-clamp-2 break-words`}>{f.name}</div>
                      <div className="mt-0.5">
                        <FreelancerAverageRating freelancerId={f.id} showCount={false} clickable={false} />
                      </div>
                    </div>
                  </div>
                  <FreelancerRating
                    eventId={event.id}
                    freelancerId={f.id}
                    freelancerName={f.name}
                    onRatingSubmitted={() => {}}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

