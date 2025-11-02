import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bug, Calendar, User, Search, ExternalLink, LayoutGrid, List } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorReportsKanban } from './ErrorReportsKanban';

export const ErrorReportsManagement: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  const { data: reports, isLoading, refetch } = useQuery({
    queryKey: ['error-reports', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('error_reports')
        .select(`
          *,
          user:user_id(email, user_profiles(name)),
          team:team_id(name)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const filteredReports = reports?.filter((report: any) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      report.report_number.toLowerCase().includes(search) ||
      report.what_trying_to_do.toLowerCase().includes(search) ||
      report.what_happened.toLowerCase().includes(search) ||
      report.user?.user_profiles?.[0]?.name?.toLowerCase().includes(search)
    );
  });

  const getUrgencyBadge = (urgency: string) => {
    const variants = {
      low: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', label: 'Baixo' },
      medium: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', label: 'Médio' },
      high: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', label: 'Alto' }
    };
    const variant = variants[urgency as keyof typeof variants] || variants.medium;
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      new: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', label: 'Novo' },
      in_progress: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400', label: 'Investigando' },
      resolved: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', label: 'Resolvido' },
      closed: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400', label: 'Fechado' }
    };
    const variant = variants[status as keyof typeof variants] || variants.new;
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reportes de Erro</h2>
          <p className="text-muted-foreground">
            {filteredReports?.length || 0} reportes encontrados
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setViewMode(viewMode === 'list' ? 'kanban' : 'list')}
        >
          {viewMode === 'list' ? (
            <>
              <LayoutGrid className="h-4 w-4 mr-2" />
              Modo Kanban
            </>
          ) : (
            <>
              <List className="h-4 w-4 mr-2" />
              Modo Lista
            </>
          )}
        </Button>
      </div>

      {viewMode === 'kanban' ? (
        <ErrorReportsKanban />
      ) : (
        <>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número, descrição ou usuário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="new">Novos</SelectItem>
                <SelectItem value="in_progress">Em Investigação</SelectItem>
                <SelectItem value="resolved">Resolvidos</SelectItem>
                <SelectItem value="closed">Fechados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {filteredReports?.map((report: any) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <Bug className="h-4 w-4" />
                        {report.report_number}
                      </CardTitle>
                      <CardDescription className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {report.user?.user_profiles?.[0]?.name || report.user?.email}
                        </span>
                        {report.team && (
                          <span>• {report.team.name}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(report.created_at), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(report.status)}
                      {getUrgencyBadge(report.urgency)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">O que tentou fazer:</p>
                      <p className="text-sm text-muted-foreground">{report.what_trying_to_do}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">O que aconteceu:</p>
                      <p className="text-sm text-muted-foreground">{report.what_happened}</p>
                    </div>
                    {report.screenshot_url && (
                      <div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={report.screenshot_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-3 w-3" />
                            Ver Screenshot
                          </a>
                        </Button>
                      </div>
                    )}
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        Ver dados técnicos
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                        {JSON.stringify(report.technical_data, null, 2)}
                      </pre>
                    </details>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
