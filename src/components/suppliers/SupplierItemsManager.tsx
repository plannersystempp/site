import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useEnhancedData, type Supplier, type SupplierItem } from '@/contexts/EnhancedDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';

interface SupplierItemsManagerProps {
  supplier: Supplier;
  onClose: () => void;
}

export const SupplierItemsManager: React.FC<SupplierItemsManagerProps> = ({ supplier, onClose }) => {
  const { supplierItems, addSupplierItem, updateSupplierItem, deleteSupplierItem } = useEnhancedData();
  const { user } = useAuth();
  const [editingItem, setEditingItem] = useState<SupplierItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    item_name: '',
    description: '',
    category: '',
    price: '',
    unit: ''
  });

  const isAdmin = user?.role === 'admin';
  const items = supplierItems.filter(item => item.supplier_id === supplier.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      supplier_id: supplier.id,
      item_name: formData.item_name,
      description: formData.description || undefined,
      category: formData.category || undefined,
      price: formData.price ? parseFloat(formData.price) : undefined,
      unit: formData.unit || undefined
    };

    if (editingItem) {
      await updateSupplierItem({ ...editingItem, ...data });
    } else {
      await addSupplierItem(data);
    }
    setFormData({ item_name: '', description: '', category: '', price: '', unit: '' });
    setEditingItem(null);
    setShowForm(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Itens de {supplier.name}</span>
            {isAdmin && !showForm && (
              <Button size="sm" onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        {showForm ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do Item *</Label>
              <Input value={formData.item_name} onChange={(e) => setFormData({ ...formData, item_name: e.target.value })} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Unidade</Label>
                <Input value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Preço</Label>
              <Input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingItem(null); }}>Cancelar</Button>
              <Button type="submit">{editingItem ? 'Atualizar' : 'Adicionar'}</Button>
            </div>
          </form>
        ) : items.length === 0 ? (
          <EmptyState icon={<Package className="h-12 w-12" />} title="Nenhum item cadastrado" description="Adicione produtos ou serviços">
            {isAdmin && <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" />Adicionar Primeiro Item</Button>}
          </EmptyState>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium">{item.item_name}</h4>
                      {item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {item.category && <span className="text-xs bg-secondary px-2 py-1 rounded">{item.category}</span>}
                        {item.price && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">R$ {item.price.toFixed(2)}{item.unit && ` / ${item.unit}`}</span>}
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => { setEditingItem(item); setFormData({ item_name: item.item_name, description: item.description || '', category: item.category || '', price: item.price?.toString() || '', unit: item.unit || '' }); setShowForm(true); }} className="h-8 w-8 p-0"><Edit className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => confirm('Excluir?') && deleteSupplierItem(item.id)} className="h-8 w-8 p-0 text-destructive"><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
