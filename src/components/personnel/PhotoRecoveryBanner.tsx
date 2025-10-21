import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { personnelKeys } from '@/hooks/queries/usePersonnelQuery';
import { useTeam } from '@/contexts/TeamContext';

interface PhotoRecoveryBannerProps {
  failedPhotosCount: number;
  onRetry: () => void;
}

export const PhotoRecoveryBanner: React.FC<PhotoRecoveryBannerProps> = ({
  failedPhotosCount,
  onRetry,
}) => {
  const queryClient = useQueryClient();
  const { activeTeam } = useTeam();

  if (failedPhotosCount === 0) return null;

  const handleReload = () => {
    // Invalidate personnel query to force refetch
    queryClient.invalidateQueries({
      queryKey: personnelKeys.list(activeTeam?.id),
    });
    
    // Force page reload as last resort
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <Alert className="mb-4 border-warning bg-warning/10">
      <AlertCircle className="h-4 w-4 text-warning" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-sm">
          {failedPhotosCount} foto{failedPhotosCount > 1 ? 's' : ''} não carregou
          {failedPhotosCount > 1 ? 'ram' : ''}. Tente recarregar.
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReload}
          className="ml-4"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Recarregar Fotos
        </Button>
      </AlertDescription>
    </Alert>
  );
};
