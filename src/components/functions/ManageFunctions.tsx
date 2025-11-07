
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useEnhancedData } from '@/contexts/EnhancedDataContext';
import { FunctionForm } from './FunctionForm';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { Plus, Search, Edit, Trash2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
} from "@/components/ui/alert-dialog";
import { Checkbox } from '@/components/ui/checkbox';
import type { Func } from '@/contexts/EnhancedDataContext';

export const ManageFunctions = () => {
  const { functions, personnel, loading, deleteFunction } = useEnhancedData();
  const [showForm, setShowForm] = useState(false);
  const [editingFunction, setEditingFunction] = useState<Func | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const [confirmPermanent, setConfirmPermanent] = useState(false);

  // Filter functions based on search term
  const filteredFunctions = functions.filter(func =>
    func.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    func.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Count how many personnel have each function
  const getFunctionPersonnelCount = (functionId: string) => {
    return personnel.filter(person => 
      person.functions?.some(f => f.id === functionId)
    ).length;
  };

  const handleEdit = (func: Func) => {
    setEditingFunction(func);
    setShowForm(true);
  };

  const handleDelete = async (func: Func) => {
    if (!confirmPermanent) {
      toast({
        title: 'Confirmação necessária',
        description: 'Marque o checkbox “Entendo que esta ação é permanente”.',
        variant: 'destructive',
      });
      return;
    }
    try {
      await deleteFunction(func.id);
      toast({
        title: "Função excluída",
        description: "A função foi removida com sucesso.",
      });
      setConfirmPermanent(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a função.",
        variant: "destructive",
      });
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingFunction(undefined);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingFunction(undefined);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header with search and add button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar funções..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Função
        </Button>
      </div>

      {/* Functions grid */}
      {filteredFunctions.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title={searchTerm ? "Nenhuma função encontrada" : "Nenhuma função cadastrada"}
          description={
            searchTerm
              ? "Tente buscar por outros termos ou limpe a pesquisa."
              : "Crie sua primeira função para começar a organizar seu pessoal."
          }
          action={
            !searchTerm ? {
              label: "Nova Função",
              onClick: () => setShowForm(true)
            } : undefined
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFunctions.map((func) => {
            const personnelCount = getFunctionPersonnelCount(func.id);
            
            return (
              <Card key={func.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{func.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(func)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog onOpenChange={(open) => { if (!open) setConfirmPermanent(false); }}>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir função</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir a função "{func.name}"?
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="mt-4 flex items-center gap-2">
                            <Checkbox
                              id={`confirm-permanent-func-${func.id}`}
                              checked={confirmPermanent}
                              onCheckedChange={(v) => setConfirmPermanent(!!v)}
                            />
                            <label htmlFor={`confirm-permanent-func-${func.id}`} className="text-sm leading-none select-none">
                              Entendo que esta ação é permanente
                            </label>
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(func)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              disabled={!confirmPermanent}
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {func.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {func.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="gap-1">
                      <Users className="h-3 w-3" />
                      {personnelCount} pessoa{personnelCount !== 1 ? 's' : ''}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(func.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <FunctionForm
          eventFunction={editingFunction}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};
