
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, AlertCircle } from 'lucide-react';

interface NoTeamSelectedProps {
  title?: string;
  description?: string;
}

export const NoTeamSelected: React.FC<NoTeamSelectedProps> = ({
  title = "Nenhuma equipe selecionada",
  description = "Selecione ou crie uma equipe para começar a usar o sistema."
}) => {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">
            {description}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
