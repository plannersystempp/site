
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useTeam } from '@/contexts/TeamContext';
import { Users, Shield, Crown, User } from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  name: string;
  role: string;
  is_approved: boolean;
  created_at: string;
}

export const RoleManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { activeTeam } = useTeam();

  const fetchUsers = async () => {
    if (!activeTeam) return; // Não faz nada se não houver equipe ativa

    setLoading(true);
    try {
      // 1. Busca os IDs e papéis dos membros da equipe ativa
      const { data: members, error: membersError } = await supabase
        .from('team_members')
        .select('user_id, role, status')
        .eq('team_id', activeTeam.id);

      if (membersError) throw membersError;

      const userIds = members.map(member => member.user_id);

      if (userIds.length === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }

      // 2. Busca os perfis completos apenas para os membros da equipe
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // 3. Combina os dados de perfil com os dados de membro (papel, status)
      const combinedUsers = profiles.map(profile => {
        const memberInfo = members.find(m => m.user_id === profile.user_id);
        return {
          ...profile,
          role: memberInfo?.role || 'user',
          is_approved: memberInfo?.status === 'approved',
        };
      });

      setUsers(combinedUsers);

    } catch (error) {
      console.error('Error fetching team users:', error);
      toast({ 
        title: "Erro", 
        description: "Falha ao carregar usuários da equipe", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      // Get current user's role for validation
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        });
        return;
      }

      const { data: currentUserProfile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', currentUser.user.id)
        .single();

      const currentUserRole = currentUserProfile?.role;

      // Role hierarchy validation on frontend
      if (currentUserRole === 'admin') {
        if (newRole === 'superadmin') {
          toast({
            title: "Erro",
            description: "Administradores não podem criar ou modificar superadministradores",
            variant: "destructive"
          });
          return;
        }

        // Find the target user's current role
        const targetUser = users.find(u => u.user_id === userId);
        if (targetUser?.role === 'admin') {
          toast({
            title: "Erro", 
            description: "Administradores não podem modificar outros administradores",
            variant: "destructive"
          });
          return;
        }
      } else if (currentUserRole !== 'superadmin') {
        toast({
          title: "Erro",
          description: "Apenas administradores podem alterar papéis de usuários",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating user role:', error);
        toast({
          title: "Erro",
          description: error.message || "Falha ao atualizar papel do usuário",
          variant: "destructive"
        });
        return;
      }

      setUsers(prev => prev.map(user => 
        user.user_id === userId ? { ...user, role: newRole } : user
      ));

      toast({
        title: "Sucesso",
        description: `Papel do usuário atualizado para ${newRole}`,
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar papel do usuário",
        variant: "destructive"
      });
    }
  };

  const toggleUserApproval = async (userId: string, currentApproval: boolean) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_approved: !currentApproval })
        .eq('user_id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(user => 
        user.user_id === userId ? { ...user, is_approved: !currentApproval } : user
      ));

      toast({
        title: "Sucesso",
        description: `Usuário ${!currentApproval ? 'aprovado' : 'desaprovado'} com sucesso`,
      });
    } catch (error) {
      console.error('Error toggling user approval:', error);
      toast({
        title: "Erro",
        description: "Falha ao alterar aprovação do usuário",
        variant: "destructive"
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4" />;
      case 'coordinator': return <Shield className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'coordinator': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [activeTeam]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Gestão de Papéis e Usuários
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-4">Carregando usuários...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-4">Nenhum usuário encontrado.</div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{user.name}</h3>
                    <Badge className={getRoleColor(user.role)}>
                      <div className="flex items-center gap-1">
                        {getRoleIcon(user.role)}
                        {user.role}
                      </div>
                    </Badge>
                    {user.is_approved ? (
                      <Badge variant="default">Aprovado</Badge>
                    ) : (
                      <Badge variant="secondary">Pendente</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Cadastrado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Select 
                    value={user.role} 
                    onValueChange={(newRole) => updateUserRole(user.user_id, newRole)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuário</SelectItem>
                      <SelectItem value="coordinator">Coordenador</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    size="sm"
                    variant={user.is_approved ? "destructive" : "default"}
                    onClick={() => toggleUserApproval(user.user_id, user.is_approved)}
                  >
                    {user.is_approved ? "Desaprovar" : "Aprovar"}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
