import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout

export const SessionTimeout: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningTimeoutRef = useRef<NodeJS.Timeout>();
  const countdownRef = useRef<NodeJS.Timeout>();

  const resetTimeout = () => {
    // Clear existing timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    
    setShowWarning(false);
    
    if (!user) return;

    // Set warning timeout
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
      setTimeLeft(WARNING_TIME);
      
      // Start countdown
      countdownRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1000) {
            handleTimeout();
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }, SESSION_TIMEOUT - WARNING_TIME);

    // Set session timeout
    timeoutRef.current = setTimeout(handleTimeout, SESSION_TIMEOUT);
  };

  const handleTimeout = async () => {
    setShowWarning(false);
    toast({
      title: "Sessão Expirada",
      description: "Sua sessão expirou por inatividade. Faça login novamente.",
      variant: "destructive"
    });
    await logout();
  };

  const extendSession = () => {
    setShowWarning(false);
    resetTimeout();
    toast({
      title: "Sessão Renovada",
      description: "Sua sessão foi renovada com sucesso."
    });
  };

  useEffect(() => {
    if (user) {
      resetTimeout();

      // Reset timeout on user activity
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      const resetTimer = () => resetTimeout();

      events.forEach(event => {
        document.addEventListener(event, resetTimer, true);
      });

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, resetTimer, true);
        });
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);
      };
    }
  }, [user]);

  if (!user) return null;

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  return (
    <Dialog open={showWarning} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            Sessão Expirando
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Sua sessão expirará em <span className="font-bold text-red-500">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </span> por inatividade.
          </p>
          <p className="text-sm text-muted-foreground">
            Clique em "Continuar" para manter sua sessão ativa.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleTimeout}>
              Sair
            </Button>
            <Button onClick={extendSession}>
              Continuar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};