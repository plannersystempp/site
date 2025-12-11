import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

const ErrorReportingTelemetry: React.FC = () => {
  return (
    <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 pb-20 md:pb-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Telemetria de Erros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Estatísticas e relatórios de erros do sistema serão exibidos aqui.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorReportingTelemetry;
