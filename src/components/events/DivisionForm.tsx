import React, { useState, useEffect } from 'react';
import { useEnhancedData } from '@/contexts/EnhancedDataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { type Division } from '@/contexts/EnhancedDataContext';

interface DivisionFormProps {
  division: Division | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const DivisionForm: React.FC<DivisionFormProps> = ({
  division,
  open,
  onOpenChange,
  onSuccess
}) => {
  const { updateDivision } = useEnhancedData();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (division) {
      setFormData({
        name: division.name || '',
        description: division.description || ''
      });
    }
  }, [division]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Preencha os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    if (!division) return;

    setLoading(true);
    try {
      await updateDivision({
        ...division,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined
      });
      
      toast({
        title: "Sucesso",
        description: "Divisão atualizada com sucesso!"
      });
      
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error updating division:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar divisão",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (loading) return;
    onOpenChange(newOpen);
    if (!newOpen) {
      setFormData({ name: '', description: '' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Divisão</DialogTitle>
          <DialogDescription>
            Altere as informações da divisão do evento.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nome <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Digite o nome da divisão"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Digite uma descrição opcional"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};