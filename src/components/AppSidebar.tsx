import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Settings, 
  Users, 
  Calendar, 
  DollarSign, 
  Calculator,
  Command,
  LogOut,
  User,
  ChevronUp,
  Briefcase,
  Mail,
  ShieldCheck
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

const menuItems = [
  { title: 'Dashboard', url: '/app', icon: Home },
  { title: 'Funções', url: '/app/funcoes', icon: Briefcase },
  { title: 'Pessoal', url: '/app/pessoal', icon: Users },
  { title: 'Eventos', url: '/app/eventos', icon: Calendar },
];

const financialItems = [
  { title: 'Custos', url: '/app/custos', icon: DollarSign },
  { title: 'Folha de Pagamento', url: '/app/folha', icon: Calculator },
];

const adminItems = [
  { title: 'Gerenciar Equipe', url: '/app/equipe', icon: Users },
];

const platformItems = [
  { title: 'Super Admin', url: '/app/superadmin', icon: ShieldCheck },
];

export const AppSidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { userRole, activeTeam } = useTeam();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const isActive = (path: string) => {
    if (path === '/app') {
      return location.pathname === '/app' || location.pathname === '/app/';
    }
    return location.pathname === path;
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link to="/app" className="block">
          <div className="flex items-center gap-2">
            <img 
              src="/icons/icon-192x192.png" 
              alt="SIGE Logo" 
              className="w-8 h-8 rounded-lg object-cover"
            />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">SIGE</span>
              <span className="truncate text-xs">Sistema de Gestão</span>
            </div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems
                .filter(item => {
                  if (userRole === 'superadmin') {
                    return item.title !== 'Pessoal' && item.title !== 'Eventos';
                  }
                  return true;
                })
                .map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {(userRole === 'admin' || userRole === 'financeiro') && (
          <SidebarGroup>
            <SidebarGroupLabel>Financeiro</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {financialItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {userRole === 'admin' && (
          <SidebarGroup>
            <SidebarGroupLabel>Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {userRole === 'superadmin' && (
          <SidebarGroup>
            <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {platformItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-2">
        <Button
          variant="secondary"
          size="sm" aria-label="Reportar Erro"
          onClick={() => {
            const recipient = "suporte@sige.com.br";
            const subject = "Report de Erro - SIGE";
            const body = `Por favor, descreva o erro que encontrou e os passos para reproduzi-lo:\n[...]\n\n------------------\nInformações de Debug (Não apague):\nUsuário: ${user?.email || 'Não logado'}\nEquipe Ativa: ${activeTeam?.name || 'Nenhuma'}\nPágina Atual: ${window.location.href}\nData: ${new Date().toISOString()}`;
            window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          }}
          className="w-full justify-start text-xs"
        >
          <Mail className="mr-2 h-3 w-3" />
          Reportar Erro
        </Button>
        
        <div className="flex justify-between text-xs">
          <a
            href="/termos-de-uso"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sidebar-foreground underline hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded px-1 transition-colors"
          >
            Termos de Uso
          </a>
          <a
            href="/politica-de-privacidade"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sidebar-foreground underline hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded px-1 transition-colors"
          >
            Política de Privacidade
          </a>
        </div>
        
        <DropdownMenu open={showUserMenu} onOpenChange={setShowUserMenu}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="w-full justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <div className="flex flex-col min-w-0 flex-1 text-left">
                  <span className="text-sm font-medium truncate">{user?.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">{userRole}</span>
                </div>
              </div>
              <ChevronUp className="h-4 w-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
            <DropdownMenuItem asChild>
              <Link to="/app/configuracoes">
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="p-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Tema</span>
                <ThemeToggle />
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
};