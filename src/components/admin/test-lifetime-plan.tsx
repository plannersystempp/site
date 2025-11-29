import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TestLifetimePlan() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('sort_order');

      if (error) {
        console.error('Error fetching plans:', error);
      } else {
        console.log('Plans data:', data);
        setPlans(data || []);
      }
      setLoading(false);
    }

    fetchPlans();
  }, []);

  if (loading) return <div>Carregando planos...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Testar Plano Vitalício</h2>
      <div className="grid gap-4">
        {plans.map((plan) => (
          <Card key={plan.id} className={plan.billing_cycle === 'lifetime' ? 'border-purple-500' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {plan.display_name}
                {plan.billing_cycle === 'lifetime' && (
                  <span className="bg-purple-500 text-white px-2 py-1 rounded text-sm">
                    VITALÍCIO
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Nome: {plan.name}</p>
              <p>Preço: R$ {plan.price / 100}</p>
              <p>Ciclo: {plan.billing_cycle}</p>
              <p>Ativo: {plan.is_active ? 'Sim' : 'Não'}</p>
              <p>Popular: {plan.is_popular ? 'Sim' : 'Não'}</p>
              <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}