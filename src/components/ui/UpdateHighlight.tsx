import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface UpdateHighlightProps {
  children: React.ReactNode;
  updateKey?: string | number;
  duration?: number;
  className?: string;
}

/**
 * Componente que adiciona um efeito visual quando os dados são atualizados
 * Usa animação sutil para indicar mudanças sem interromper a experiência do usuário
 */
export const UpdateHighlight: React.FC<UpdateHighlightProps> = ({
  children,
  updateKey,
  duration = 1000,
  className
}) => {
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [lastUpdateKey, setLastUpdateKey] = useState(updateKey);

  useEffect(() => {
    if (updateKey !== lastUpdateKey) {
      setIsHighlighted(true);
      setLastUpdateKey(updateKey);

      const timer = setTimeout(() => {
        setIsHighlighted(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [updateKey, lastUpdateKey, duration]);

  return (
    <div 
      className={cn(
        'transition-all duration-300',
        isHighlighted && 'animate-pulse bg-blue-50/30',
        className
      )}
    >
      {children}
    </div>
  );
};