
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, RefreshCw, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AuditEntry {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string;
  old_values: any;
  new_values: any;
  created_at: string;
  user_email: string;
}

export const AuditLog: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      // First get the audit logs
      const { data: logs, error: logsError } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;

      // Then get user profiles for email mapping
      const userIds = logs?.map(log => log.user_id) || [];
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('user_id, email')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Create email mapping
      const emailMap = new Map();
      profiles?.forEach(profile => {
        emailMap.set(profile.user_id, profile.email);
      });

      const formattedLogs = logs?.map(log => ({
        ...log,
        user_email: emailMap.get(log.user_id) || 'Email não encontrado'
      })) || [];

      setAuditLogs(formattedLogs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar logs de auditoria",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'INSERT': return 'Criação';
      case 'UPDATE': return 'Atualização';
      case 'DELETE': return 'Exclusão';
      default: return action;
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Log de Auditoria
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAuditLogs}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-4">Carregando logs...</div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center py-4">Nenhum log de auditoria encontrado.</div>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="flex items-start justify-between p-3 border rounded-lg text-sm">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge className={getActionColor(log.action)}>
                      {getActionLabel(log.action)}
                    </Badge>
                    <span className="font-medium">{log.table_name}</span>
                    <span className="text-muted-foreground">por {log.user_email}</span>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(log.created_at).toLocaleString('pt-BR')}
                  </div>
                  {log.record_id && (
                    <div className="text-xs text-muted-foreground">
                      ID do Registro: {log.record_id}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
