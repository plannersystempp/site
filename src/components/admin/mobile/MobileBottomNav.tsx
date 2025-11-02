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

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MobileBottomNav({ activeTab, onTabChange }: MobileBottomNavProps) {
  const tabs = [
    { value: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { value: 'users', label: 'Usuários', icon: Users },
    { value: 'teams', label: 'Equipes', icon: Building2 },
    { value: 'subscriptions', label: 'Planos', icon: CreditCard },
  ];

  const moreTabs = [
    { value: 'audit', label: 'Auditoria', icon: FileText },
    { value: 'errors', label: 'Erros', icon: Bug },
    { value: 'orphans', label: 'Órfãos', icon: UserX },
    { value: 'deletions', label: 'Deleções', icon: Trash2 },
  ];

  const allTabs = [...tabs, ...moreTabs];
  const isMoreActive = moreTabs.some(tab => tab.value === activeTab);

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
        
        <button
          onClick={() => {
            if (isMoreActive) return;
            onTabChange(moreTabs[0].value);
          }}
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
      </div>
    </nav>
  );
}
