
import React, { useRef, useEffect, useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { ScrollNavigationButtons } from './shared/ScrollNavigationButtons';
import { useScrollNavigation } from '@/hooks/useScrollNavigation';
import { useTeam } from '@/contexts/TeamContext';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const mainRef = useRef<HTMLElement>(null);
  const { showScrollToTop, showScrollToBottom, scrollToTop, scrollToBottom } = 
    useScrollNavigation(mainRef);
  const { activeTeam } = useTeam();
  const [planName, setPlanName] = useState<string>('');

  useEffect(() => {
    const loadPlanName = async () => {
      if (!activeTeam) return;

      try {
        const { data, error } = await supabase
          .from('team_subscriptions')
          .select('subscription_plans(display_name)')
          .eq('team_id', activeTeam.id)
          .single();

        if (!error && data) {
          setPlanName((data.subscription_plans as any)?.display_name || '');
        }
      } catch (error) {
        console.error('Erro ao carregar plano:', error);
      }
    };

    loadPlanName();
  }, [activeTeam]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col relative">
          <header className="h-14 border-b bg-background flex items-center gap-4 px-4">
            <SidebarTrigger />
            <div className="flex-1" />
            {planName && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Crown className="w-3 h-3" />
                {planName}
              </Badge>
            )}
          </header>
          <main ref={mainRef} className="flex-1 min-h-0 px-3 sm:px-4 md:px-0">
            {children}
          </main>
          <ScrollNavigationButtons 
            showScrollToTop={showScrollToTop}
            showScrollToBottom={showScrollToBottom}
            scrollToTop={scrollToTop}
            scrollToBottom={scrollToBottom}
          />
        </div>
      </div>
    </SidebarProvider>
  );
};
