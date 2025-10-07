import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const TermsAcceptanceModal: React.FC = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkTermsAcceptance = async () => {
      if (!user) return;

      try {
        // Verificar se o usuário já aceitou os termos
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('terms_accepted_at')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error checking terms acceptance:', error);
          return;
        }

        // Se não aceitou os termos ainda, mostrar o modal
        if (!profile?.terms_accepted_at) {
          setShowModal(true);
        }
      } catch (error) {
        console.error('Error checking terms acceptance:', error);
      }
    };

    checkTermsAcceptance();
  }, [user]);

  const handleAcceptTerms = async () => {
    if (!user || !acceptedTerms) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          terms_accepted_at: new Date().toISOString() 
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setShowModal(false);
    } catch (error) {
      console.error('Error accepting terms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={showModal} onOpenChange={() => {}} modal>
      <DialogContent className="max-w-2xl max-h-[80vh]">{/* sem hideCloseButton - não existe */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="w-5 h-5" />
            Novos Termos de Uso e Política de Privacidade
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Atualizamos nossos Termos de Uso e Política de Privacidade. Para continuar 
            usando o SIGE, você precisa aceitar os novos termos.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4" />
                <h3 className="font-medium">Termos de Uso</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Definem as regras e responsabilidades para o uso da plataforma SIGE.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => window.open('/termos-de-uso', '_blank')}
              >
                Ler Termos de Uso
              </Button>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4" />
                <h3 className="font-medium">Política de Privacidade</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Explica como coletamos, usamos e protegemos seus dados pessoais.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => window.open('/politica-de-privacidade', '_blank')}
              >
                Ler Política de Privacidade
              </Button>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-start space-x-2 mb-4">
              <Checkbox
                id="acceptNewTerms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                className="self-center"
              />
              <Label htmlFor="acceptNewTerms" className="text-sm leading-tight">
                Eu li e concordo com os novos{' '}
                <button
                  type="button"
                  onClick={() => window.open('/termos-de-uso', '_blank')}
                  className="text-primary hover:underline"
                >
                  Termos de Uso
                </button>
                {' '}e{' '}
                <button
                  type="button"
                  onClick={() => window.open('/politica-de-privacidade', '_blank')}
                  className="text-primary hover:underline"
                >
                  Política de Privacidade
                </button>
                {' '}do SIGE.
              </Label>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleAcceptTerms} 
                disabled={!acceptedTerms || isLoading}
                className="min-w-32"
              >
                {isLoading ? 'Salvando...' : 'Aceitar e Continuar'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};