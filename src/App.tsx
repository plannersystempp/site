
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './providers/QueryProvider';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './providers/ThemeProvider';
import { SessionTimeout } from './components/shared/SessionTimeout';
import { PWAManager } from './components/shared/PWAManager';
import { EnhancedDataProvider } from './contexts/EnhancedDataContext';
import { TeamProvider } from './contexts/TeamContext';
import { LoginScreen } from './components/LoginScreen';
import { ResetPasswordPage } from './components/ResetPasswordPage';
import { Landing } from './pages/Landing';
import { TermosDeUso } from './pages/TermosDeUso';
import { PoliticaPrivacidade } from './pages/PoliticaPrivacidade';
import { Layout } from './components/Layout';
import { Toaster } from './components/ui/toaster';
import Dashboard from './components/Dashboard';
import { ManagePersonnel } from './components/personnel/ManagePersonnel';
import { ManageFunctions } from './components/functions/ManageFunctions';
import { ManageEvents } from './components/events/ManageEvents';
import { EventDetail } from './components/events/EventDetail';
import { EstimatedCosts } from './components/costs/EstimatedCosts';
import { PayrollManager } from './components/payroll/PayrollManager';
import { PayrollEventView } from './components/payroll/PayrollEventView';
import { PayrollReportPage } from './pages/PayrollReportPage';
import { Settings } from './components/admin/Settings';
import { SettingsPage } from './components/SettingsPage';
import { TeamManagement } from './components/teams/TeamManagement';
import { ManageSuppliers } from './components/suppliers/ManageSuppliers';
import { Card, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { PendingApprovalScreen } from './components/PendingApprovalScreen';
import { TermsAcceptanceModal } from './components/shared/TermsAcceptanceModal';
import { supabase } from './integrations/supabase/client';
import './App.css';
import { EnhancedAdminSettings } from './components/admin/EnhancedAdminSettings';
import SuperAdmin from './pages/SuperAdmin';
import UpgradePlan from './pages/UpgradePlan';



// Hook para remover badges do Lovable
const useLovableBadgeRemover = () => {
  useEffect(() => {
    const removeLovableBadge = () => {
      try {
        // Seletores para encontrar elementos relacionados ao Lovable
        const selectors = [
          '[href*="lovable.dev"]',
          '[href*="lovable"]',
          '[src*="lovable.dev"]', 
          '[src*="lovable"]',
          'iframe[src*="lovable"]',
          '[class*="lovable" i]',
          '[id*="lovable" i]',
          '[data-testid*="lovable" i]',
          '[aria-label*="lovable" i]',
          '[title*="lovable" i]',
          '[alt*="lovable" i]',
          '.lovable-badge',
          '#lovable-badge',
          '.edit-badge',
          '.editor-badge',
          '[style*="Edit with Lovable"]',
          '[style*="position: fixed"][style*="bottom:"][style*="right:"]',
          '[style*="position:fixed"][style*="bottom:"][style*="right:"]'
        ];
        
        // Remove elementos por seletor
        selectors.forEach(selector => {
          try {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
              if (element && element.remove) {
                element.remove();
              }
            });
          } catch (e) {
            // Ignora erros de seletor inválido
          }
        });

        // Remove elementos por conteúdo de texto
        document.querySelectorAll('*:not(script):not(style):not(meta)').forEach(element => {
          try {
            const htmlElement = element as HTMLElement;
            const text = htmlElement.textContent || htmlElement.innerText || '';
            if (text && (
              text.toLowerCase().includes('lovable') ||
              text.toLowerCase().includes('edit with') ||
              text.toLowerCase().includes('edit in')
            )) {
              if (element.tagName !== 'BODY' && 
                  element.tagName !== 'HTML' && 
                  element.tagName !== 'HEAD' &&
                  !element.closest('main') &&
                  !element.closest('[role="main"]')) {
                const style = htmlElement.style;
                style.display = 'none';
                style.visibility = 'hidden';
                style.opacity = '0';
              }
            }
          } catch (e) {
            // Ignora erros
          }
        });

        // Remove elementos fixos suspeitos no canto inferior direito
        document.querySelectorAll('div, a, span, img').forEach(element => {
          try {
            const htmlElement = element as HTMLElement;
            const style = window.getComputedStyle(element);
            if (style.position === 'fixed' && 
                (style.bottom !== 'auto' || style.right !== 'auto') &&
                htmlElement.offsetWidth < 200 && 
                htmlElement.offsetHeight < 200) {
              
              const rect = element.getBoundingClientRect();
              const isBottomRight = rect.right > window.innerWidth - 200 && 
                                   rect.bottom > window.innerHeight - 200;
              
              if (isBottomRight) {
                htmlElement.style.display = 'none';
              }
            }
          } catch (e) {
            // Ignora erros
          }
        });

      } catch (error) {
        console.warn('Erro ao remover badge do Lovable:', error);
      }
    };

    // Executa imediatamente
    removeLovableBadge();
    
    // Executa após DOM carregar
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', removeLovableBadge);
    }
    
    // Executa depois de um tempo
    const timeouts = [100, 500, 1000, 2000, 5000];
    const timeoutIds = timeouts.map(delay => 
      setTimeout(removeLovableBadge, delay)
    );
    
    // Executa periodicamente
    const intervalId = setInterval(removeLovableBadge, 3000);
    
    // Observer para mudanças no DOM
    const observer = new MutationObserver(removeLovableBadge);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'id']
    });
    
    return () => {
      timeoutIds.forEach(clearTimeout);
      clearInterval(intervalId);
      observer.disconnect();
      document.removeEventListener('DOMContentLoaded', removeLovableBadge);
    };
  }, []);
};

