// FASE 4: Audit Log com Paginação Infinita
import React, { useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, RefreshCw, Calendar, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EnhancedAuditLogCard } from './EnhancedAuditLogCard';

interface AuditLogFilters {
  searchText?: string;
  teamFilter?: string;
  actionFilter?: string;
  startDate?: string;
  endDate?: string;
}

interface AuditLogInfiniteProps {
  filters?: AuditLogFilters;
}

const PAGE_SIZE = 100;

const fetchAuditLogs = async ({ pageParam = 0, filters = {} }: { pageParam?: number; filters?: AuditLogFilters }) => {
  const from = pageParam * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error } = await supabase
    .rpc('get_audit_logs_for_superadmin_enriched', {
      search_text: filters.searchText || null,
      team_filter: filters.teamFilter || null,
      action_filter: filters.actionFilter || null,
      start_date: filters.startDate || null,
      end_date: filters.endDate || null,
    })
    .range(from, to);

  if (error) throw error;

  return {
    data: data || [],
    nextCursor: data && data.length === PAGE_SIZE ? pageParam + 1 : undefined,
  };
};

export const AuditLogInfinite: React.FC<AuditLogInfiniteProps> = ({ filters = {} }) => {
  const { toast } = useToast();
  const observerTarget = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['audit-logs-infinite', filters],
    queryFn: ({ pageParam }) => fetchAuditLogs({ pageParam, filters }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allLogs = data?.pages.flatMap((page) => page.data) || [];

  if (isError) {
    toast({
      title: 'Erro',
      description: 'Falha ao carregar logs de auditoria',
      variant: 'destructive',
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Log de Auditoria Completo
            {allLogs.length > 0 && (
              <Badge variant="outline" className="ml-2">
                {allLogs.length} registros
              </Badge>
            )}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Carregando logs...</span>
            </div>
          ) : allLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum log de auditoria encontrado.
            </div>
          ) : (
            <>
              {allLogs.map((log: any) => (
                <EnhancedAuditLogCard 
                  key={log.id} 
                  log={log} 
                  userName={log.user_name || log.user_email || 'Sistema'}
                />
              ))}

              {/* Infinite scroll trigger */}
              <div ref={observerTarget} className="h-4" />

              {isFetchingNextPage && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Carregando mais...</span>
                </div>
              )}

              {!hasNextPage && allLogs.length > 0 && (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  Todos os logs foram carregados
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
