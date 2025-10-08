import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Trash2, User, Users } from 'lucide-react';
import { formatDate } from '@/utils/formatters';

interface DeletionLog {
  id: string;
  deleted_by: string | null;
  deletion_type: string;
  deleted_entity_id: string;
  deleted_entity_type: string;
  deleted_entity_name: string | null;
  reason: string | null;
  data_summary: any;
  deleted_at: string;
}

export const DeletionLogsTab: React.FC = () => {
  const [logs, setLogs] = useState<DeletionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('deletion_logs')
        .select('*')
        .order('deleted_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      
      setLogs(data || []);
    } catch (error: any) {
      console.error('Error fetching deletion logs:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar logs de exclusão",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'user_self': 'Auto-exclusão',
      'user_by_admin': 'Exclusão por Admin',
      'team_by_admin': 'Exclusão de Equipe'
    };
    return labels[type] || type;
  };

  const getTypeVariant = (type: string): "default" | "secondary" | "destructive" => {
    if (type === 'user_self') return 'secondary';
    if (type === 'team_by_admin') return 'destructive';
    return 'default';
  };

  const getEntityIcon = (type: string) => {
    return type === 'team' ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Logs de Exclusão</CardTitle>
          <Button onClick={fetchLogs} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Tipo de Exclusão</TableHead>
              <TableHead>Entidade</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead>Resumo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Nenhum log de exclusão encontrado
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(log.deleted_at)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTypeVariant(log.deletion_type)}>
                      {getTypeLabel(log.deletion_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getEntityIcon(log.deleted_entity_type)}
                      <span className="capitalize">{log.deleted_entity_type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {log.deleted_entity_name || <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell className="max-w-xs truncate" title={log.reason || ''}>
                    {log.reason || <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell>
                    {log.data_summary && (
                      <div className="text-xs space-y-1">
                        {log.data_summary.events_count !== undefined && (
                          <div>Eventos: {log.data_summary.events_count}</div>
                        )}
                        {log.data_summary.personnel_count !== undefined && (
                          <div>Pessoal: {log.data_summary.personnel_count}</div>
                        )}
                        {log.data_summary.member_count !== undefined && (
                          <div>Membros: {log.data_summary.member_count}</div>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
