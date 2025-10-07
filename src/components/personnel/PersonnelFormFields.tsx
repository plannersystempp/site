
import React from 'react';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Func } from '@/contexts/EnhancedDataContext';
import { formatCurrency } from '@/utils/formatters';
import { FunctionMultiSelect } from './FunctionMultiSelect';
import { useTeam } from '@/contexts/TeamContext';

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

interface PersonnelFormFieldsProps {
  formData: PersonnelFormData;
  functions: Func[];
  onFieldChange: (field: keyof PersonnelFormData, value: string | number | string[]) => void;
  onPhoneChange: (value: string) => void;
}

export const PersonnelFormFields: React.FC<PersonnelFormFieldsProps> = ({
  formData,
  functions,
  onFieldChange,
  onPhoneChange
}) => {
  const { userRole } = useTeam();
  const isAdmin = userRole === 'admin' || userRole === 'superadmin';

  const handlePhoneChange = (value: string) => {
    // Allow international format with +55
    const cleaned = value.replace(/[^\d+]/g, '');
    
    if (cleaned.startsWith('+55')) {
      // International format
      const numbers = cleaned.substring(3);
      if (numbers.length <= 11) {
        const formatted = numbers.length === 11 
          ? `+55 (${numbers.substring(0, 2)}) ${numbers.substring(2, 7)}-${numbers.substring(7)}`
          : numbers.length === 10
          ? `+55 (${numbers.substring(0, 2)}) ${numbers.substring(2, 6)}-${numbers.substring(6)}`
          : `+55 ${numbers}`;
        onPhoneChange(formatted);
      }
    } else {
      // Domestic format
      if (cleaned.length <= 11) {
        const formatted = cleaned.length === 11 
          ? cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
          : cleaned.length === 10
          ? cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
          : cleaned;
        onPhoneChange(formatted);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Nome <span className="text-red-500">*</span></Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onFieldChange('name', e.target.value)}
          placeholder="Nome completo"
          required
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onFieldChange('email', e.target.value)}
          placeholder="email@exemplo.com"
        />
      </div>

      <div>
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          placeholder="+55 (11) 99999-9999"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Formato recomendado: +55 (XX) XXXXX-XXXX para melhor integração com WhatsApp
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            value={formData.cpf}
            onChange={(e) => onFieldChange('cpf', e.target.value)}
            placeholder="000.000.000-00"
          />
        </div>

        <div>
          <Label htmlFor="cnpj">CNPJ</Label>
          <Input
            id="cnpj"
            value={formData.cnpj}
            onChange={(e) => onFieldChange('cnpj', e.target.value)}
            placeholder="00.000.000/0000-00"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="type">Tipo <span className="text-red-500">*</span></Label>
        <Select 
          value={formData.type} 
          onValueChange={(value: 'fixo' | 'freelancer') => onFieldChange('type', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="freelancer">Freelancer</SelectItem>
            <SelectItem value="fixo">Funcionário Fixo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <FunctionMultiSelect
        functions={functions}
        selectedFunctionIds={formData.functionIds}
        onSelectionChange={(functionIds) => onFieldChange('functionIds', functionIds)}
        placeholder="Selecione as funções"
      />

      {formData.type === 'fixo' && (
        <div>
          <Label htmlFor="monthly_salary">Salário Mensal</Label>
          <CurrencyInput
            id="monthly_salary"
            value={formData.monthly_salary}
            onChange={(value) => onFieldChange('monthly_salary', value)}
            placeholder="R$ 3.500,00"
          />
        </div>
      )}

      <div>
        <Label htmlFor="event_cache">Cachê por Evento <span className="text-red-500">*</span></Label>
        <CurrencyInput
          id="event_cache"
          value={formData.event_cache}
          onChange={(value) => onFieldChange('event_cache', value)}
          placeholder="R$ 450,00"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Valor para até 12 horas de trabalho
        </p>
      </div>

      <div>
        <Label htmlFor="overtime_rate">Valor Hora Extra <span className="text-red-500">*</span></Label>
        <CurrencyInput
          id="overtime_rate"
          value={formData.overtime_rate}
          onChange={(value) => onFieldChange('overtime_rate', value)}
          placeholder="R$ 37,50"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Valor por hora acima de 12h de trabalho
        </p>
      </div>

      {isAdmin && (
        <div>
          <Label htmlFor="pixKey">Chave PIX</Label>
          <Input
            id="pixKey"
            value={formData.pixKey}
            onChange={(e) => onFieldChange('pixKey', e.target.value)}
            placeholder="Chave PIX para pagamentos"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Informação sensível - visível apenas para administradores
          </p>
        </div>
      )}
    </div>
  );
};