// Componente para salvar a rota atual
const RouteTracker = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Salva a rota atual no sessionStorage sempre que ela mudar
    if (location.pathname !== '/auth' && location.pathname !== '/') {
      sessionStorage.setItem('lastRoute', location.pathname);
    }
  }, [location.pathname]);
  
  return null;
};

// Componente para restaurar a rota após login
const RouteRestorer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Restaura a última rota salva apenas se estivermos na rota raiz do app
    if (location.pathname === '/app' || location.pathname === '/app/') {
      const lastRoute = sessionStorage.getItem('lastRoute');
      if (lastRoute && lastRoute !== '/app' && lastRoute !== '/app/') {
        navigate(lastRoute.replace('/app', ''), { replace: true });
      }
    }
  }, [navigate, location.pathname]);
  
  return null;
};

const PendingApprovalMessage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleBackToLogin = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Aguardando Aprovação</h2>
          <p className="text-muted-foreground mb-6">
            Sua conta está aguardando aprovação do administrador. 
            Você receberá acesso assim que for aprovado.
          </p>
          <Button 
            onClick={handleBackToLogin}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

const AppContent = () => {
  const { user, isLoading } = useAuth();
  const [teamApprovalStatus, setTeamApprovalStatus] = useState<{
    loading: boolean;
    status: 'approved' | 'pending' | 'rejected' | null;
    teamName: string;
  }>({ loading: true, status: null, teamName: '' });

  // Usar o hook para remover badges do Lovable
  useLovableBadgeRemover();

  useEffect(() => {
    const checkTeamApprovalStatus = async () => {
      if (!user) return;

      // Se é admin, sempre aprovado
      if (user.role === 'admin' || user.isApproved) {
        setTeamApprovalStatus({
          loading: false,
          status: 'approved',
          teamName: 'Admin'
        });
        return;
      }

      try {
        // Verificar se o usuário é owner de alguma equipe
        const { data: ownedTeams, error: ownedError } = await supabase
          .from('teams')
          .select('name')
          .eq('owner_id', user.id);

        if (ownedError) throw ownedError;

        if (ownedTeams && ownedTeams.length > 0) {
          setTeamApprovalStatus({
            loading: false,
            status: 'approved',
            teamName: ownedTeams[0].name
          });
          return;
        }

        // Verificar se o usuário tem alguma membership em equipes
        const { data: memberships, error } = await supabase
          .from('team_members')
          .select(`
            status,
            teams!inner(name)
          `)
          .eq('user_id', user.id);

        if (error) throw error;

        if (memberships && memberships.length > 0) {
          // Procurar por uma membership aprovada
          const approvedMembership = memberships.find(m => m.status === 'approved');
          
          if (approvedMembership) {
            setTeamApprovalStatus({
              loading: false,
              status: 'approved',
              teamName: approvedMembership.teams.name
            });
          } else {
            // Se não tem aprovada, pegar a primeira pendente
            const pendingMembership = memberships.find(m => m.status === 'pending');
            if (pendingMembership) {
              setTeamApprovalStatus({
                loading: false,
                status: 'pending',
                teamName: pendingMembership.teams.name
              });
            } else {
              setTeamApprovalStatus({
                loading: false,
                status: 'rejected',
                teamName: ''
              });
            }
          }
        } else {
          setTeamApprovalStatus({
            loading: false,
            status: null,
            teamName: ''
          });
        }
      } catch (error) {
        console.error('Error checking team approval status:', error);
        setTeamApprovalStatus({
          loading: false,
          status: null,
          teamName: ''
        });
      }
    };

    checkTeamApprovalStatus();
  }, [user]);

  if (isLoading || teamApprovalStatus.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Mostrar tela de aprovação pendente se necessário
  if (teamApprovalStatus.status === 'pending') {
    return <PendingApprovalScreen teamName={teamApprovalStatus.teamName} />;
  }

  // Verificar se o usuário foi aprovado (fallback para o sistema antigo)
  if (!user.isApproved && user.role !== 'admin' && teamApprovalStatus.status !== 'approved') {
    return <PendingApprovalMessage />;
  }

  return (
    <ErrorBoundary>
      <TeamProvider>
        <EnhancedDataProvider>
          <RouteTracker />
          <RouteRestorer />
          <TermsAcceptanceModal />
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/pessoal" element={<ManagePersonnel />} />
              <Route path="/funcoes" element={<ManageFunctions />} />
              <Route path="/eventos" element={<ManageEvents />} />
              <Route path="/eventos/:id" element={<EventDetail />} />
              <Route path="/fornecedores" element={<ManageSuppliers />} />
              <Route path="/custos" element={<EstimatedCosts />} />
              <Route path="/folha" element={<PayrollManager />} />
              <Route path="/folha/:eventId" element={<PayrollEventView />} />
              <Route path="/equipe" element={<TeamManagement />} />
              <Route path="/configuracoes" element={<SettingsPage />} />
              <Route path="/upgrade" element={<UpgradePlan />} />
              {user.role === 'admin' && (
                <Route path="/admin/configuracoes" element={<Settings />} />
              )}
              {user.role === 'superadmin' && (
                <Route path="/superadmin" element={<SuperAdmin />} />
              )}
              <Route path="*" element={<Navigate to="/app" replace />} />
            </Routes>
          </Layout>
        </EnhancedDataProvider>
      </TeamProvider>
    </ErrorBoundary>
  );
};

function App() {
  // Usar o hook também no componente principal
  useLovableBadgeRemover();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="sige-theme">
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<LoginScreen />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/termos-de-uso" element={<TermosDeUso />} />
              <Route path="/politica-de-privacidade" element={<PoliticaPrivacidade />} />
              <Route path="/app/*" element={<AppContent />} />
              {/* Rota de impressão fora do Layout */}
              <Route path="/app/folha/relatorio/:eventId" element={
                <TeamProvider>
                  <EnhancedDataProvider>
                    <PayrollReportPage />
                  </EnhancedDataProvider>
                </TeamProvider>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <SessionTimeout />
            <PWAManager />
          </Router>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
