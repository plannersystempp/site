import React, { useState, useEffect } from 'react';
import { useTeam } from '@/contexts/TeamContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { UserPlus, Trash2, Users, Mail, Settings, Crown, Check, X, Clock, DollarSign, RefreshCw, MoreVertical, Edit, UserMinus, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { NoTeamSelected } from '@/components/shared/NoTeamSelected';
import { CreateUserByAdmin } from '@/components/admin/CreateUserByAdmin';
import { useToast } from '@/hooks/use-toast';

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
  const { activeTeam, userRole, updateMemberRole, updateMemberStatus, getTeamMembers } = useTeam();
  const [members, setMembers] = useState<TeamMemberWithProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<TeamMemberWithProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPending, setLoadingPending] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<{ userId: string, name: string, currentRole: string } | null>(null);
  const { toast } = useToast();

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
        return;
      }

      // Get user profiles for all team members
      const userIds = teamMembers.map(member => member.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('user_id, name, email')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Combine team member data with profile data
      const membersWithProfiles = teamMembers.map(member => {
        const profile = profiles?.find(p => p.user_id === member.user_id);
        return {
          ...member,
          user_profiles: profile ? { name: profile.name, email: profile.email } : { name: '', email: '' }
        };
      }) as TeamMemberWithProfile[];
      
      // Separar membros aprovados dos pendentes
      const approved = membersWithProfiles.filter(member => member.status === 'approved');
      const pending = membersWithProfiles.filter(member => member.status === 'pending');
      
      setMembers(approved);
      setPendingRequests(pending);
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
      setLoadingPending(true);
      const { error } = await supabase
        .from('team_members')
        .update({ status: 'approved' })
        .eq('team_id', activeTeam.id)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Solicitação aprovada!",
        description: `${userName} agora tem acesso à equipe.`
      });

      fetchMembers();
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Erro",
        description: "Falha ao aprovar solicitação",
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
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gerenciar Equipe</h1>
          <p className="text-muted-foreground">{activeTeam.name}</p>
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-800">Código de Convite:</p>
            <code className="text-lg font-mono font-bold text-blue-900">
              {(activeTeam as any).invite_code || 'Carregando...'}
            </code>
            <p className="text-xs text-blue-600 mt-1">
              Compartilhe este código com novos membros para que possam solicitar acesso à equipe
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchMembers}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar Lista
          </Button>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Cadastrar Usuário
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Seção de Solicitações Pendentes */}
      {pendingRequests.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <Clock className="w-5 h-5" />
              Solicitações Pendentes ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div
                  key={request.user_id}
                  className="flex items-center justify-between p-4 border border-orange-200 rounded-lg bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">{request.user_profiles?.name || 'Nome não disponível'}</p>
                      <p className="text-sm text-muted-foreground">
                        {request.user_profiles?.email || 'Email não disponível'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Solicitado em {new Date(request.joined_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApproveRequest(request.user_id, request.user_profiles?.name || 'usuário')}
                      disabled={loadingPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRejectRequest(request.user_id, request.user_profiles?.name || 'usuário')}
                      disabled={loadingPending}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Rejeitar
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
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{member.user_profiles?.name || 'Nome não disponível'}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.user_profiles?.email || 'Email não disponível'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Membro desde {new Date(member.joined_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={badgeProps.variant} className="flex items-center gap-1">
                        <BadgeIcon className="w-3 h-3" />
                        {badgeProps.label}
                      </Badge>
                      
                      {member.role !== 'admin' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost">
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

      {/* Componente para criar usuário */}
      <CreateUserByAdmin
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={() => {
          // Force immediate refresh after user creation
          setTimeout(fetchMembers, 100);
        }}
      />
    </div>
  );
};