import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorReportFAB } from '@/components/shared/ErrorReportFAB';
import { AlertCircle } from 'lucide-react';

const ReportarErroPage: React.FC = () => {
  return (
    <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 pb-20 md:pb-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            Reportar Erro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Encontrou um problema? Use o botão flutuante no canto inferior direito para reportar erros.
          </p>
          <ErrorReportFAB />
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportarErroPage;
