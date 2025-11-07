
import React, { useRef, useEffect, useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { ScrollNavigationButtons } from './shared/ScrollNavigationButtons';
import { useScrollNavigation } from '@/hooks/useScrollNavigation';
import { useTeam } from '@/contexts/TeamContext';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Crown, Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { SkipToContent } from '@/components/a11y/SkipToContent';
import { AppMobileBottomNav } from '@/components/shared/AppMobileBottomNav';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const mainRef = useRef<HTMLElement>(null);
  const { showScrollToTop, showScrollToBottom, scrollToTop, scrollToBottom } = 
    useScrollNavigation(mainRef);
  const { activeTeam } = useTeam();

  // Check if user is superadmin
  const { data: isSuperAdmin } = useQuery({
    queryKey: ['is-superadmin'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('is_super_admin');
      if (error) throw error;
      return data as boolean;
    }
  });

  const { data: subscription } = useQuery({
    queryKey: ['team-subscription', activeTeam?.id],
    queryFn: async () => {
      if (!activeTeam?.id) return null;

      const { data, error } = await supabase
        .from('team_subscriptions')
        .select(`
          status,
          subscription_plans(display_name)
        `)
        .eq('team_id', activeTeam.id)
        .single();

      if (error) {
        console.error('Erro ao buscar assinatura:', error);
        return null;
      }

      return {
        status: data.status,
        planName: (data.subscription_plans as any)?.display_name || 'Free'
      };
    },
    enabled: !!activeTeam?.id && !isSuperAdmin
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col relative">
          {/* Link de pular para o conteúdo principal (a11y) */}
          <SkipToContent />
          <header role="banner" className="h-14 border-b bg-background flex items-center gap-4 px-4">
            <SidebarTrigger />
            <div className="flex-1" />
            
            {isSuperAdmin ? (
              <Badge variant="destructive" className="flex items-center gap-1" aria-live="polite" aria-atomic="true">
                <Shield className="w-3 h-3" />
                Super Admin
              </Badge>
            ) : subscription && (
              <Badge variant="outline" className="flex items-center gap-1" aria-live="polite" aria-atomic="true">
                <Crown className="w-3 h-3" />
                {subscription.planName}
              </Badge>
            )}
          </header>
          <main
            id="conteudo-principal"
            role="main"
            aria-label="Conteúdo principal"
            tabIndex={-1}
            ref={mainRef}
            className="flex-1 min-h-0 px-3 sm:px-4 md:px-0"
          >
            {children}
          </main>
          <ScrollNavigationButtons 
            showScrollToTop={showScrollToTop}
            showScrollToBottom={showScrollToBottom}
            scrollToTop={scrollToTop}
            scrollToBottom={scrollToBottom}
          />
          {/* Menu inferior móvel com rotas principais */}
          <AppMobileBottomNav />
        </div>
      </div>
    </SidebarProvider>
  );
};
