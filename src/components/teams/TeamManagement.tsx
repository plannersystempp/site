import React, { useState, useEffect } from 'react';
import { useTeam } from '@/contexts/TeamContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ApprovalStatusBadge } from '@/components/shared/ApprovalStatusBadge';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Trash2, Users, Mail, Settings, Crown, Check, X, Clock, DollarSign, RefreshCw, MoreVertical, Edit, UserMinus, User, Loader2, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { NoTeamSelected } from '@/components/shared/NoTeamSelected';
import { CreateUserByAdmin } from '@/components/admin/CreateUserByAdmin';
import { useToast } from '@/hooks/use-toast';
import { useCheckSubscriptionLimits } from '@/hooks/useCheckSubscriptionLimits';
import { UpgradePrompt } from '@/components/subscriptions/UpgradePrompt';

interface TeamMemberWithProfile {
  team_id: string;
  user_id: string;
  role: 'admin' | 'coordinator' | 'financeiro';
  status: 'pending' | 'approved' | 'rejected';
  joined_at: string;
  user_profiles: {
    name: string;
    email: string;
  };
}

export const TeamManagement: React.FC = () => {
  const { activeTeam, userRole, updateMemberRole, updateMemberStatus, getTeamMembers, refreshTeams } = useTeam();
  const [members, setMembers] = useState<TeamMemberWithProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<TeamMemberWithProfile[]>([]);
  const [rejectedMembers, setRejectedMembers] = useState<TeamMemberWithProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPending, setLoadingPending] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<{ userId: string, name: string, currentRole: string } | null>(null);
  const { toast } = useToast();
  const [upgradePromptOpen, setUpgradePromptOpen] = useState(false);
  const [limitCheckResult, setLimitCheckResult] = useState<any>(null);
  const checkLimits = useCheckSubscriptionLimits();
  
  // Estados para aprovação com seleção de role
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [userToApprove, setUserToApprove] = useState<{userId: string, userName: string} | null>(null);
  const [selectedRoleForApproval, setSelectedRoleForApproval] = useState<'admin' | 'coordinator' | 'financeiro'>('coordinator');
  
  // Estado para controle de acesso de coordenadores ao módulo de fornecedores
  const [allowCoordinatorsSuppliers, setAllowCoordinatorsSuppliers] = useState(activeTeam?.allow_coordinators_suppliers || false);
  
  // Sincronizar estado quando activeTeam mudar
  useEffect(() => {
    if (activeTeam) {
      setAllowCoordinatorsSuppliers(activeTeam.allow_coordinators_suppliers || false);
    }
  }, [activeTeam]);

  const handleToggleSuppliersAccess = async (enabled: boolean) => {
    if (!activeTeam) return;
    
    try {
      const { error } = await supabase
        .from('teams')
        .update({ allow_coordinators_suppliers: enabled })
        .eq('id', activeTeam.id);
      
      if (error) throw error;
      
      setAllowCoordinatorsSuppliers(enabled);
      await refreshTeams(); // Atualizar contexto
      
      toast({
        title: enabled ? "Acesso liberado" : "Acesso restrito",
        description: enabled 
          ? "Coordenadores agora podem acessar o módulo de Fornecedores" 
          : "Coordenadores não podem mais acessar o módulo de Fornecedores"
      });
    } catch (error) {
      console.error('Error updating suppliers access:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar permissões",
        variant: "destructive"
      });
    }
  };

  const fetchMembers = async () => {
    if (!activeTeam) return;
    
    try {
      setLoading(true);
      
      // Fetch team members and user profiles separately to avoid join issues
      const { data: teamMembers, error: membersError } = await supabase
        .from('team_members')
        .select('team_id, user_id, role, status, joined_at')
        .eq('team_id', activeTeam.id);

      if (membersError) throw membersError;

      if (!teamMembers || teamMembers.length === 0) {
        setMembers([]);
        setPendingRequests([]);
        setRejectedMembers([]);
        return;
      }

      // Get user profiles for all team members
      const userIds = teamMembers.map(member => member.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('user_id, name, email')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // For users without complete profile data, fetch from auth.users
      const authUsersResponse = await supabase.auth.admin.listUsers();
      const authUsers = authUsersResponse.data?.users || [];
      
      // Combine team member data with profile data
      const membersWithProfiles = teamMembers.map(member => {
        const profile = profiles?.find(p => p.user_id === member.user_id);
        const authUser = authUsers.find(u => u.id === member.user_id);
        
        // Use profile data if available and not empty, otherwise fallback to auth user data
        const name = (profile?.name && profile.name.trim() !== '') 
          ? profile.name 
          : (authUser?.user_metadata?.name || authUser?.email?.split('@')[0] || 'Usuário');
        
        const email = (profile?.email && profile.email.trim() !== '') 
          ? profile.email 
          : (authUser?.email || 'Email não disponível');
        
        return {
          ...member,
          user_profiles: { name, email }
        };
      }) as TeamMemberWithProfile[];
      
      // Separar membros aprovados, pendentes e rejeitados
      const approved = membersWithProfiles.filter(member => member.status === 'approved');
      const pending = membersWithProfiles.filter(member => member.status === 'pending');
      const rejected = membersWithProfiles.filter(member => member.status === 'rejected');
      
      setMembers(approved);
      setPendingRequests(pending);
      setRejectedMembers(rejected);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar membros da equipe",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    if (!activeTeam) return;
    
    try {
      setLoadingPending(true);
      const teamMembers = await getTeamMembers() as TeamMemberWithProfile[];
      const pending = teamMembers.filter(member => member.status === 'pending');
      setPendingRequests(pending);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    } finally {
      setLoadingPending(false);
    }
  };

  const handleRemoveUser = async (userId: string, userName: string) => {
    if (!activeTeam) return;

    // Obter usuário atual
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user?.id === userId) {
      toast({
        title: "Ação não permitida",
        description: "Você não pode remover a si mesmo da equipe.",
        variant: "destructive"
      });
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja remover ${userName} da equipe?\n\nEsta ação é irreversível e o usuário perderá todo acesso aos dados da equipe.`
    );
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', activeTeam.id)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Usuário removido",
        description: `${userName} foi removido da equipe.`
      });

      fetchMembers();
    } catch (error) {
      console.error('Error removing user:', error);
      toast({
        title: "Erro",
        description: "Falha ao remover usuário",
        variant: "destructive"
      });
    }
  };

  const handleDisapproveMember = async (userId: string, userName: string) => {
    if (!activeTeam) return;

    const confirmed = window.confirm(
      `Tem certeza que deseja desaprovar o acesso de ${userName}?\n\nO usuário perderá acesso à equipe mas não será removido completamente.`
    );
    if (!confirmed) return;

    try {
      await updateMemberStatus(userId, 'rejected');
      fetchMembers();
    } catch (error) {
      console.error('Error disapproving member:', error);
    }
  };

  const handleChangeRole = (userId: string, userName: string, currentRole: string) => {
    setSelectedMember({ userId, name: userName, currentRole });
    setRoleDialogOpen(true);
  };

  const handleRoleChange = async (newRole: 'admin' | 'coordinator' | 'financeiro') => {
    if (!selectedMember || !activeTeam) return;
    
    // Verificar se é o único admin sendo rebaixado
    if (selectedMember.currentRole === 'admin' && newRole !== 'admin') {
      const adminCount = members.filter(m => m.role === 'admin').length;
      
      if (adminCount === 1) {
        toast({
          title: "Ação não permitida",
          description: "A equipe precisa ter pelo menos um administrador. Promova outro membro a admin antes de rebaixar este usuário.",
          variant: "destructive"
        });
        return;
      }
    }

    // Confirmação adicional para promover a admin
    if (newRole === 'admin') {
      const confirmed = window.confirm(
        `ATENÇÃO: Você está prestes a promover ${selectedMember.name} para Administrador.\n\n` +
        `Administradores têm acesso TOTAL à equipe, incluindo:\n` +
        `- Gerenciar todos os membros\n` +
        `- Deletar dados\n` +
        `- Acessar dados financeiros sensíveis\n\n` +
        `Tem certeza?`
      );
      if (!confirmed) return;
    }
    
    try {
      await updateMemberRole(selectedMember.userId, newRole);

      const roleLabels = {
        admin: 'Administrador',
        coordinator: 'Coordenador',
        financeiro: 'Financeiro'
      };

      toast({
        title: "Função alterada!",
        description: `${selectedMember.name} agora é ${roleLabels[newRole]}.`
      });

      setRoleDialogOpen(false);
      fetchMembers();
    } catch (error) {
      console.error('Error changing role:', error);
    }
  };

  const handleApproveRequest = async (userId: string, userName: string) => {
    if (!activeTeam) return;

    try {
      // Check subscription limits before approving
      const result = await checkLimits.mutateAsync({
        teamId: activeTeam.id,
        action: 'add_member'
      });

      if (!result.can_proceed) {
        setLimitCheckResult(result);
        setUpgradePromptOpen(true);
        return;
      }

      // Abrir dialog para escolher role
      setUserToApprove({ userId, userName });
      setSelectedRoleForApproval('coordinator'); // Default
      setApprovalDialogOpen(true);
    } catch (error) {
      console.error('Error checking limits:', error);
      toast({
        title: "Erro",
        description: "Falha ao verificar limites da assinatura",
        variant: "destructive"
      });
    }
  };

  const confirmApproval = async () => {
    if (!activeTeam || !userToApprove) return;

    try {
      setLoadingPending(true);

      const { data, error } = await supabase.rpc('approve_team_member_with_role', {
        p_team_id: activeTeam.id,
        p_user_id: userToApprove.userId,
        p_role: selectedRoleForApproval
      });

      if (error) throw error;

      const roleLabels = {
        admin: 'Administrador',
        coordinator: 'Coordenador',
        financeiro: 'Financeiro'
      };

      toast({
        title: "Acesso aprovado!",
        description: `${userToApprove.userName} foi aprovado como ${roleLabels[selectedRoleForApproval]} e agora tem acesso à equipe.`
      });

      setApprovalDialogOpen(false);
      setUserToApprove(null);
      fetchMembers();
    } catch (error) {
      console.error('Error approving user:', error);
      toast({
        title: "Erro",
        description: "Falha ao aprovar usuário",
        variant: "destructive"
      });
    } finally {
      setLoadingPending(false);
    }
  };

  const handleRejectRequest = async (userId: string, userName: string) => {
    if (!activeTeam) return;

    const confirmed = window.confirm(`Tem certeza que deseja rejeitar a solicitação de ${userName}?`);
    if (!confirmed) return;

    try {
      setLoadingPending(true);
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', activeTeam.id)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Solicitação rejeitada",
        description: `A solicitação de ${userName} foi rejeitada.`
      });

      fetchMembers();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Erro",
        description: "Falha ao rejeitar solicitação",
        variant: "destructive"
      });
    } finally {
      setLoadingPending(false);
    }
  };

  const getRoleBadgeProps = (role: string) => {
    switch (role) {
      case 'admin':
        return { variant: 'default' as const, icon: Crown, label: 'Administrador' };
      case 'coordinator':
        return { variant: 'secondary' as const, icon: Users, label: 'Coordenador' };
      case 'financeiro':
        return { variant: 'outline' as const, icon: DollarSign, label: 'Financeiro' };
      default:
        return { variant: 'outline' as const, icon: Users, label: 'Membro' };
    }
  };

  const getStatusBadge = (status: string) => <ApprovalStatusBadge status={status as any} />;

  useEffect(() => {
    if (activeTeam) {
      fetchMembers();
    }
  }, [activeTeam]);

  if (!activeTeam) {
    return (
      <NoTeamSelected
        title="Gerenciamento de Equipe"
        description="Selecione uma equipe para gerenciar seus membros."
      />
    );
  }

  if (userRole !== 'admin') {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground">
              Apenas administradores podem gerenciar membros da equipe.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Seu papel atual: <Badge variant="secondary">{userRole === 'coordinator' ? 'Coordenador' : 'Membro'}</Badge>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 relative min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
        <div className="w-full">
          <h1 className="text-xl sm:text-2xl font-bold">Gerenciar Equipe</h1>
          <p className="text-sm text-muted-foreground">{activeTeam.name}</p>
          <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-200">Código de Convite:</p>
            <code className="text-base sm:text-lg font-mono font-bold text-blue-900 dark:text-blue-100 break-all">
              {(activeTeam as any).invite_code || 'Carregando...'}
            </code>
            <p className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 mt-1">
              Compartilhe este código com novos membros para que possam solicitar acesso à equipe
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={fetchMembers}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar Lista
          </Button>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <UserPlus className="w-4 h-4 mr-2" />
                Cadastrar Usuário
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Seção de Configurações da Equipe */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações da Equipe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="suppliers-access" className="text-base font-medium">
                  Acesso de Coordenadores ao Módulo de Fornecedores
                </Label>
                <p className="text-sm text-muted-foreground">
                  Permite que coordenadores visualizem e gerenciem fornecedores da equipe
                </p>
              </div>
            </div>
            <Switch
              id="suppliers-access"
              checked={allowCoordinatorsSuppliers}
              onCheckedChange={handleToggleSuppliersAccess}
            />
          </div>
        </CardContent>
      </Card>

      {/* Seção de Solicitações Pendentes */}
      {pendingRequests.length > 0 && (
        <Card className="border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <Clock className="w-5 h-5" />
              Solicitações Pendentes ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div
                  key={request.user_id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-orange-200 dark:border-orange-800 rounded-lg bg-white dark:bg-card"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{request.user_profiles?.name || 'Nome não disponível'}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {request.user_profiles?.email || 'Email não disponível'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Solicitado em {new Date(request.joined_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleApproveRequest(request.user_id, request.user_profiles?.name || 'usuário')}
                      disabled={loadingPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 sm:mr-1" />
                      <span className="hidden sm:inline">Aprovar</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRejectRequest(request.user_id, request.user_profiles?.name || 'usuário')}
                      disabled={loadingPending}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 sm:mr-1" />
                      <span className="hidden sm:inline">Rejeitar</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seção de Membros Desaprovados */}
      {rejectedMembers.length > 0 && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <UserMinus className="w-5 h-5" />
              Membros Desaprovados ({rejectedMembers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rejectedMembers.map((member) => (
                <div
                  key={member.user_id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-red-200 dark:border-red-800 rounded-lg bg-white dark:bg-card"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserMinus className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{member.user_profiles?.name || 'Nome não disponível'}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {member.user_profiles?.email || 'Email não disponível'}
                      </p>
                      <div className="mt-1">
                        {getStatusBadge(member.status)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleApproveRequest(member.user_id, member.user_profiles?.name || 'usuário')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 sm:mr-1" />
                      <span className="hidden sm:inline">Reaprovar</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveUser(member.user_id, member.user_profiles?.name || 'usuário')}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 sm:mr-1" />
                      <span className="hidden sm:inline">Remover</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Membros da Equipe ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhum membro encontrado nesta equipe.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Comece convidando usuários para colaborar.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {members.map((member) => {
                const badgeProps = getRoleBadgeProps(member.role);
                const BadgeIcon = badgeProps.icon;
                
                return (
                  <div
                    key={member.user_id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{member.user_profiles?.name || 'Nome não disponível'}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {member.user_profiles?.email || 'Email não disponível'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Membro desde {new Date(member.joined_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-center">
                      <Badge variant={badgeProps.variant} className="flex items-center gap-1 whitespace-nowrap">
                        <BadgeIcon className="w-3 h-3" />
                        {badgeProps.label}
                      </Badge>
                      
                      {member.role !== 'admin' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 bg-background z-50">
                            <DropdownMenuItem onClick={() => handleChangeRole(member.user_id, member.user_profiles?.name || 'usuário', member.role)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Alterar Função
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem onClick={() => handleDisapproveMember(member.user_id, member.user_profiles?.name || 'usuário')}>
                              <UserMinus className="w-4 h-4 mr-2" />
                              Desaprovar Acesso
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem 
                              onClick={() => handleRemoveUser(member.user_id, member.user_profiles?.name || 'este usuário')}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remover da Equipe
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para alterar função */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Função de {selectedMember?.name}</DialogTitle>
            <DialogDescription>
              Função atual: <Badge variant="outline">{selectedMember?.currentRole === 'admin' ? 'Administrador' : selectedMember?.currentRole === 'coordinator' ? 'Coordenador' : 'Financeiro'}</Badge>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              onClick={() => handleRoleChange('coordinator')}
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-muted-foreground" />
                <div className="text-left">
                  <div className="font-medium">Coordenador</div>
                  <div className="text-xs text-muted-foreground">Gerencia eventos e pessoal</div>
                </div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              onClick={() => handleRoleChange('financeiro')}
            >
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-muted-foreground" />
                <div className="text-left">
                  <div className="font-medium">Financeiro</div>
                  <div className="text-xs text-muted-foreground">Acesso a folhas de pagamento</div>
                </div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              onClick={() => handleRoleChange('admin')}
            >
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-muted-foreground" />
                <div className="text-left">
                  <div className="font-medium">Administrador</div>
                  <div className="text-xs text-muted-foreground">Controle total da equipe</div>
                </div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Aprovação com Seleção de Role */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Aprovar Acesso</DialogTitle>
            <DialogDescription>
              Escolha o nível de acesso para <strong>{userToApprove?.userName}</strong> na equipe:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="approval-role">Nível de Acesso</Label>
              <Select 
                value={selectedRoleForApproval} 
                onValueChange={(value: 'admin' | 'coordinator' | 'financeiro') => setSelectedRoleForApproval(value)}
              >
                <SelectTrigger id="approval-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coordinator">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Coordenador</span>
                      <span className="text-xs text-muted-foreground">Pode gerenciar eventos e alocações</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="financeiro">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Financeiro</span>
                      <span className="text-xs text-muted-foreground">Acesso a relatórios financeiros e folha de pagamento</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Administrador</span>
                      <span className="text-xs text-muted-foreground">Acesso total à equipe (gerenciar membros, deletar dados, etc)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedRoleForApproval === 'admin' && (
              <div className="rounded-md bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 p-3">
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  <strong>⚠️ Atenção:</strong> Administradores têm acesso TOTAL à equipe, incluindo dados sensíveis e capacidade de deletar informações.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmApproval} disabled={loadingPending}>
              {loadingPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Aprovar Acesso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Componente para criar usuário */}
      <CreateUserByAdmin
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={() => {
          // Force immediate refresh after user creation
          setTimeout(fetchMembers, 100);
        }}
      />

      <UpgradePrompt
        open={upgradePromptOpen}
        onOpenChange={setUpgradePromptOpen}
        reason={limitCheckResult?.reason || ''}
        currentPlan={limitCheckResult?.current_plan}
        limit={limitCheckResult?.limit}
        currentCount={limitCheckResult?.current_count}
      />
    </div>
  );
};