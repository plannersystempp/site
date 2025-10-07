import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Trash2 } from 'lucide-react';

export const DangerZone: React.FC = () => {
  const [password, setPassword] = useState('');
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
            
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-3">
                    <p>
                      Esta ação <strong>NÃO PODE</strong> ser desfeita. Isso irá permanentemente deletar sua conta e remover todos os seus dados de nossos servidores.
                    </p>
                    <p>
                      Para confirmar, digite sua senha atual no campo abaixo:
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="password-confirm">Senha atual</Label>
                      <Input
                        id="password-confirm"
                        type="password"
                        placeholder="Digite sua senha atual"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isDeleting}
                      />
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || !password.trim()}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? "Deletando..." : "Deletar conta"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};