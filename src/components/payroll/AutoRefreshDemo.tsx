import React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Clock, Zap } from 'lucide-react';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { AutoRefreshIndicator } from '@/components/ui/AutoRefreshIndicator';

/**
 * Componente de demonstração do sistema de atualização automática
 * Mostra como o sistema funciona com dados simulados
 */
export const AutoRefreshDemo: React.FC = () => {
  const [simulatedData, setSimulatedData] = useState({
    overtimeHours: 0,
    lastUpdate: new Date()
  });

  // Simular atualizações de horas extras
  const [isSimulating, setIsSimulating] = useState(false);

  const {
    isRefreshing,
    lastRefresh,
    refreshCount,
    refresh: manualRefresh
  } = useAutoRefresh({
    enabled: true,
    interval: 3000, // 3 segundos
    onRefresh: () => {
      console.log('[Demo] Atualização automática executada');
      // Simular mudança nos dados
      if (isSimulating) {
        setSimulatedData(prev => ({
          overtimeHours: prev.overtimeHours + Math.random() * 2,
          lastUpdate: new Date()
        }));
      }
    }
  });

  const startSimulation = () => {
    setIsSimulating(true);
    setSimulatedData({
      overtimeHours: Math.random() * 10,
      lastUpdate: new Date()
    });
  };

  const stopSimulation = () => {
    setIsSimulating(false);
  };

  const addOvertime = () => {
    setSimulatedData(prev => ({
      overtimeHours: prev.overtimeHours + 1.5,
      lastUpdate: new Date()
    }));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Sistema de Atualização Automática
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Indicador de atualização */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Status da Atualização
            </div>
            <AutoRefreshIndicator
              isRefreshing={isRefreshing}
              lastRefresh={lastRefresh}
              error={null}
              refreshCount={refreshCount}
              onManualRefresh={manualRefresh}
            />
          </div>

          {/* Dados simulados */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {simulatedData.overtimeHours.toFixed(1)}h
              </div>
              <div className="text-sm text-muted-foreground">Horas Extras</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">
                {simulatedData.lastUpdate.toLocaleTimeString('pt-BR')}
              </div>
              <div className="text-xs text-muted-foreground">Última Atualização</div>
            </div>
          </div>

          {/* Controles */}
          <div className="flex gap-2">
            <Button
              onClick={isSimulating ? stopSimulation : startSimulation}
              variant={isSimulating ? "destructive" : "default"}
              size="sm"
            >
              <Clock className="w-4 h-4 mr-2" />
              {isSimulating ? "Parar Simulação" : "Iniciar Simulação"}
            </Button>
            
            <Button
              onClick={addOvertime}
              variant="outline"
              size="sm"
              disabled={!isSimulating}
            >
              <Zap className="w-4 h-4 mr-2" />
              Adicionar 1.5h
            </Button>

            <Button
              onClick={manualRefresh}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar Agora
            </Button>
          </div>

          {/* Informações */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• O sistema atualiza automaticamente a cada 3 segundos</p>
            <p>• Durante a simulação, os dados mudam automaticamente</p>
            <p>• O indicador mostra quando há atualizações em andamento</p>
            <p>• A posição de rolagem e filtros são preservados</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};