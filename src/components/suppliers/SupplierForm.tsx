import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEnhancedData, type Supplier } from '@/contexts/EnhancedDataContext';
import { useTeam } from '@/contexts/TeamContext';
import { Loader2, Search } from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import { toast } from 'sonner';
import {
  applyCNPJMask,
  validateCNPJ,
  applyCEPMask,
  fetchAddressByCEP,
  applyPhoneMask,
  BRAZILIAN_STATES,
  formatCNPJ
} from '@/utils/supplierUtils';

interface SupplierFormProps {
  supplier?: Supplier | null;
  onClose: () => void;
}

export const SupplierForm: React.FC<SupplierFormProps> = ({ supplier, onClose }) => {
  const { addSupplier, updateSupplier } = useEnhancedData();
  const { activeTeam } = useTeam();
  const [loading, setLoading] = useState(false);
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [activeTab, setActiveTab] = useState('dados-empresa');
  
  const [formData, setFormData] = useState({
    name: '',
    legal_name: '',
    cnpj: '',
    state_registration: '',
    municipal_registration: '',
    address_zip_code: '',
    address_street: '',
    address_number: '',
    address_complement: '',
    address_neighborhood: '',
    address_city: '',
    address_state: '',
    contact_person: '',
    phone: '',
    phone_secondary: '',
    email: '',
    notes: ''
  });

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name || '',
        legal_name: supplier.legal_name || '',
        cnpj: supplier.cnpj ? formatCNPJ(supplier.cnpj) : '',
        state_registration: supplier.state_registration || '',
        municipal_registration: supplier.municipal_registration || '',
        address_zip_code: supplier.address_zip_code || '',
        address_street: supplier.address_street || '',
        address_number: supplier.address_number || '',
        address_complement: supplier.address_complement || '',
        address_neighborhood: supplier.address_neighborhood || '',
        address_city: supplier.address_city || '',
        address_state: supplier.address_state || '',
        contact_person: supplier.contact_person || '',
        phone: supplier.phone || '',
        phone_secondary: supplier.phone_secondary || '',
        email: supplier.email || '',
        notes: supplier.notes || ''
      });
    }
  }, [supplier]);

  const handleCEPSearch = async () => {
    const cep = formData.address_zip_code.replace(/\D/g, '');
    if (cep.length !== 8) {
      toast.error('CEP deve ter 8 dígitos');
      return;
    }

    setLoadingCEP(true);
    try {
      const address = await fetchAddressByCEP(cep);
      if (address) {
        setFormData(prev => ({
          ...prev,
          address_street: address.street,
          address_neighborhood: address.neighborhood,
          address_city: address.city,
          address_state: address.state
        }));
        toast.success('Endereço encontrado!');
      } else {
        toast.error('CEP não encontrado');
      }
    } catch (error) {
      toast.error('Erro ao buscar CEP');
    } finally {
      setLoadingCEP(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.name.trim()) {
      toast.error('Nome Fantasia é obrigatório');
      return;
    }

    // Validar CNPJ se preenchido
    if (formData.cnpj && !validateCNPJ(formData.cnpj)) {
      toast.error('CNPJ inválido');
      return;
    }

    // Validar email se preenchido
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('E-mail inválido');
      return;
    }

    setLoading(true);

    try {
      if (supplier) {
        await updateSupplier({ ...supplier, ...formData });
        toast.success('Fornecedor atualizado com sucesso!');
      } else {
        await addSupplier(formData);
        toast.success('Fornecedor cadastrado com sucesso!');
        
        // Enviar notificação apenas quando criar novo fornecedor
        if (activeTeam?.id) {
          await notificationService.notifySupplierAdded(formData.name, activeTeam.id);
        }
      }
      onClose();
    } catch (error: any) {
      console.error('Error saving supplier:', error);
      toast.error(error.message || 'Erro ao salvar fornecedor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {supplier ? 'Editar Fornecedor' : 'Cadastrar Fornecedor'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dados-empresa">Empresa</TabsTrigger>
              <TabsTrigger value="endereco">Endereço</TabsTrigger>
              <TabsTrigger value="contatos">Contatos</TabsTrigger>
              <TabsTrigger value="observacoes">Observações</TabsTrigger>
            </TabsList>

            {/* Aba: Dados da Empresa */}
            <TabsContent value="dados-empresa" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="name">Nome Fantasia *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Fornecedor ABC"
                    required
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="legal_name">Razão Social</Label>
                  <Input
                    id="legal_name"
                    value={formData.legal_name}
                    onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
                    placeholder="Ex: Fornecedor ABC Ltda"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: applyCNPJMask(e.target.value) })}
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state_registration">Inscrição Estadual</Label>
                  <Input
                    id="state_registration"
                    value={formData.state_registration}
                    onChange={(e) => setFormData({ ...formData, state_registration: e.target.value })}
                    placeholder="Ex: 123.456.789.012"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="municipal_registration">Inscrição Municipal</Label>
                  <Input
                    id="municipal_registration"
                    value={formData.municipal_registration}
                    onChange={(e) => setFormData({ ...formData, municipal_registration: e.target.value })}
                    placeholder="Ex: 12345678"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Aba: Endereço */}
            <TabsContent value="endereco" className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="address_zip_code">CEP</Label>
                  <div className="flex gap-2">
                    <Input
                      id="address_zip_code"
                      value={formData.address_zip_code}
                      onChange={(e) => setFormData({ ...formData, address_zip_code: applyCEPMask(e.target.value) })}
                      placeholder="00000-000"
                      maxLength={9}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleCEPSearch}
                      disabled={loadingCEP}
                    >
                      {loadingCEP ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 col-span-3">
                  <Label htmlFor="address_street">Logradouro</Label>
                  <Input
                    id="address_street"
                    value={formData.address_street}
                    onChange={(e) => setFormData({ ...formData, address_street: e.target.value })}
                    placeholder="Ex: Rua das Flores"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address_number">Número</Label>
                  <Input
                    id="address_number"
                    value={formData.address_number}
                    onChange={(e) => setFormData({ ...formData, address_number: e.target.value })}
                    placeholder="Ex: 123"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="address_complement">Complemento</Label>
                  <Input
                    id="address_complement"
                    value={formData.address_complement}
                    onChange={(e) => setFormData({ ...formData, address_complement: e.target.value })}
                    placeholder="Ex: Sala 101"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="address_neighborhood">Bairro</Label>
                  <Input
                    id="address_neighborhood"
                    value={formData.address_neighborhood}
                    onChange={(e) => setFormData({ ...formData, address_neighborhood: e.target.value })}
                    placeholder="Ex: Centro"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="address_city">Cidade</Label>
                  <Input
                    id="address_city"
                    value={formData.address_city}
                    onChange={(e) => setFormData({ ...formData, address_city: e.target.value })}
                    placeholder="Ex: São Paulo"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="address_state">Estado</Label>
                  <Select
                    value={formData.address_state}
                    onValueChange={(value) => setFormData({ ...formData, address_state: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRAZILIAN_STATES.map((state) => (
                        <SelectItem key={state.value} value={state.value}>
                          {state.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Aba: Contatos */}
            <TabsContent value="contatos" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="contact_person">Pessoa de Contato</Label>
                  <Input
                    id="contact_person"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    placeholder="Nome do responsável"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone 1 *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: applyPhoneMask(e.target.value) })}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_secondary">Telefone 2</Label>
                  <Input
                    id="phone_secondary"
                    value={formData.phone_secondary}
                    onChange={(e) => setFormData({ ...formData, phone_secondary: applyPhoneMask(e.target.value) })}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contato@fornecedor.com"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Aba: Observações */}
            <TabsContent value="observacoes" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Informações adicionais sobre o fornecedor"
                  rows={8}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {supplier ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
