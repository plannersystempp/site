import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTeam } from '@/contexts/TeamContext';
import { supabase } from '@/integrations/supabase/client';

interface PersonnelOvertimeConfigProps {
  formData: {
    overtime_threshold_hours?: number | null;
    convert_overtime_to_daily?: boolean | null;
  };
  onChange: (field: string, value: string | number | string[] | boolean | null) => void;
}

interface TeamConfig {
  threshold: number;
  convertEnabled: boolean;
}

export const PersonnelOvertimeConfig: React.FC<PersonnelOvertimeConfigProps> = ({
  formData,
  onChange
}) => {
  const { activeTeam } = useTeam();
  const [teamConfig, setTeamConfig] = useState<TeamConfig>({
    threshold: 8,
    convertEnabled: false
  });
  const [useCustomConfig, setUseCustomConfig] = useState(false);

  useEffect(() => {
    const fetchTeamConfig = async () => {
      if (!activeTeam?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('teams')
          .select('default_overtime_threshold_hours, default_convert_overtime_to_daily')
          .eq('id', activeTeam.id)
          .single();

        if (error) throw error;

        if (data) {
          setTeamConfig({
            threshold: data.default_overtime_threshold_hours || 8,
            convertEnabled: data.default_convert_overtime_to_daily || false
          });
        }
      } catch (error) {
        console.error('Error fetching team config:', error);
      }
    };

    fetchTeamConfig();
  }, [activeTeam]);

  useEffect(() => {
    // Se há valores não-nulos no formData, está usando config personalizada
    const hasCustom = formData.convert_overtime_to_daily !== null || formData.overtime_threshold_hours !== null;
    setUseCustomConfig(hasCustom);
  }, [formData]);

  const handleUseCustom = () => {
    setUseCustomConfig(true);
    onChange('convert_overtime_to_daily', teamConfig.convertEnabled);
    onChange('overtime_threshold_hours', teamConfig.threshold);
  };

  const handleResetToDefault = () => {
    setUseCustomConfig(false);
    onChange('convert_overtime_to_daily', null);
    onChange('overtime_threshold_hours', null);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <div>
        <Label className="text-base font-semibold">Configuração de Horas Extras</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Define como as horas extras serão calculadas para este profissional
        </p>
      </div>

      {!useCustomConfig ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="text-xs">
                  Padrão da Equipe
                </Badge>
                {teamConfig.convertEnabled && (
                  <Badge variant="outline" className="text-xs">
                    Conversão Ativa
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {teamConfig.convertEnabled 
                  ? `Limiar: ${teamConfig.threshold}h - Converte HE em cachê`
                  : 'Pagamento hora a hora (conversão desativada)'}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUseCustom}
            className="w-full"
          >
            Personalizar Configuração
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="convert-switch-personnel">Converter HE em Cachê</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Pagar cachê completo ao invés de hora a hora
              </p>
            </div>
            <Switch
              id="convert-switch-personnel"
              checked={formData.convert_overtime_to_daily ?? false}
              onCheckedChange={(checked) => onChange('convert_overtime_to_daily', checked)}
            />
          </div>

          {formData.convert_overtime_to_daily && (
            <div className="space-y-2">
              <Label htmlFor="threshold-personnel">Limiar de HE (horas)</Label>
              <Input
                id="threshold-personnel"
                type="number"
                min="1"
                step="0.5"
                value={formData.overtime_threshold_hours ?? 8}
                onChange={(e) => onChange('overtime_threshold_hours', Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Horas acima deste valor acionam pagamento de 1 cachê
              </p>
            </div>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetToDefault}
            className="w-full"
          >
            Voltar ao Padrão da Equipe
          </Button>
        </div>
      )}
    </div>
  );
};
