import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { usePlanMutations } from '@/hooks/usePlanMutations';
import { X, Plus } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price: number;
  billing_cycle: 'monthly' | 'annually';
  limits: {
    max_team_members: number | null;
    max_events_per_month: number | null;
    max_personnel: number | null;
  };
  features: string[];
  is_active: boolean;
  is_popular: boolean;
  sort_order: number;
  stripe_product_id?: string;
  stripe_price_id?: string;
}

interface PlanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: Plan | null;
}

export function PlanFormDialog({ open, onOpenChange, plan }: PlanFormDialogProps) {
  const { createPlan, updatePlan } = usePlanMutations();
  const isEdit = !!plan;

  // Form state
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const [maxTeamMembers, setMaxTeamMembers] = useState('');
  const [maxEventsPerMonth, setMaxEventsPerMonth] = useState('');
  const [maxPersonnel, setMaxPersonnel] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isPopular, setIsPopular] = useState(false);
  const [sortOrder, setSortOrder] = useState('0');
  const [stripeProductId, setStripeProductId] = useState('');
  const [stripePriceId, setStripePriceId] = useState('');

  // Load plan data when editing
  useEffect(() => {
    if (plan) {
      setName(plan.name);
      setDisplayName(plan.display_name);
      setDescription(plan.description || '');
      setPrice(plan.price.toString());
      setBillingCycle(plan.billing_cycle);
      setMaxTeamMembers(plan.limits.max_team_members?.toString() || '');
      setMaxEventsPerMonth(plan.limits.max_events_per_month?.toString() || '');
      setMaxPersonnel(plan.limits.max_personnel?.toString() || '');
      setFeatures(Array.isArray(plan.features) ? plan.features : []);
      setIsActive(plan.is_active);
      setIsPopular(plan.is_popular);
      setSortOrder(plan.sort_order.toString());
      setStripeProductId(plan.stripe_product_id || '');
      setStripePriceId(plan.stripe_price_id || '');
    } else {
      // Reset form
      setName('');
      setDisplayName('');
      setDescription('');
      setPrice('0');
      setBillingCycle('monthly');
      setMaxTeamMembers('');
      setMaxEventsPerMonth('');
      setMaxPersonnel('');
      setFeatures([]);
      setNewFeature('');
      setIsActive(true);
      setIsPopular(false);
      setSortOrder('0');
      setStripeProductId('');
      setStripePriceId('');
    }
  }, [plan, open]);

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const formData = {
      name,
      display_name: displayName,
      description,
      price: parseFloat(price),
      billing_cycle: billingCycle,
      limits: {
        max_team_members: maxTeamMembers ? parseInt(maxTeamMembers) : null,
        max_events_per_month: maxEventsPerMonth ? parseInt(maxEventsPerMonth) : null,
        max_personnel: maxPersonnel ? parseInt(maxPersonnel) : null,
      },
      features,
      is_active: isActive,
      is_popular: isPopular,
      sort_order: parseInt(sortOrder),
      stripe_product_id: stripeProductId || undefined,
      stripe_price_id: stripePriceId || undefined,
    };

    if (isEdit && plan) {
      await updatePlan.mutateAsync({ id: plan.id, data: formData });
    } else {
      await createPlan.mutateAsync(formData);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Plano' : 'Criar Novo Plano'}</DialogTitle>
          <DialogDescription>
            {isEdit 
              ? 'Atualize as informações do plano de assinatura'
              : 'Preencha os dados para criar um novo plano de assinatura'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Interno *</Label>
              <Input
                id="name"
                placeholder="trial, basic, professional..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Nome de Exibição *</Label>
              <Input
                id="displayName"
                placeholder="Plano Básico"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descrição do plano..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billingCycle">Ciclo de Cobrança *</Label>
              <Select value={billingCycle} onValueChange={(v: 'monthly' | 'annually') => setBillingCycle(v)}>
                <SelectTrigger id="billingCycle">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="annually">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Limits */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Limites (deixe vazio para ilimitado)</Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxTeamMembers" className="text-xs">Membros da Equipe</Label>
                <Input
                  id="maxTeamMembers"
                  type="number"
                  min="0"
                  placeholder="Ilimitado"
                  value={maxTeamMembers}
                  onChange={(e) => setMaxTeamMembers(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxEventsPerMonth" className="text-xs">Eventos/Mês</Label>
                <Input
                  id="maxEventsPerMonth"
                  type="number"
                  min="0"
                  placeholder="Ilimitado"
                  value={maxEventsPerMonth}
                  onChange={(e) => setMaxEventsPerMonth(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxPersonnel" className="text-xs">Profissionais</Label>
                <Input
                  id="maxPersonnel"
                  type="number"
                  min="0"
                  placeholder="Ilimitado"
                  value={maxPersonnel}
                  onChange={(e) => setMaxPersonnel(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <Label>Recursos</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Digite um recurso..."
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
              />
              <Button type="button" size="icon" onClick={handleAddFeature}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {features.map((feature, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {feature}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => handleRemoveFeature(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Stripe Integration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stripeProductId">Stripe Product ID (opcional)</Label>
              <Input
                id="stripeProductId"
                placeholder="prod_xxxxx"
                value={stripeProductId}
                onChange={(e) => setStripeProductId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stripePriceId">Stripe Price ID (opcional)</Label>
              <Input
                id="stripePriceId"
                placeholder="price_xxxxx"
                value={stripePriceId}
                onChange={(e) => setStripePriceId(e.target.value)}
              />
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Ordem de Exibição</Label>
              <Input
                id="sortOrder"
                type="number"
                min="0"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between pt-6">
              <Label htmlFor="isActive">Ativo</Label>
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
            <div className="flex items-center justify-between pt-6">
              <Label htmlFor="isPopular">Popular</Label>
              <Switch
                id="isPopular"
                checked={isPopular}
                onCheckedChange={setIsPopular}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={createPlan.isPending || updatePlan.isPending}
          >
            {(createPlan.isPending || updatePlan.isPending) ? 'Salvando...' : isEdit ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
