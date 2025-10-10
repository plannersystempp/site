import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { useTeam } from '@/contexts/TeamContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TeamPayrollConfigData {
  threshold: number;
  convertEnabled: boolean;
}

export const TeamPayrollConfig: React.FC = () => {
  const { activeTeam } = useTeam();
  const { toast } = useToast();
  const [config, setConfig] = useState<TeamPayrollConfigData>({
    threshold: 8,
    convertEnabled: false
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchTeamConfig = async () => {
      if (!activeTeam?.id) return;
      
      try {
        setFetching(true);
        const { data, error } = await supabase
          .from('teams')
          .select('default_overtime_threshold_hours, default_convert_overtime_to_daily')
          .eq('id', activeTeam.id)
          .single();

        if (error) throw error;

        if (data) {
          setConfig({
            threshold: data.default_overtime_threshold_hours || 8,
            convertEnabled: data.default_convert_overtime_to_daily || false
          });
        }
      } catch (error) {
        console.error('Error fetching team config:', error);
        toast({
          title: "Erro",
          description: "Falha ao carregar configurações",
          variant: "destructive"
        });
      } finally {
        setFetching(false);
      }
    };

    fetchTeamConfig();
  }, [activeTeam, toast]);

  const handleSave = async () => {
    if (!activeTeam?.id) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('teams')
        .update({
          default_overtime_threshold_hours: config.threshold,
          default_convert_overtime_to_daily: config.convertEnabled
        })
        .eq('id', activeTeam.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Configurações salvas com sucesso"
      });
    } catch (error) {
      console.error('Error saving team config:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar configurações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Carregando configurações...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Horas Extras</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Switch principal */}
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1">
            <Label htmlFor="convert-switch" className="text-base">
              Converter HE em Cachê Diário
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Pagar cachê cheio ao invés de hora a hora quando o limiar for atingido
            </p>
          </div>
          <Switch
            id="convert-switch"
            checked={config.convertEnabled}
            onCheckedChange={(checked) => 
              setConfig({ ...config, convertEnabled: checked })
            }
          />
        </div>

        {/* Input de limiar (só aparece se switch ativado) */}
        {config.convertEnabled && (
          <div className="space-y-2">
            <Label htmlFor="threshold">Limiar de Horas Extras</Label>
            <Input
              id="threshold"
              type="number"
              min="1"
              step="0.5"
              value={config.threshold}
              onChange={(e) => 
                setConfig({ ...config, threshold: Number(e.target.value) })
              }
            />
            <p className="text-xs text-muted-foreground">
              Horas extras acima deste valor acionam o pagamento de 1 cachê completo
            </p>
            <div className="bg-muted/50 p-3 rounded-lg text-sm">
              <p className="font-medium mb-1">Exemplo:</p>
              <p className="text-muted-foreground">
                Com limiar de {config.threshold}h, se um profissional trabalhar {config.threshold * 2}h extras,
                ele receberá {Math.floor((config.threshold * 2) / config.threshold)} cachê(s) completo(s)
                {(config.threshold * 2) % config.threshold > 0 && ` + ${(config.threshold * 2) % config.threshold}h avulsas`}.
              </p>
            </div>
          </div>
        )}

        {/* Alert informativo */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Esta configuração será aplicada a todos os profissionais da equipe.
          </AlertDescription>
        </Alert>

        <Button onClick={handleSave} disabled={loading || fetching}>
          {loading ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </CardContent>
    </Card>
  );
};
