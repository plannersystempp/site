import React, { useState } from 'react';
import { useEnhancedData } from '@/contexts/EnhancedDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Search, Package } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/input';
import { SupplierForm } from './SupplierForm';
import { SupplierCard } from './SupplierCard';
import { ExportDropdown } from '@/components/shared/ExportDropdown';
import { formatCNPJ, formatPhoneBrazil } from '@/utils/supplierUtils';

export const ManageSuppliers: React.FC = () => {
  const { suppliers, supplierItems } = useEnhancedData();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = user?.role === 'admin';

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.legal_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.cnpj?.includes(searchTerm.replace(/\D/g, '')) ||
    supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.address_city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportData = filteredSuppliers.map(supplier => ({
    nome_fantasia: supplier.name,
    razao_social: supplier.legal_name || '',
    cnpj: supplier.cnpj ? formatCNPJ(supplier.cnpj) : '',
    inscricao_estadual: supplier.state_registration || '',
    inscricao_municipal: supplier.municipal_registration || '',
    cep: supplier.address_zip_code || '',
    logradouro: supplier.address_street || '',
    numero: supplier.address_number || '',
    complemento: supplier.address_complement || '',
    bairro: supplier.address_neighborhood || '',
    cidade: supplier.address_city || '',
    estado: supplier.address_state || '',
    pessoa_contato: supplier.contact_person || '',
    telefone_1: supplier.phone ? formatPhoneBrazil(supplier.phone) : '',
    telefone_2: supplier.phone_secondary ? formatPhoneBrazil(supplier.phone_secondary) : '',
    email: supplier.email || '',
    avaliacao_media: supplier.average_rating.toFixed(1),
    total_avaliacoes: supplier.total_ratings,
    observacoes: supplier.notes || ''
  }));

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col space-y-3">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Fornecedores</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gerencie fornecedores e seus produtos/serviços
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
          <div className="order-2 sm:order-1 flex-1">
            <ExportDropdown
              data={exportData}
              headers={[
                'nome_fantasia', 'razao_social', 'cnpj', 'inscricao_estadual', 'inscricao_municipal',
                'cep', 'logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'estado',
                'pessoa_contato', 'telefone_1', 'telefone_2', 'email', 
                'avaliacao_media', 'total_avaliacoes', 'observacoes'
              ]}
              filename="fornecedores"
              title="Relatório de Fornecedores"
              disabled={filteredSuppliers.length === 0}
            />
          </div>
          {isAdmin && (
            <Button onClick={() => setShowForm(true)} className="order-1 sm:order-2 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Fornecedor
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{suppliers.length}</div>
            <p className="text-xs text-muted-foreground">Total de Fornecedores</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{supplierItems.length}</div>
            <p className="text-xs text-muted-foreground">Produtos/Serviços</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {suppliers.filter(s => s.average_rating >= 4).length}
            </div>
            <p className="text-xs text-muted-foreground">Bem Avaliados (≥4★)</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar por nome, CNPJ, contato, email ou cidade..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredSuppliers.length === 0 ? (
        <EmptyState
          icon={<Package className="h-12 w-12" />}
          title="Nenhum fornecedor encontrado"
          description={searchTerm ? "Tente ajustar os filtros de busca" : "Cadastre seu primeiro fornecedor"}
        >
          {isAdmin && !searchTerm && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Fornecedor
            </Button>
          )}
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {filteredSuppliers.map((supplier) => (
            <SupplierCard key={supplier.id} supplier={supplier} onEdit={(s) => { setEditingSupplier(s); setShowForm(true); }} />
          ))}
        </div>
      )}

      {showForm && (
        <SupplierForm supplier={editingSupplier} onClose={() => { setShowForm(false); setEditingSupplier(null); }} />
      )}
    </div>
  );
};
