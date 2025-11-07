import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SetDemoRoleAdmin: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'working' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      setStatus('working');
      try {
        const { data: currentUser } = await supabase.auth.getUser();
        if (!currentUser.user) {
          throw new Error('Usuário não autenticado');
        }

        const { error } = await supabase
          .from('user_profiles')
          .update({ role: 'admin' })
          .eq('user_id', currentUser.user.id);

        if (error) throw error;

        setStatus('done');
        setMessage('Papel atualizado para administrador. Recarregando aplicativo...');

        setTimeout(() => {
          navigate('/app/pessoal', { replace: true });
          window.location.reload();
        }, 800);
      } catch (err: any) {
        console.error('Erro ao atualizar papel da conta demo:', err);
        setStatus('error');
        setMessage(err?.message || 'Falha ao atualizar papel');
      }
    };

    run();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Atualizar Papel da Conta Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'working' && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="w-5 h-5" />
              Aplicando papel "admin"...
            </div>
          )}
          {status === 'done' && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              {message}
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              {message}
            </div>
          )}
          {status === 'error' && (
            <Button variant="outline" onClick={() => navigate('/app/pessoal')}>Voltar</Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};