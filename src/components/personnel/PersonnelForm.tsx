
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useEnhancedData } from '@/contexts/EnhancedDataContext';
import { Personnel } from '@/contexts/EnhancedDataContext';
import { PersonnelFormHeader } from './PersonnelFormHeader';
import { PersonnelFormFields } from './PersonnelFormFields';
import { PersonnelFormActions } from './PersonnelFormActions';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTeam } from '@/contexts/TeamContext';
import { validateUniquePersonnelName } from '@/utils/validation';
import { useCheckSubscriptionLimits } from '@/hooks/useCheckSubscriptionLimits';
import { UpgradePrompt } from '@/components/subscriptions/UpgradePrompt';
import { useCreatePersonnelMutation, useUpdatePersonnelMutation } from '@/hooks/queries/usePersonnelQuery';

interface PersonnelFormProps {
  personnel?: Personnel;
  onClose: () => void;
  onSuccess: () => void;
}

interface PersonnelFormData {
  name: string;
  email: string;
  phone: string;
  type: 'fixo' | 'freelancer';
  functionIds: string[];
  primaryFunctionId: string;
  monthly_salary: number;
  event_cache: number;
  overtime_rate: number;
  cpf: string;
  cnpj: string;
  pixKey: string;
  photo_url: string;
  shirt_size: string;
  address_zip_code: string;
  address_street: string;
  address_number: string;
  address_complement: string;
  address_neighborhood: string;
  address_city: string;
  address_state: string;
}

