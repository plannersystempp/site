
import React, { useRef } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { ScrollNavigationButtons } from './shared/ScrollNavigationButtons';
import { useScrollNavigation } from '@/hooks/useScrollNavigation';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const mainRef = useRef<HTMLElement>(null);
  const { showScrollToTop, showScrollToBottom, scrollToTop, scrollToBottom } = 
    useScrollNavigation(mainRef);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col relative">
          <header className="h-14 border-b bg-background flex items-center gap-4 px-4">
            <SidebarTrigger />
            <div className="flex-1" />
          </header>
          <main ref={mainRef} className="flex-1 overflow-auto min-h-0 px-3 sm:px-4 md:px-0">
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
