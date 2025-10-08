import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { deleteUserAccount } from '@/services/accountService';
import { Trash2, AlertTriangle } from 'lucide-react';

export const DangerZone: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmationChecked, setConfirmationChecked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { logout } = useAuth();

  const handleDeleteAccount = async () => {
    if (!password.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite sua senha para confirmar",
        variant: "destructive"
      });
      return;
    }

    setIsDeleting(true);

    try {
      const result = await deleteUserAccount(password);
      
      if (result.success) {
        toast({
          title: "Conta deletada",
          description: "Sua conta foi deletada com sucesso"
        });
        
        // Aguardar um momento para o usuário ver a mensagem
        setTimeout(() => {
          logout();
        }, 1500);
      } else {
        toast({
          title: "Erro ao deletar conta",
          description: result.error || "Não foi possível deletar sua conta",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Erro",
        description: "Erro interno. Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setIsDialogOpen(false);
      setPassword('');
    }
  };

  return (
    <div className="border border-destructive/20 rounded-lg p-6 bg-destructive/5">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-destructive">Zona de Perigo</h3>
          <p className="text-sm text-muted-foreground">
            Ações irreversíveis relacionadas à sua conta
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-destructive">Excluir conta</h4>
          <p className="text-sm text-muted-foreground">
            Uma vez deletada, sua conta não pode ser recuperada. Todos os seus dados serão permanentemente removidos.
          </p>
          
          <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="mt-2">
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir minha conta
              </Button>
            </AlertDialogTrigger>
            
            <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  Excluir Conta Permanentemente
                </AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-4">
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                      <p className="font-semibold mb-2">
                        ⚠️ Esta ação é IRREVERSÍVEL e está em conformidade com a LGPD
                      </p>
                      <p className="text-sm">
                        Todos os seus dados serão permanentemente deletados de nossos servidores e não poderão ser recuperados.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Os seguintes dados serão excluídos:</h4>
                      <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                        <li>Informações pessoais (nome, email, telefone)</li>
                        <li>Dados de perfil e configurações</li>
                        <li>Histórico de atividades e logs</li>
                        <li>Registros de eventos e alocações</li>
                        <li>Dados de folha de pagamento relacionados</li>
                        <li>Avaliações e feedback fornecidos</li>
                        <li>Documentos anexados ao seu perfil</li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Sobre equipes:</h4>
                      <p className="text-sm text-muted-foreground">
                        • Se você é o único membro de uma equipe, a equipe e todos os seus dados também serão deletados<br/>
                        • Se há outros membros, a propriedade será transferida automaticamente para outro administrador
                      </p>
                    </div>

                    <div className="space-y-3 pt-4 border-t">
                      <div className="space-y-2">
                        <Label htmlFor="password-confirm">Confirme sua senha para continuar:</Label>
                        <Input
                          id="password-confirm"
                          type="password"
                          placeholder="Digite sua senha atual"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={isDeleting}
                        />
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="confirm-deletion"
                          checked={confirmationChecked}
                          onCheckedChange={(checked) => setConfirmationChecked(checked as boolean)}
                          disabled={isDeleting}
                        />
                        <label
                          htmlFor="confirm-deletion"
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Eu entendo que meus dados serão <strong>permanentemente deletados</strong> e esta ação não pode ser desfeita
                        </label>
                      </div>
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <AlertDialogFooter>
                <AlertDialogCancel 
                  disabled={isDeleting}
                  onClick={() => {
                    setPassword('');
                    setConfirmationChecked(false);
                  }}
                >
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || !password.trim() || !confirmationChecked}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? "Deletando..." : "Confirmar Exclusão"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};