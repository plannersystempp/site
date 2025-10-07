
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Loader2 } from 'lucide-react';
import { useTeamManagement } from '@/contexts/team/useTeamManagement';
import { useAuth } from '@/contexts/AuthContext';

export const TeamSelector: React.FC = () => {
  const { user } = useAuth();
  const { teams, activeTeam, loading, createTeam, selectTeam } = useTeamManagement();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [creating, setCreating] = useState(false);

  console.log('TeamSelector render:', { 
    loading, 
    teams: teams.length, 
    activeTeam: activeTeam?.name || 'undefined',
    user: user?.email || 'no user'
  });

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTeamName.trim()) {
      return;
    }

    try {
      setCreating(true);
      await createTeam(newTeamName.trim());
      setNewTeamName('');
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to create team:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setNewTeamName('');
    setCreating(false);
  };

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4" />
        <span className="text-sm text-muted-foreground">
          Faça login para acessar suas equipes
        </span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Carregando equipes...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {teams.length === 0 ? (
        <>
          <span className="text-sm text-muted-foreground">
            Nenhuma equipe
          </span>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Criar Equipe
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Nova Equipe</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="team-name">Nome da Equipe</Label>
                  <Input
                    id="team-name"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="Digite o nome da equipe"
                    disabled={creating}
                    autoFocus
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseModal}
                    disabled={creating}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={creating || !newTeamName.trim()}>
                    {creating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      'Criar Equipe'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <Select
              value={activeTeam?.id || ''}
              onValueChange={(value) => {
                const team = teams.find(t => t.id === value);
                if (team) selectTeam(team);
              }}
            >
              <SelectTrigger className="w-[200px]">
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

          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nova Equipe
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Nova Equipe</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="team-name-2">Nome da Equipe</Label>
                  <Input
                    id="team-name-2"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="Digite o nome da equipe"
                    disabled={creating}
                    autoFocus
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseModal}
                    disabled={creating}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={creating || !newTeamName.trim()}>
                    {creating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      'Criar Equipe'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};
