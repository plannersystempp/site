
import React from 'react';
import { useForm } from 'react-hook-form';
import { useEnhancedData } from '@/contexts/EnhancedDataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { Func } from '@/contexts/EnhancedDataContext';

interface FunctionFormProps {
  eventFunction?: Func;
  onClose: () => void;
  onSuccess: () => void;
}

interface FunctionFormData {
  name: string;
  description: string;
}

export const FunctionForm: React.FC<FunctionFormProps> = ({ eventFunction, onClose, onSuccess }) => {
  const { addFunction, updateFunction } = useEnhancedData();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FunctionFormData>({
    defaultValues: eventFunction || {
      name: '',
      description: ''
    }
  });

  const onSubmit = async (data: FunctionFormData) => {
    // Validação de campos obrigatórios
    if (!data.name.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      if (eventFunction) {
        await updateFunction({ ...eventFunction, ...data });
        toast({
          title: "Função atualizada",
          description: "A função foi atualizada com sucesso.",
        });
      } else {
        await addFunction(data);
        toast({
          title: "Função criada",
          description: "A função foi criada com sucesso.",
        });
      }
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar função:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a função. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" aria-describedby="function-form-description">
        <DialogHeader>
          <DialogTitle>{eventFunction ? 'Editar Função' : 'Criar Nova Função'}</DialogTitle>
          <div id="function-form-description" className="sr-only">
            Formulário para {eventFunction ? 'editar função existente' : 'criar nova função'}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Função <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              {...register('name', { required: 'Nome é obrigatório' })}
              placeholder="Digite o nome da função"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Descrição opcional da função"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="min-h-[44px]">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-h-[44px]">
              {isSubmitting ? 'Salvando...' : eventFunction ? 'Salvar Alterações' : 'Criar Função'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
