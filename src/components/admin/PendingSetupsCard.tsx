import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, RefreshCw, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PendingSetup {
  id: string;
  user_id: string;
  email: string;
  metadata: any;
  error_message: string;
  retry_count: number;
  created_at: string;
  last_retry_at: string | null;
  resolved: boolean;
}

export const PendingSetupsCard: React.FC = () => {
  const { toast } = useToast();
  const [pendingSetups, setPendingSetups] = useState<PendingSetup[]>([]);
  const [loading, setLoading] = useState(false);
  const [retrying, setRetrying] = useState<string | null>(null);

  const fetchPendingSetups = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pending_user_setups')
        .select('*')
        .eq('resolved', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending setups:', error);
        toast({
          title: 'Erro',
          description: 'Falha ao carregar setups pendentes',
          variant: 'destructive',
        });
        return;
      }

      setPendingSetups(data || []);
    } catch (error) {
      console.error('Error fetching pending setups:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar setups pendentes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetrySetup = async (userId: string) => {
    setRetrying(userId);
    try {
      const { data, error } = await supabase.rpc('retry_pending_user_setup', {
        p_user_id: userId,
      });

      if (error) throw error;

      const result = data as { success: boolean; message: string };

      if (result.success) {
        toast({
          title: 'Sucesso',
          description: result.message,
        });
        fetchPendingSetups();
      } else {
        toast({
          title: 'Falha ao resolver',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error retrying setup:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao tentar resolver setup',
        variant: 'destructive',
      });
    } finally {
      setRetrying(null);
    }
  };

  useEffect(() => {
    fetchPendingSetups();
  }, []);

  if (pendingSetups.length === 0 && !loading) {
    return null;
  }

  return (
    <Card className="border-yellow-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-yellow-600">
            <AlertTriangle className="h-5 w-5" />
            Setups Pendentes ({pendingSetups.length})
          </CardTitle>
          <Button variant="outline" size="sm" onClick={fetchPendingSetups} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Estes usuários falharam no processo automático de setup. Você pode tentar resolver manualmente clicando
          em "Tentar Novamente".
        </p>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>E-mail</TableHead>
              <TableHead>Erro</TableHead>
              <TableHead>Tentativas</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : (
              pendingSetups.map((setup) => (
                <TableRow key={setup.id}>
                  <TableCell>
                    <div className="font-medium">{setup.email}</div>
                    {setup.metadata?.name && (
                      <div className="text-xs text-muted-foreground">{setup.metadata.name}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-red-600 max-w-xs truncate" title={setup.error_message}>
                      {setup.error_message}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={setup.retry_count > 3 ? 'destructive' : 'secondary'}>
                      {setup.retry_count}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {format(new Date(setup.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </div>
                    {setup.last_retry_at && (
                      <div className="text-xs text-muted-foreground">
                        Última tentativa: {format(new Date(setup.last_retry_at), 'dd/MM HH:mm', { locale: ptBR })}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRetrySetup(setup.user_id)}
                      disabled={retrying === setup.user_id}
                      className="flex items-center gap-2"
                    >
                      {retrying === setup.user_id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      Tentar Novamente
                    </Button>
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
