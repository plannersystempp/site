import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, UserPlus, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { UserManagementDialog } from './UserManagementDialog';

interface OrphanUser {
  user_id: string;
  email: string;
  created_at: string;
  has_profile: boolean;
  has_team: boolean;
  metadata: any;
}

interface Team {
  id: string;
  name: string;
}

interface OrphanUsersTabProps {
  teams: Team[];
}

export const OrphanUsersTab: React.FC<OrphanUsersTabProps> = ({ teams }) => {
  const { toast } = useToast();
  const [orphanUsers, setOrphanUsers] = useState<OrphanUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<OrphanUser | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchOrphanUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_orphan_users');

      if (error) {
        console.error('Error fetching orphan users:', error);
        toast({
          title: 'Erro',
          description: 'Falha ao carregar usuários órfãos',
          variant: 'destructive',
        });
        return;
      }

      setOrphanUsers(data || []);
    } catch (error) {
      console.error('Error fetching orphan users:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar usuários órfãos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrphanUsers();
  }, []);

  const handleAssignUser = (user: OrphanUser) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const getOrphanType = (user: OrphanUser) => {
    if (!user.has_profile && !user.has_team) {
      return { label: 'Crítico', variant: 'destructive' as const, desc: 'Sem perfil e sem equipe' };
    } else if (!user.has_profile) {
      return { label: 'Sem Perfil', variant: 'destructive' as const, desc: 'Falta criar perfil' };
    } else if (!user.has_team) {
      return { label: 'Sem Equipe', variant: 'secondary' as const, desc: 'Falta associar a equipe' };
    }
    return { label: 'Desconhecido', variant: 'secondary' as const, desc: '' };
  };

  return (
    <div className="space-y-6">
      {/* Warning Card */}
      <Card className="border-orange-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <AlertCircle className="h-5 w-5" />
            Usuários Órfãos Detectados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Estes usuários existem no sistema de autenticação mas estão incompletos. Eles podem ter sido criados
            antes de falhas no processo de cadastro ou serem resultados de problemas técnicos. Associe-os a equipes
            ou exclua-os para manter o sistema limpo.
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Órfãos</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{orphanUsers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sem Perfil</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {orphanUsers.filter((u) => !u.has_profile).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sem Equipe</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {orphanUsers.filter((u) => u.has_profile && !u.has_team).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orphan Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Usuários Órfãos</CardTitle>
            <Button variant="outline" size="sm" onClick={fetchOrphanUsers} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>E-mail</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Metadados</TableHead>
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
              ) : orphanUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhum usuário órfão encontrado. Ótimo! 🎉
                  </TableCell>
                </TableRow>
              ) : (
                orphanUsers.map((user) => {
                  const orphanType = getOrphanType(user);
                  return (
                    <TableRow key={user.user_id}>
                      <TableCell>
                        <div className="font-medium">{user.email}</div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(user.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={orphanType.variant}>{orphanType.label}</Badge>
                        <div className="text-xs text-muted-foreground mt-1">{orphanType.desc}</div>
                      </TableCell>
                      <TableCell>
                        {user.metadata?.name && (
                          <div className="text-sm">Nome: {user.metadata.name}</div>
                        )}
                        {user.metadata?.companyName && (
                          <div className="text-sm">Empresa: {user.metadata.companyName}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAssignUser(user)}
                          className="flex items-center gap-2"
                        >
                          <UserPlus className="h-4 w-4" />
                          Associar
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Management Dialog */}
      {selectedUser && (
        <UserManagementDialog
          isOpen={dialogOpen}
          onClose={() => {
            setDialogOpen(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            fetchOrphanUsers();
          }}
          userId={selectedUser.user_id}
          userName={selectedUser.metadata?.name || selectedUser.email}
          currentRole="user"
          currentApproved={false}
          currentTeamId={null}
          currentTeamName={null}
          teams={teams}
          actionType="assign"
        />
      )}
    </div>
  );
};
