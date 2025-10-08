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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Trash2, Users, Calendar, UserCheck, AlertTriangle, RefreshCw } from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import { Checkbox } from '@/components/ui/checkbox';

interface TeamStats {
  team_id: string;
  team_name: string;
  team_cnpj: string | null;
  owner_id: string;
  owner_name: string;
  owner_email: string;
  members_count: number;
  events_count: number;
  personnel_count: number;
  created_at: string;
}

export const TeamManagementTab: React.FC = () => {
  const [teams, setTeams] = useState<TeamStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    team: TeamStats | null;
    force: boolean;
    deleteOrphans: boolean;
  }>({ open: false, team: null, force: false, deleteOrphans: false });
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_team_stats_for_superadmin');
      
      if (error) throw error;
      
      setTeams(data || []);
    } catch (error: any) {
      console.error('Error fetching teams:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar equipes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleDeleteTeam = async () => {
    if (!deleteDialog.team) return;

    setDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('delete-team-by-superadmin', {
        body: {
          teamId: deleteDialog.team.team_id,
          force: deleteDialog.force,
          deleteOrphanUsers: deleteDialog.deleteOrphans
        }
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: data.message || "Equipe deletada com sucesso"
      });

      setDeleteDialog({ open: false, team: null, force: false, deleteOrphans: false });
      fetchTeams();
    } catch (error: any) {
      console.error('Error deleting team:', error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao deletar equipe",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
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
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gerenciar Equipes</CardTitle>
            <Button onClick={fetchTeams} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipe</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Proprietário</TableHead>
                <TableHead className="text-center">Membros</TableHead>
                <TableHead className="text-center">Eventos</TableHead>
                <TableHead className="text-center">Pessoal</TableHead>
                <TableHead>Criada em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Nenhuma equipe encontrada
                  </TableCell>
                </TableRow>
              ) : (
                teams.map((team) => (
                  <TableRow key={team.team_id}>
                    <TableCell className="font-medium">{team.team_name}</TableCell>
                    <TableCell>
                      {team.team_cnpj || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{team.owner_name}</div>
                        <div className="text-xs text-muted-foreground">{team.owner_email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="gap-1">
                        <Users className="w-3 h-3" />
                        {team.members_count}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="gap-1">
                        <Calendar className="w-3 h-3" />
                        {team.events_count}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="gap-1">
                        <UserCheck className="w-3 h-3" />
                        {team.personnel_count}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(team.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteDialog({
                          open: true,
                          team,
                          force: team.members_count > 1,
                          deleteOrphans: false
                        })}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Deletar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog 
        open={deleteDialog.open} 
        onOpenChange={(open) => !deleting && setDeleteDialog({ ...deleteDialog, open })}
      >
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Confirmar Exclusão de Equipe
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="font-semibold mb-2">
                    ⚠️ Esta ação é IRREVERSÍVEL
                  </p>
                  <p className="text-sm">
                    Todos os dados desta equipe serão permanentemente deletados.
                  </p>
                </div>

                {deleteDialog.team && (
                  <>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Equipe: {deleteDialog.team.team_name}</h4>
                      <ul className="text-sm space-y-1 list-disc list-inside">
                        <li>{deleteDialog.team.members_count} membro(s)</li>
                        <li>{deleteDialog.team.events_count} evento(s)</li>
                        <li>{deleteDialog.team.personnel_count} pessoa(l)</li>
                      </ul>
                    </div>

                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="delete-orphans"
                          checked={deleteDialog.deleteOrphans}
                          onCheckedChange={(checked) => 
                            setDeleteDialog({ ...deleteDialog, deleteOrphans: checked as boolean })
                          }
                          disabled={deleting}
                        />
                        <label
                          htmlFor="delete-orphans"
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Deletar também usuários que ficarem sem equipe após esta ação
                        </label>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTeam}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deletando..." : "Confirmar Exclusão"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