export const PersonnelForm: React.FC<PersonnelFormProps> = ({ personnel, onClose, onSuccess }) => {
  const { functions, personnel: allPersonnel } = useEnhancedData();
  const { userRole, activeTeam } = useTeam();
  const { toast } = useToast();
  const checkLimits = useCheckSubscriptionLimits();
  const createPersonnel = useCreatePersonnelMutation();
  const updatePersonnel = useUpdatePersonnelMutation();
  const [upgradePromptOpen, setUpgradePromptOpen] = useState(false);
  const [limitCheckResult, setLimitCheckResult] = useState<any>(null);
  const [formData, setFormData] = useState<PersonnelFormData>({
    name: '',
    email: '',
    phone: '',
    type: 'freelancer',
    functionIds: [],
    primaryFunctionId: '',
    monthly_salary: 0,
    event_cache: 0,
    overtime_rate: 0,
    cpf: '',
    cnpj: '',
    pixKey: '',
    photo_url: '',
    shirt_size: '',
    address_zip_code: '',
    address_street: '',
    address_number: '',
    address_complement: '',
    address_neighborhood: '',
    address_city: '',
    address_state: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (personnel) {
      setFormData(prev => ({
        name: personnel.name,
        email: personnel.email || '',
        phone: personnel.phone || '',
        type: personnel.type as 'fixo' | 'freelancer',
        functionIds: personnel.functions?.map(f => f.id) || [],
        primaryFunctionId: personnel.primaryFunctionId || (personnel.functions?.[0]?.id || ''),
        monthly_salary: personnel.monthly_salary || 0,
        event_cache: personnel.event_cache || 0,
        overtime_rate: personnel.overtime_rate || 0,
        cpf: personnel.cpf || '',
        cnpj: personnel.cnpj || '',
        pixKey: prev.pixKey || '', // Preserve existing PIX key if already fetched
        photo_url: personnel.photo_url || '',
        shirt_size: personnel.shirt_size || '',
        address_zip_code: personnel.address_zip_code || '',
        address_street: personnel.address_street || '',
        address_number: personnel.address_number || '',
        address_complement: personnel.address_complement || '',
        address_neighborhood: personnel.address_neighborhood || '',
        address_city: personnel.address_city || '',
        address_state: personnel.address_state || ''
      }));
    }
  }, [personnel]);

  // Fetch PIX key for admins when editing personnel
  useEffect(() => {
    const fetchPixKey = async () => {
      if (personnel && (userRole === 'admin' || userRole === 'superadmin')) {
        console.log('Fetching PIX key for personnel:', personnel.id);
        try {
          const { data, error } = await supabase.functions.invoke('pix-key/get', {
            body: { personnel_ids: [personnel.id] }
          });

          console.log('PIX key response:', { data, error });
          
          const map = (data && (data as any).pix_keys) ? (data as any).pix_keys : data as any;
          if (!error && map && map[personnel.id]) {
            console.log('Setting PIX key:', map[personnel.id]);
            setFormData(prev => ({ ...prev, pixKey: map[personnel.id] }));
          } else {
            console.log('No PIX key found for personnel:', personnel.id);
          }
        } catch (error) {
          console.error('Error fetching PIX key:', error);
        }
      }
    };

    fetchPixKey();
  }, [personnel, userRole]);

  const handleFieldChange = (field: keyof PersonnelFormData, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({ ...prev, phone: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar limites apenas ao criar novo pessoal
    if (!personnel && activeTeam) {
      const result = await checkLimits.mutateAsync({
        teamId: activeTeam.id,
        action: 'add_personnel'
      });

      if (!result.can_proceed) {
        setLimitCheckResult(result);
        setUpgradePromptOpen(true);
        return;
      }
    }
    
    // Validação de nome único
    const nameValidation = validateUniquePersonnelName(
      formData.name, 
      allPersonnel, 
      personnel?.id
    );
    
    if (!nameValidation.isValid) {
      toast({
        title: "Nome duplicado",
        description: nameValidation.suggestedName 
          ? `${nameValidation.message}. Sugestão: "${nameValidation.suggestedName}"`
          : nameValidation.message,
        variant: "destructive"
      });
      return;
    }
    
    // Validação de campos obrigatórios
    if (!formData.name.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.type) {
      toast({
        title: "Campos obrigatórios", 
        description: "Preencha os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.event_cache <= 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha os campos obrigatórios",
        variant: "destructive" 
      });
      return;
    }
    
    if (formData.overtime_rate <= 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    // Validation: at least one function must be selected
    if (formData.functionIds.length === 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    // Validation: when multiple functions selected, require a primary
    if (formData.functionIds.length > 1 && !formData.primaryFunctionId) {
      toast({
        title: "Função principal",
        description: "Selecione a função principal",
        variant: "destructive"
      });
      return;
    }

    // Ensure primary is among selected if provided
    if (formData.primaryFunctionId && !formData.functionIds.includes(formData.primaryFunctionId)) {
      toast({
        title: "Função principal",
        description: "A função principal deve estar entre as selecionadas",
        variant: "destructive"
      });
      return;
    }

    // Validate shirt size
    if (formData.shirt_size && !['PP', 'P', 'M', 'G', 'GG', 'XG'].includes(formData.shirt_size)) {
      toast({
        title: "Tamanho inválido",
        description: "Selecione um tamanho válido ou deixe em branco",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);

    try {
      let personnelId: string;
      
      if (personnel) {
        // Update existing personnel
        await updatePersonnel.mutateAsync({
          id: personnel.id,
          ...formData
        });
        personnelId = personnel.id;
      } else {
        // Create new personnel
        const newPersonnel = await createPersonnel.mutateAsync(formData);
        personnelId = newPersonnel.id;
      }

      // Handle PIX key if provided
      if (formData.pixKey.trim()) {
        await handlePixKeyUpdate(personnelId, formData.pixKey.trim());
      }

      toast({
        title: personnel ? "Pessoa atualizada" : "Pessoa cadastrada",
        description: personnel ? "Os dados foram atualizados com sucesso" : "Nova pessoa foi cadastrada com sucesso",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving personnel:', error);
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao salvar os dados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePixKeyUpdate = async (personnelId: string, pixKey: string) => {
    try {
      const { error } = await supabase.functions.invoke('pix-key/set', {
        body: { personnel_id: personnelId, pix_key: pixKey }
      });

      if (error) {
        console.error('Error updating PIX key:', error);
        toast({
          title: "Aviso",
          description: "Dados salvos, mas houve erro ao salvar a chave PIX",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error calling PIX key function:', error);
      toast({
        title: "Aviso", 
        description: "Dados salvos, mas houve erro ao salvar a chave PIX",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <PersonnelFormHeader personnel={personnel} onClose={onClose} />
        <CardContent>
          <form onSubmit={handleSubmit}>
            <PersonnelFormFields
              formData={formData}
              functions={functions}
              personnelId={personnel?.id}
              onFieldChange={handleFieldChange}
              onPhoneChange={handlePhoneChange}
            />
            
            <PersonnelFormActions
              loading={loading}
              onCancel={onClose}
              onSubmit={() => handleSubmit(new Event('submit') as any)}
              hasUnsavedPhoto={formData.photo_url !== (personnel?.photo_url || '')}
            />
          </form>
        </CardContent>
      </Card>
      <UpgradePrompt
        open={upgradePromptOpen}
        onOpenChange={setUpgradePromptOpen}
        reason={limitCheckResult?.reason || ''}
        currentPlan={limitCheckResult?.current_plan}
        limit={limitCheckResult?.limit}
        currentCount={limitCheckResult?.current_count}
      />
    </div>
  );
};
