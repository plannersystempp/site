import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface Team {
  id: string;
  name: string;
}

interface UserManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  userName: string;
  currentRole: string;
  currentApproved: boolean;
  currentTeamId: string | null;
  currentTeamName: string | null;
  teams: Team[];
  actionType: 'approve' | 'role' | 'assign' | 'remove' | 'delete';
  returnFocusTo?: React.RefObject<HTMLElement>;
}

export const UserManagementDialog: React.FC<UserManagementDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userId,
  userName,
  currentRole,
  currentApproved,
  currentTeamId,
  currentTeamName,
  teams,
  actionType,
  returnFocusTo,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [newRole, setNewRole] = useState(currentRole);
  const [selectedTeam, setSelectedTeam] = useState(currentTeamId || '');
  const [teamRole, setTeamRole] = useState<'coordinator' | 'admin'>('coordinator');

  const getDialogTitle = () => {
    switch (actionType) {
      case 'approve':
        return currentApproved ? 'Desaprovar Usuário' : 'Aprovar Usuário';
      case 'role':
        return 'Alterar Função do Usuário';
      case 'assign':
        return 'Associar Usuário à Equipe';
      case 'remove':
        return 'Remover Usuário da Equipe';
      case 'delete':
        return 'Excluir Usuário';
      default:
        return '';
    }
  };

  const getDialogDescription = () => {
    switch (actionType) {
      case 'approve':
        return currentApproved
          ? `Tem certeza que deseja desaprovar o usuário "${userName}"? Ele perderá o acesso ao sistema.`
          : `Aprovar o usuário "${userName}" permitirá que ele acesse o sistema.`;
      case 'role':
        return `Altere a função do usuário "${userName}" no sistema.`;
      case 'assign':
        return `Associe o usuário "${userName}" a uma equipe.`;
      case 'remove':
        return `Tem certeza que deseja remover "${userName}" da equipe "${currentTeamName}"?`;
      case 'delete':
        return `ATENÇÃO: Esta ação é irreversível! Tem certeza que deseja excluir permanentemente o usuário "${userName}"?`;
      default:
        return '';
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      switch (actionType) {
        case 'approve': {
          const { data, error } = await supabase.rpc('superadmin_approve_user', {
            p_user_id: userId,
            p_approve_status: !currentApproved,
          });

          if (error) throw error;

          const result = data as { success: boolean; message: string };
          toast({
            title: 'Sucesso',
            description: result.message,
          });
          break;
        }

        case 'role': {
          const { data, error } = await supabase.rpc('superadmin_change_user_role', {
            p_user_id: userId,
            p_new_role: newRole,
          });

          if (error) throw error;

          const result = data as { success: boolean; message: string };
          toast({
            title: 'Sucesso',
            description: result.message,
          });
          break;
        }

        case 'assign': {
          if (!selectedTeam) {
            toast({
              title: 'Erro',
              description: 'Selecione uma equipe',
              variant: 'destructive',
            });
            return;
          }

          const { data, error } = await supabase.rpc('superadmin_assign_user_to_team', {
            p_user_id: userId,
            p_team_id: selectedTeam,
            p_role: teamRole,
          });

          if (error) throw error;

          const result = data as { success: boolean; message: string };
          toast({
            title: 'Sucesso',
            description: result.message,
          });
          break;
        }

        case 'remove': {
          if (!currentTeamId) {
            toast({
              title: 'Erro',
              description: 'Usuário não está em uma equipe',
              variant: 'destructive',
            });
            return;
          }

          const { data, error } = await supabase.rpc('superadmin_remove_user_from_team', {
            p_user_id: userId,
            p_team_id: currentTeamId,
          });

          if (error) throw error;

          const result = data as { success: boolean; message: string };
          toast({
            title: 'Sucesso',
            description: result.message,
          });
          break;
        }

        case 'delete': {
          const { data, error } = await supabase.functions.invoke('delete-users-by-superadmin', {
            body: { userIds: [userId] },
          });

          if (error) throw error;

          toast({
            title: 'Sucesso',
            description: 'Usuário excluído com sucesso',
          });
          break;
        }
      }

      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error in user management action:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao executar ação',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>

        {actionType === 'role' && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="role">Nova Função</Label>
              <Select value={newRole} onValueChange={setNewRole} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="coordinator">Coordenador</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="superadmin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {actionType === 'assign' && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="team">Equipe</Label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma equipe" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="teamRole">Função na Equipe</Label>
              <Select
                value={teamRole}
                onValueChange={(value: 'coordinator' | 'admin') => setTeamRole(value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coordinator">Coordenador</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            variant={actionType === 'delete' ? 'destructive' : 'default'}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {actionType === 'delete' ? 'Excluir' : 'Confirmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
