import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, BellOff, Check, AlertCircle, TestTube } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { Separator } from '@/components/ui/separator';

export const NotificationSettings: React.FC = () => {
  const {
    permission,
    isSubscribed,
    preferences,
    loading,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    updatePreferences,
    sendTestNotification,
  } = useNotifications();

  const handleTogglePreference = async (key: keyof typeof preferences) => {
    await updatePreferences({ [key]: !preferences[key] });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notificações Push
        </CardTitle>
        <CardDescription>
          Configure quais notificações você deseja receber no seu dispositivo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status de Permissão */}
        {permission === 'denied' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Você bloqueou as notificações. Para ativar, acesse as configurações do seu navegador.
            </AlertDescription>
          </Alert>
        )}

        {permission === 'default' && (
          <Alert>
            <Bell className="h-4 w-4" />
            <AlertDescription>
              Permita que o SIGE envie notificações importantes para você
            </AlertDescription>
          </Alert>
        )}

        {permission === 'granted' && isSubscribed && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700 dark:text-green-400">
              Notificações ativas! Você receberá alertas importantes.
            </AlertDescription>
          </Alert>
        )}

        {/* Botão de Ativar/Desativar */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base">Notificações Push</Label>
            <p className="text-sm text-muted-foreground">
              {isSubscribed ? 'Receber alertas em tempo real' : 'Ativar notificações push'}
            </p>
          </div>
          {!isSubscribed ? (
            <Button
              onClick={permission === 'granted' ? subscribeToPush : requestPermission}
              disabled={loading || permission === 'denied'}
              variant="default"
            >
              <Bell className="w-4 h-4 mr-2" />
              Ativar
            </Button>
          ) : (
            <Button
              onClick={unsubscribeFromPush}
              disabled={loading}
              variant="outline"
            >
              <BellOff className="w-4 h-4 mr-2" />
              Desativar
            </Button>
          )}
        </div>

        {isSubscribed && (
          <>
            <Separator />

            {/* Botão de Teste */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
              <div className="space-y-1">
                <Label className="text-base">Testar Notificações</Label>
                <p className="text-sm text-muted-foreground">
                  Enviar uma notificação de teste para verificar se está funcionando
                </p>
              </div>
              <Button
                onClick={sendTestNotification}
                disabled={loading}
                variant="secondary"
                size="sm"
              >
                <TestTube className="w-4 h-4 mr-2" />
                Enviar Teste
              </Button>
            </div>

            <Separator />

            {/* Preferências de Notificação */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Tipos de Notificações</h3>

              {/* Eventos */}
              <div className="space-y-3 p-4 border rounded-lg">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  📅 Eventos
                </h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="event_reminders">Lembretes de eventos</Label>
                    <p className="text-xs text-muted-foreground">
                      Notificações gerais sobre eventos
                    </p>
                  </div>
                  <Switch
                    id="event_reminders"
                    checked={preferences.event_reminders}
                    onCheckedChange={() => handleTogglePreference('event_reminders')}
                    disabled={loading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="event_start_24h">Eventos em 24 horas</Label>
                    <p className="text-xs text-muted-foreground">
                      Alerta 1 dia antes do início
                    </p>
                  </div>
                  <Switch
                    id="event_start_24h"
                    checked={preferences.event_start_24h}
                    onCheckedChange={() => handleTogglePreference('event_start_24h')}
                    disabled={loading || !preferences.event_reminders}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="event_start_48h">Eventos em 48 horas</Label>
                    <p className="text-xs text-muted-foreground">
                      Alerta 2 dias antes do início
                    </p>
                  </div>
                  <Switch
                    id="event_start_48h"
                    checked={preferences.event_start_48h}
                    onCheckedChange={() => handleTogglePreference('event_start_48h')}
                    disabled={loading || !preferences.event_reminders}
                  />
                </div>
              </div>

              {/* Pagamentos */}
              <div className="space-y-3 p-4 border rounded-lg">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  💰 Pagamentos
                </h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="payment_reminders">Lembretes de pagamento</Label>
                    <p className="text-xs text-muted-foreground">
                      Alertas sobre vencimentos e pendências
                    </p>
                  </div>
                  <Switch
                    id="payment_reminders"
                    checked={preferences.payment_reminders}
                    onCheckedChange={() => handleTogglePreference('payment_reminders')}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Alocações e Pessoal */}
              <div className="space-y-3 p-4 border rounded-lg">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  👥 Pessoal
                </h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="allocation_updates">Atualizações de alocação</Label>
                    <p className="text-xs text-muted-foreground">
                      Novas alocações em eventos
                    </p>
                  </div>
                  <Switch
                    id="allocation_updates"
                    checked={preferences.allocation_updates}
                    onCheckedChange={() => handleTogglePreference('allocation_updates')}
                    disabled={loading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="absence_alerts">Alertas de ausência</Label>
                    <p className="text-xs text-muted-foreground">
                      Faltas registradas no sistema
                    </p>
                  </div>
                  <Switch
                    id="absence_alerts"
                    checked={preferences.absence_alerts}
                    onCheckedChange={() => handleTogglePreference('absence_alerts')}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Sistema */}
              <div className="space-y-3 p-4 border rounded-lg">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  📊 Sistema
                </h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="status_changes">Mudanças de status</Label>
                    <p className="text-xs text-muted-foreground">
                      Atualizações importantes do sistema
                    </p>
                  </div>
                  <Switch
                    id="status_changes"
                    checked={preferences.status_changes}
                    onCheckedChange={() => handleTogglePreference('status_changes')}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Informações sobre compatibilidade */}
        {!('Notification' in window) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Seu navegador não suporta notificações push. Tente usar Chrome, Firefox, Edge ou Safari atualizado.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
