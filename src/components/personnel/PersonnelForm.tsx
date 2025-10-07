
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
  monthly_salary: number;
  event_cache: number;
  overtime_rate: number;
  cpf: string;
  cnpj: string;
  pixKey: string;
}

export const PersonnelForm: React.FC<PersonnelFormProps> = ({ personnel, onClose, onSuccess }) => {
  const { functions, addPersonnel, updatePersonnel, personnel: allPersonnel } = useEnhancedData();
  const { userRole } = useTeam();
  const { toast } = useToast();
  const [formData, setFormData] = useState<PersonnelFormData>({
    name: '',
    email: '',
    phone: '',
    type: 'freelancer',
    functionIds: [],
    monthly_salary: 0,
    event_cache: 0,
    overtime_rate: 0,
    cpf: '',
    cnpj: '',
    pixKey: ''
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
        monthly_salary: personnel.monthly_salary || 0,
        event_cache: personnel.event_cache || 0,
        overtime_rate: personnel.overtime_rate || 0,
        cpf: personnel.cpf || '',
        cnpj: personnel.cnpj || '',
        pixKey: prev.pixKey || '' // Preserve existing PIX key if already fetched
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
    
    setLoading(true);

    try {
      let personnelId: string;
      
      if (personnel) {
        await updatePersonnel(personnel.id, formData);
        personnelId = personnel.id;
      } else {
        const newPersonnelId = await addPersonnel(formData);
        if (!newPersonnelId) {
          throw new Error('Failed to create personnel');
        }
        personnelId = newPersonnelId;
      }

      // Handle PIX key if provided
      if (formData.pixKey.trim()) {
        await handlePixKeyUpdate(personnelId, formData.pixKey.trim());
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving personnel:', error);
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
              onFieldChange={handleFieldChange}
              onPhoneChange={handlePhoneChange}
            />
            <PersonnelFormActions
              loading={loading}
              onCancel={onClose}
              onSubmit={() => handleSubmit(new Event('submit') as any)}
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
