
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save, Shield, Bell, Database } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    systemName: 'SIGE Event Control',
    maintenanceMode: false,
    allowRegistrations: true,
    emailNotifications: true,
    autoApproveUsers: false,
    defaultUserRole: 'coordinator',
    sessionTimeout: 24,
    backupEnabled: true
  });

  const handleSaveSettings = () => {
    // Here you would save settings to database/local storage
    toast({
      title: "Configurações salvas",
      description: "As configurações do sistema foram atualizadas com sucesso.",
    });
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6 md:h-8 md:w-8" />
          Configurações do Sistema
        </h1>
        <Button onClick={handleSaveSettings} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          <span className="hidden sm:inline">Salvar Configurações</span>
          <span className="sm:hidden">Salvar</span>
        </Button>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações Gerais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="systemName">Nome do Sistema</Label>
              <Input
                id="systemName"
                value={settings.systemName}
                onChange={(e) => handleSettingChange('systemName', e.target.value)}
                placeholder="Nome do sistema"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Timeout de Sessão (horas)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                min="1"
                max="168"
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Configurações de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Modo de Manutenção</Label>
              <p className="text-sm text-muted-foreground">
                Bloqueia acesso de usuários não-admin
              </p>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Permitir Registros</Label>
              <p className="text-sm text-muted-foreground">
                Permite que novos usuários se registrem
              </p>
            </div>
            <Switch
              checked={settings.allowRegistrations}
              onCheckedChange={(checked) => handleSettingChange('allowRegistrations', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-aprovar Usuários</Label>
              <p className="text-sm text-muted-foreground">
                Aprova automaticamente novos usuários
              </p>
            </div>
            <Switch
              checked={settings.autoApproveUsers}
              onCheckedChange={(checked) => handleSettingChange('autoApproveUsers', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Configurações de Notificação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificações por Email</Label>
              <p className="text-sm text-muted-foreground">
                Enviar notificações importantes por email
              </p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Configurações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Backup Automático</Label>
              <p className="text-sm text-muted-foreground">
                Realizar backup automático dos dados
              </p>
            </div>
            <Switch
              checked={settings.backupEnabled}
              onCheckedChange={(checked) => handleSettingChange('backupEnabled', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
