
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RoleManagement } from './RoleManagement';
import { AuditLog } from './AuditLog';
import { SystemHealth } from './SystemHealth';
import { DataExport } from '../shared/DataExport';
import { DangerZone } from './DangerZone';


export const EnhancedAdminSettings: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações Administrativas</h1>
        <p className="text-muted-foreground">Gestão avançada do sistema e usuários</p>
      </div>

      <Tabs defaultValue="roles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="roles">Papéis</TabsTrigger>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
          <TabsTrigger value="export">Exportação</TabsTrigger>
          <TabsTrigger value="health">Sistema</TabsTrigger>
          <TabsTrigger value="danger">Conta</TabsTrigger>
        </TabsList>

        <TabsContent value="roles">
          <RoleManagement />
        </TabsContent>

        <TabsContent value="audit">
          <AuditLog />
        </TabsContent>

        <TabsContent value="export">
          <DataExport />
        </TabsContent>

        <TabsContent value="health">
          <SystemHealth />
        </TabsContent>

        <TabsContent value="danger">
          <DangerZone />
        </TabsContent>
      </Tabs>
    </div>
  );
};
