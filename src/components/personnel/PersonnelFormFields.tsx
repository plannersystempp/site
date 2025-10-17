
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Func } from '@/contexts/EnhancedDataContext';
import { formatCurrency } from '@/utils/formatters';
import { FunctionMultiSelect } from './FunctionMultiSelect';
import { PersonnelPhotoUpload } from './PersonnelPhotoUpload';
import { useTeam } from '@/contexts/TeamContext';
import { toast } from '@/hooks/use-toast';
import { Loader2, Search } from 'lucide-react';
import {
  applyCEPMask,
  fetchAddressByCEP,
  BRAZILIAN_STATES
} from '@/utils/supplierUtils';

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

interface PersonnelFormFieldsProps {
  formData: PersonnelFormData;
  functions: Func[];
  personnelId?: string;
  onFieldChange: (field: keyof PersonnelFormData, value: string | number | string[]) => void;
  onPhoneChange: (value: string) => void;
}

export const PersonnelFormFields: React.FC<PersonnelFormFieldsProps> = ({
  formData,
  functions,
  personnelId,
  onFieldChange,
  onPhoneChange
}) => {
  const { userRole } = useTeam();
  const isAdmin = userRole === 'admin' || userRole === 'superadmin';
  const [loadingCEP, setLoadingCEP] = useState(false);

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

  const handleCEPSearch = async () => {
    const cep = formData.address_zip_code.replace(/\D/g, '');
    if (cep.length !== 8) {
      toast({
        title: 'CEP inválido',
        description: 'CEP deve ter 8 dígitos',
        variant: 'destructive'
      });
      return;
    }

    setLoadingCEP(true);
    try {
      const address = await fetchAddressByCEP(cep);
      if (address) {
        onFieldChange('address_street', address.street);
        onFieldChange('address_neighborhood', address.neighborhood);
        onFieldChange('address_city', address.city);
        onFieldChange('address_state', address.state);
        toast({
          title: 'Endereço encontrado!',
          description: 'Dados preenchidos automaticamente'
        });
      } else {
        toast({
          title: 'CEP não encontrado',
          description: 'Verifique o CEP e tente novamente',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro ao buscar CEP',
        description: 'Tente novamente mais tarde',
        variant: 'destructive'
      });
    } finally {
      setLoadingCEP(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Seção de Foto */}
      <div className="pb-4 border-b">
        <PersonnelPhotoUpload
          currentPhotoUrl={formData.photo_url}
          personnelId={personnelId}
          personnelName={formData.name}
          onPhotoChange={(url) => onFieldChange('photo_url', url || '')}
        />
      </div>

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

      {/* Tamanho da Camisa */}
      <div>
        <Label htmlFor="shirt_size">Tamanho da Camisa</Label>
        <Select 
          value={formData.shirt_size || ''} 
          onValueChange={(value) => onFieldChange('shirt_size', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tamanho" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Não informado</SelectItem>
            <SelectItem value="PP">PP - Extra Pequeno</SelectItem>
            <SelectItem value="P">P - Pequeno</SelectItem>
            <SelectItem value="M">M - Médio</SelectItem>
            <SelectItem value="G">G - Grande</SelectItem>
            <SelectItem value="GG">GG - Extra Grande</SelectItem>
            <SelectItem value="XG">XG - Extra Extra Grande</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          👕 Informação útil para gestão de uniformes e materiais
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
    primaryFunctionId={formData.primaryFunctionId}
    onPrimaryChange={(fid) => onFieldChange('primaryFunctionId', fid || '')}
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
          Valor do cachê diário; na conversão de HE, cada cachê cobre até 8h extras no mesmo dia.
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
          Valor por hora para HE avulsas (dias abaixo do limiar ou acima de 8h no dia).
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

      {/* Seção de Endereço */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <span>📍</span>
          Endereço
        </h3>
        
        {/* CEP com botão de busca */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="address_zip_code">CEP</Label>
            <Input
              id="address_zip_code"
              value={formData.address_zip_code}
              onChange={(e) => onFieldChange('address_zip_code', applyCEPMask(e.target.value))}
              placeholder="00000-000"
              maxLength={9}
            />
          </div>
          <div className="pt-6">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCEPSearch}
              disabled={loadingCEP || formData.address_zip_code.replace(/\D/g, '').length !== 8}
            >
              {loadingCEP ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Logradouro e Número */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="address_street">Logradouro</Label>
            <Input
              id="address_street"
              value={formData.address_street}
              onChange={(e) => onFieldChange('address_street', e.target.value)}
              placeholder="Rua, Avenida, etc."
            />
          </div>
          <div>
            <Label htmlFor="address_number">Número</Label>
            <Input
              id="address_number"
              value={formData.address_number}
              onChange={(e) => onFieldChange('address_number', e.target.value)}
              placeholder="123"
            />
          </div>
        </div>

        {/* Complemento e Bairro */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="address_complement">Complemento</Label>
            <Input
              id="address_complement"
              value={formData.address_complement}
              onChange={(e) => onFieldChange('address_complement', e.target.value)}
              placeholder="Apto, Sala, etc."
            />
          </div>
          <div>
            <Label htmlFor="address_neighborhood">Bairro</Label>
            <Input
              id="address_neighborhood"
              value={formData.address_neighborhood}
              onChange={(e) => onFieldChange('address_neighborhood', e.target.value)}
              placeholder="Nome do bairro"
            />
          </div>
        </div>

        {/* Cidade e Estado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="address_city">Cidade</Label>
            <Input
              id="address_city"
              value={formData.address_city}
              onChange={(e) => onFieldChange('address_city', e.target.value)}
              placeholder="Nome da cidade"
            />
          </div>
          <div>
            <Label htmlFor="address_state">Estado (UF)</Label>
            <Select 
              value={formData.address_state}
              onValueChange={(value) => onFieldChange('address_state', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                {BRAZILIAN_STATES.map(state => (
                  <SelectItem key={state.value} value={state.value}>
                    {state.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};
