import { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  CreditCard, 
  FileText, 
  Bug, 
  UserX,
  Trash2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MobileBottomNav({ activeTab, onTabChange }: MobileBottomNavProps) {
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);
  
  const tabs = [
    { value: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { value: 'users', label: 'Usuários', icon: Users },
    { value: 'teams', label: 'Equipes', icon: Building2 },
    { value: 'subscriptions', label: 'Planos', icon: CreditCard },
  ];

  const moreTabs = [
    { value: 'audit', label: 'Auditoria', icon: FileText },
    { value: 'error-reports', label: 'Erros', icon: Bug },
    { value: 'orphans', label: 'Órfãos', icon: UserX },
    { value: 'deletion-logs', label: 'Deleções', icon: Trash2 },
  ];

  const isMoreActive = moreTabs.some(tab => tab.value === activeTab);
  
  const handleMoreTabSelect = (tabValue: string) => {
    onTabChange(tabValue);
    setMoreSheetOpen(false);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50 safe-area-inset-bottom">
      <div className="grid grid-cols-4 h-16">
        {tabs.slice(0, 3).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.value;
          
          return (
            <button
              key={tab.value}
              onClick={() => onTabChange(tab.value)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-t-full" />
              )}
            </button>
          );
        })}
        
        <Sheet open={moreSheetOpen} onOpenChange={setMoreSheetOpen}>
          <SheetTrigger asChild>
            <button
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors",
                isMoreActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="grid grid-cols-2 gap-px w-5 h-5">
                <div className="w-2 h-2 bg-current rounded-sm" />
                <div className="w-2 h-2 bg-current rounded-sm" />
                <div className="w-2 h-2 bg-current rounded-sm" />
                <div className="w-2 h-2 bg-current rounded-sm" />
              </div>
              <span className="text-xs font-medium">Mais</span>
              {isMoreActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-t-full" />
              )}
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto">
            <SheetHeader>
              <SheetTitle>Mais Opções</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-2 gap-3 mt-6 pb-4">
              {moreTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.value;
                return (
                  <Button
                    key={tab.value}
                    onClick={() => handleMoreTabSelect(tab.value)}
                    variant={isActive ? "default" : "outline"}
                    className="h-auto flex flex-col items-center gap-3 p-4"
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </Button>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
