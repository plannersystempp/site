import { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Wallet,
  Settings as SettingsIcon,
  Package,
  Wrench,
  BadgeDollarSign,
  Calculator,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useTeam } from '@/contexts/TeamContext';

// Menu inferior móvel com as principais rotas do app
export function AppMobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);
  const { userRole, activeTeam } = useTeam();

  // Rotas principais (abas fixas)
  const tabs = useMemo(() => {
    const allTabs = [
      { path: '/app', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/app/eventos', label: 'Eventos', icon: CalendarDays },
      { path: '/app/pessoal', label: 'Pessoal', icon: Users },
      { path: '/app/fornecedores', label: 'Fornecedores', icon: Package },
    ];
    
    return allTabs.filter(tab => {
      // Coordenadores só veem fornecedores se a equipe permitir
      if (userRole === 'coordinator' && tab.path === '/app/fornecedores') {
        return activeTeam?.allow_coordinators_suppliers === true;
      }
      return true;
    });
  }, [userRole, activeTeam]);

  // Mais opções (sheet)
  const moreTabs = useMemo(() => {
    const allMoreTabs = [
      { path: '/app/configuracoes', label: 'Configurações', icon: SettingsIcon },
      { path: '/app/funcoes', label: 'Funções', icon: Wrench },
      { path: '/app/pagamentos-avulsos', label: 'Avulsos', icon: BadgeDollarSign },
      { path: '/app/custos', label: 'Custos', icon: Calculator },
      { path: '/app/folha', label: 'Folha', icon: Wallet },
      { path: '/app/equipe', label: 'Equipe', icon: Users },
    ];
    
    return allMoreTabs.filter(tab => {
      // Coordenadores não veem módulos financeiros
      if (userRole === 'coordinator') {
        const financialPaths = ['/app/pagamentos-avulsos', '/app/custos', '/app/folha'];
        if (financialPaths.includes(tab.path)) return false;
        
        // Coordenadores não veem Funções e Equipe
        if (tab.path === '/app/funcoes' || tab.path === '/app/equipe') return false;
      }
      return true;
    });
  }, [userRole]);

  const currentPath = location.pathname;

  const isActive = (path: string) => {
    // Considera ativo se a rota atual inicia com o caminho da aba
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  // Verifica se alguma aba do "Mais" está ativa
  const isMoreActive = useMemo(() => 
    moreTabs.some(tab => isActive(tab.path)), 
    [moreTabs, currentPath]
  );

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleMoreTabSelect = (path: string) => {
    navigate(path);
    setMoreSheetOpen(false);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50 safe-area-inset-bottom" aria-label="Navegação principal móvel">
      <div className="grid grid-cols-4 h-16">
        {tabs.slice(0, 3).map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          return (
            <button
              key={tab.path}
              onClick={() => handleNavigate(tab.path)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-colors relative',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{tab.label}</span>
              {active && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-t-full" />
              )}
            </button>
          );
        })}

        <Sheet open={moreSheetOpen} onOpenChange={setMoreSheetOpen}>
          <SheetTrigger asChild>
            <button
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-colors relative',
                isMoreActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
              aria-haspopup="true"
              aria-expanded={moreSheetOpen}
              aria-label="Mais opções"
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
          <SheetContent side="bottom" className="h-auto" aria-label="Menu de mais opções">
            <SheetHeader>
              <SheetTitle>Mais Opções</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-2 gap-3 mt-6 pb-4">
              {moreTabs.map((tab) => {
                const Icon = tab.icon;
                const active = isActive(tab.path);
                return (
                  <Button
                    key={tab.path}
                    onClick={() => handleMoreTabSelect(tab.path)}
                    variant={active ? 'default' : 'outline'}
                    className="h-auto flex flex-col items-center gap-3 p-4"
                    aria-current={active ? 'page' : undefined}
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