import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { validateEmail, validatePassword, sanitizeInput, validateName, sanitizeHtml } from '@/utils/validation';
import { useTeam } from '@/contexts/TeamContext';
import { Loader2 } from 'lucide-react';

interface CreateUserByAdminProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateUserByAdmin: React.FC<CreateUserByAdminProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { activeTeam } = useTeam();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'coordinator' as 'admin' | 'coordinator'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeTeam) {
      toast({
        title: "Erro",
        description: "Nenhuma equipe selecionada",
        variant: "destructive"
      });
      return;
    }

    // Validations
    console.log('Form data:', formData);
    
    if (!formData.name.trim()) {
      console.log('Name validation failed: empty name');
      toast({
        title: "Campos obrigatórios",
        description: "Nome é obrigatório",
        variant: "destructive"
      });
      return;
    }
    
    if (!validateEmail(formData.email)) {
      console.log('Email validation failed:', formData.email);
      toast({
        title: "Campos obrigatórios",
        description: "Email inválido",
        variant: "destructive"
      });
      return;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      console.log('Password validation failed:', passwordValidation.errors);
      toast({
        title: "Senha inválida",
        description: passwordValidation.errors.join(', '),
        variant: "destructive"
      });
      return;
    }

    if (!validateName(formData.name)) {
      console.log('Name format validation failed:', formData.name);
      toast({
        title: "Campos obrigatórios",
        description: "Nome deve ter entre 2 e 100 caracteres",
        variant: "destructive"
      });
      return;
    }

    // Role validation - prevent creation of superadmin by non-superadmin users
    const { data: currentUser } = await supabase.auth.getUser();
    if (currentUser.user) {
      const { data: currentUserProfile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', currentUser.user.id)
        .single();

      if (currentUserProfile?.role === 'admin' && formData.role === 'admin') {
        toast({
          title: "Erro",
          description: "Administradores não podem criar outros administradores",
          variant: "destructive"
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-user-by-admin', {
        body: {
          email: formData.email,
          password: formData.password,
          name: sanitizeInput(formData.name),
          role: formData.role,
          team_id: activeTeam.id
        }
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso",
      });

      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'coordinator'
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao criar usuário",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Novo Usuário</DialogTitle>
          <DialogDescription>
            Adicione um novo usuário à equipe {activeTeam?.name}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome Completo <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="password">Senha <span className="text-red-500">*</span></Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Mínimo 8 caracteres com maiúscula, minúscula e número
            </p>
          </div>

          <div>
            <Label htmlFor="role">Função <span className="text-red-500">*</span></Label>
            <Select
              value={formData.role}
              onValueChange={(value: 'admin' | 'coordinator') => 
                setFormData(prev => ({ ...prev, role: value }))
              }
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

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Criar Usuário
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};