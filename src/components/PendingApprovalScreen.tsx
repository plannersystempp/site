import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface PendingApprovalScreenProps {
  teamName: string;
}

export const PendingApprovalScreen: React.FC<PendingApprovalScreenProps> = ({ teamName }) => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Aguardando Aprovação
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <Clock className="h-16 w-16 text-orange-500 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Solicitação Pendente</h3>
            <p className="text-muted-foreground">
              Sua solicitação de acesso à equipe <strong>{teamName}</strong> foi enviada 
              e está aguardando aprovação do administrador.
            </p>
            <p className="text-sm text-muted-foreground">
              Você será notificado por email assim que sua solicitação for aprovada.
            </p>
          </div>
          <div className="space-y-3">
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair e Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};