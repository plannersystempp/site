
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Users, UserCheck, UserX, Trash2, Mail, UserCog, Shield, UserPlus, UserMinus } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EnhancedAuditLogCard } from '@/components/admin/EnhancedAuditLogCard';
import { OrphanUsersTab } from '@/components/admin/OrphanUsersTab';
import { UserManagementDialog } from '@/components/admin/UserManagementDialog';
import { TeamManagementTab } from '@/components/admin/TeamManagementTab';
import { DeletionLogsTab } from '@/components/admin/DeletionLogsTab';
import { SubscriptionManagementTab } from '@/components/subscriptions/SubscriptionManagementTab';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SuperAdminUser {
  user_id: string;
  email: string;
  name: string;
  role: string;
  is_approved: boolean;
  team_name: string | null;
  team_id: string | null;
  last_sign_in_at: string | null;
  created_at: string;
}

interface AuditLog {
  id: string;
  user_name: string | null;
  user_email: string | null;
  team_name: string | null;
  action: string;
  table_name: string;
  entity_name: string | null;
  record_id: string | null;
  old_values: any;
  new_values: any;
  changed_fields: any;
  action_summary: string;
  created_at: string;
}

interface Team {
  id: string;
  name: string;
}

export default function SuperAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // States
  const [users, setUsers] = useState<SuperAdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  // Management dialog state
  const [managementDialog, setManagementDialog] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
    currentRole: string;
    currentApproved: boolean;
    currentTeamId: string | null;
    currentTeamName: string | null;
    actionType: 'approve' | 'role' | 'assign' | 'remove' | 'delete';
  }>({
    isOpen: false,
    userId: '',
    userName: '',
    currentRole: '',
    currentApproved: false,
    currentTeamId: null,
    currentTeamName: null,
    actionType: 'approve',
  });
  
  // Filters
  const [userFilter, setUserFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchText, setSearchText] = useState('');
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Check if user is superadmin
  if (!user || user.role !== 'superadmin') {
    return <Navigate to="/app" replace />;
  }

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_all_users_for_superadmin');
      
      if (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Erro",
          description: "Falha ao carregar usuários",
          variant: "destructive"
        });
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar usuários",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name')
        .order('name');
      
      if (error) {
        console.error('Error fetching teams:', error);
        return;
      }

      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_audit_logs_for_superadmin_enriched', {
        search_text: searchText || null,
        team_filter: teamFilter === 'all' ? null : teamFilter,
        action_filter: actionFilter === 'all' ? null : actionFilter,
        start_date: startDate ? new Date(startDate).toISOString() : null,
        end_date: endDate ? new Date(endDate + 'T23:59:59').toISOString() : null
      });
      
      if (error) {
        console.error('Error fetching audit logs:', error);
        toast({
          title: "Erro",
          description: "Falha ao carregar logs de auditoria",
          variant: "destructive"
        });
        return;
      }

      setAuditLogs(data || []);
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

  const handleDeleteUsers = async () => {
    if (selectedUsers.length === 0) return;

    const confirmed = confirm(`Tem certeza que deseja excluir ${selectedUsers.length} usuário(s)? Esta ação não pode ser desfeita.`);
    if (!confirmed) return;

    try {
      const { data, error } = await supabase.functions.invoke('delete-users-by-superadmin', {
        body: { userIds: selectedUsers }
      });

      if (error) {
        toast({
          title: "Erro",
          description: "Falha ao excluir usuários",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: data.message
      });

      setSelectedUsers([]);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting users:', error);
      toast({
        title: "Erro",
        description: "Falha ao excluir usuários",
        variant: "destructive"
      });
    }
  };

  const handleNotifyUsers = () => {
    alert('Funcionalidade de notificação a ser implementada.');
  };

  const openManagementDialog = (
    user: SuperAdminUser,
    actionType: 'approve' | 'role' | 'assign' | 'remove' | 'delete'
  ) => {
    setManagementDialog({
      isOpen: true,
      userId: user.user_id,
      userName: user.name,
      currentRole: user.role,
      currentApproved: user.is_approved,
      currentTeamId: user.team_id,
      currentTeamName: user.team_name,
      actionType,
    });
  };

  const getInactiveDays = (lastSignIn: string | null) => {
    if (!lastSignIn) return null;
    return formatDistanceToNow(new Date(lastSignIn), { locale: ptBR });
  };

  const getFilteredUsers = () => {
    let filtered = users;

    if (userFilter === 'active') {
      filtered = filtered.filter(user => 
        !user.last_sign_in_at || 
        (new Date().getTime() - new Date(user.last_sign_in_at).getTime()) < 90 * 24 * 60 * 60 * 1000
      );
    } else if (userFilter === 'inactive') {
      filtered = filtered.filter(user => 
        user.last_sign_in_at && 
        (new Date().getTime() - new Date(user.last_sign_in_at).getTime()) >= 90 * 24 * 60 * 60 * 1000
      );
    }

    return filtered;
  };

  const getUserStats = () => {
    const total = users.length;
    const active = users.filter(user => 
      !user.last_sign_in_at || 
      (new Date().getTime() - new Date(user.last_sign_in_at).getTime()) < 90 * 24 * 60 * 60 * 1000
    ).length;
    const inactive = total - active;

    return { total, active, inactive };
  };

  useEffect(() => {
    fetchUsers();
    fetchTeams();
  }, []);

  useEffect(() => {
    fetchAuditLogs();
  }, [searchText, teamFilter, actionFilter, startDate, endDate]);

  const stats = getUserStats();
  const filteredUsers = getFilteredUsers();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Super Administração</h1>
          <p className="text-muted-foreground">Gerenciamento global da plataforma SIGE</p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 md:grid-cols-6 overflow-x-auto md:overflow-x-visible justify-start md:justify-center">
          <TabsTrigger value="users" className="flex-shrink-0">Usuários</TabsTrigger>
          <TabsTrigger value="teams" className="flex-shrink-0">Equipes</TabsTrigger>
          <TabsTrigger value="subscriptions" className="flex-shrink-0">Assinaturas</TabsTrigger>
          <TabsTrigger value="orphans" className="flex-shrink-0">Órfãos</TabsTrigger>
          <TabsTrigger value="deletion-logs" className="flex-shrink-0">Exclusões</TabsTrigger>
          <TabsTrigger value="audit" className="flex-shrink-0">Auditoria</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários Inativos</CardTitle>
                <UserX className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Select value={userFilter} onValueChange={(value: any) => setUserFilter(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Status do usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="inactive">Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {selectedUsers.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleNotifyUsers}
                    className="flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Notificar Selecionados ({selectedUsers.length})
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteUsers}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir Selecionados ({selectedUsers.length})
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedUsers(filteredUsers.map(u => u.user_id));
                          } else {
                            setSelectedUsers([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Último Acesso</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">Carregando...</TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => {
                      const inactiveDays = getInactiveDays(user.last_sign_in_at);
                      const isLongInactive = user.last_sign_in_at && 
                        (new Date().getTime() - new Date(user.last_sign_in_at).getTime()) > 90 * 24 * 60 * 60 * 1000;

                      return (
                        <TableRow key={user.user_id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedUsers.includes(user.user_id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUsers([...selectedUsers, user.user_id]);
                                } else {
                                  setSelectedUsers(selectedUsers.filter(id => id !== user.user_id));
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                              <Badge variant={user.role === 'superadmin' ? 'default' : 'secondary'}>
                                {user.role}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.team_name || 'Sem equipe'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.is_approved ? 'default' : 'destructive'}>
                              {user.is_approved ? 'Aprovado' : 'Pendente'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.last_sign_in_at ? (
                              <div className={isLongInactive ? 'text-red-600' : ''}>
                                há {inactiveDays}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Nunca</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-10 w-10 md:h-8 md:w-8 relative z-10">
                                  <UserCog className="h-5 w-5 md:h-4 md:w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="z-[9999]">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => openManagementDialog(user, 'approve')}
                                >
                                  <Shield className="mr-2 h-4 w-4" />
                                  {user.is_approved ? 'Desaprovar' : 'Aprovar'}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openManagementDialog(user, 'role')}
                                >
                                  <UserCog className="mr-2 h-4 w-4" />
                                  Alterar Função
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openManagementDialog(user, 'assign')}
                                >
                                  <UserPlus className="mr-2 h-4 w-4" />
                                  {user.team_id ? 'Trocar Equipe' : 'Associar à Equipe'}
                                </DropdownMenuItem>
                                {user.team_id && (
                                  <DropdownMenuItem
                                    onClick={() => openManagementDialog(user, 'remove')}
                                  >
                                    <UserMinus className="mr-2 h-4 w-4" />
                                    Remover da Equipe
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => openManagementDialog(user, 'delete')}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir Usuário
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orphans" className="space-y-6">
          <OrphanUsersTab teams={teams} />
        </TabsContent>

        <TabsContent value="teams" className="space-y-6">
          <TeamManagementTab />
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-6">
          <SubscriptionManagementTab />
        </TabsContent>

        <TabsContent value="deletion-logs" className="space-y-6">
          <DeletionLogsTab />
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          {/* Audit Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros Avançados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Input
                  placeholder="Buscar usuário..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                
                <Select value={teamFilter} onValueChange={setTeamFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {teams.filter(team => team.id).map(team => (
                      <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="INSERT">INSERT</SelectItem>
                    <SelectItem value="UPDATE">UPDATE</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="date"
                  placeholder="Data inicial"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />

                <Input
                  type="date"
                  placeholder="Data final"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Audit Logs */}
          <EnhancedAuditLogCard 
            logs={auditLogs}
            loading={loading}
            onRefresh={fetchAuditLogs}
          />
        </TabsContent>
      </Tabs>

      {/* User Management Dialog */}
      <UserManagementDialog
        isOpen={managementDialog.isOpen}
        onClose={() =>
          setManagementDialog((prev) => ({ ...prev, isOpen: false }))
        }
        onSuccess={() => {
          fetchUsers();
          setManagementDialog((prev) => ({ ...prev, isOpen: false }));
        }}
        userId={managementDialog.userId}
        userName={managementDialog.userName}
        currentRole={managementDialog.currentRole}
        currentApproved={managementDialog.currentApproved}
        currentTeamId={managementDialog.currentTeamId}
        currentTeamName={managementDialog.currentTeamName}
        teams={teams}
        actionType={managementDialog.actionType}
      />
    </div>
  );
}
