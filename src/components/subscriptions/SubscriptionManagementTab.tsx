import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useSubscriptionStats } from '@/hooks/useSubscriptionStats';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { Search, MoreVertical, TrendingUp, Users, Clock, XCircle } from 'lucide-react';
import { ExtendTrialDialog } from './ExtendTrialDialog';
import { ChangePlanDialog } from './ChangePlanDialog';
import { SubscriptionDetailsDialog } from './SubscriptionDetailsDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function SubscriptionManagementTab() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string | null>(null);
  const [extendTrialOpen, setExtendTrialOpen] = useState(false);
  const [changePlanOpen, setChangePlanOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = useSubscriptionStats();
  const { data: subscriptionsData, isLoading: subscriptionsLoading } = useSubscriptions({
    status: statusFilter,
    search: searchTerm,
    page,
    pageSize: 10
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'trial':
        return <Badge variant="default">Trial</Badge>;
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Ativo</Badge>;
      case 'past_due':
        return <Badge className="bg-orange-500 hover:bg-orange-600">Vencido</Badge>;
      case 'trial_expired':
        return <Badge variant="destructive">Trial Expirado</Badge>;
      case 'canceled':
        return <Badge variant="secondary">Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statsLoading ? (
          <>
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.active_subscriptions || 0}</div>
                <p className="text-xs text-muted-foreground">Pagando regularmente</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">MRR</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {stats?.mrr?.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs text-muted-foreground">Receita mensal recorrente</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Trials Ativos</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.trial_subscriptions || 0}</div>
                <p className="text-xs text-muted-foreground">Em período de teste</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expirados</CardTitle>
                <XCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.expired_subscriptions || 0}</div>
                <p className="text-xs text-muted-foreground">Trials vencidos</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Assinaturas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome da equipe..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="past_due">Vencido</SelectItem>
                <SelectItem value="trial_expired">Trial Expirado</SelectItem>
                <SelectItem value="canceled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabela */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipe</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptionsLoading ? (
                  <>
                    {[1, 2, 3].map(i => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : subscriptionsData?.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Nenhuma assinatura encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  subscriptionsData?.data.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.teams.name}</TableCell>
                      <TableCell>{sub.subscription_plans.display_name}</TableCell>
                      <TableCell>{getStatusBadge(sub.status)}</TableCell>
                      <TableCell>
                        {format(
                          new Date(sub.trial_ends_at || sub.current_period_ends_at),
                          'dd/MM/yyyy',
                          { locale: ptBR }
                        )}
                      </TableCell>
                      <TableCell>R$ {sub.subscription_plans.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedSubscriptionId(sub.id);
                                setDetailsOpen(true);
                              }}
                            >
                              Ver Detalhes
                            </DropdownMenuItem>
                            {(sub.status === 'trial' || sub.status === 'trial_expired') && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedSubscriptionId(sub.id);
                                  setExtendTrialOpen(true);
                                }}
                              >
                                Estender Trial
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedSubscriptionId(sub.id);
                                setChangePlanOpen(true);
                              }}
                            >
                              Mudar Plano
                            </DropdownMenuItem>
                            {(sub.status === 'canceled' || sub.status === 'trial_expired' || sub.status === 'past_due') && (
                              <DropdownMenuItem
                                onClick={() => {
                                  // Implementar reativação
                                }}
                              >
                                Reativar Assinatura
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          {subscriptionsData && subscriptionsData.total > 10 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {((page - 1) * 10) + 1} - {Math.min(page * 10, subscriptionsData.total)} de {subscriptionsData.total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page * 10 >= subscriptionsData.total}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogos */}
      {selectedSubscriptionId && (
        <>
          <ExtendTrialDialog
            open={extendTrialOpen}
            onOpenChange={setExtendTrialOpen}
            subscriptionId={selectedSubscriptionId}
          />
          <ChangePlanDialog
            open={changePlanOpen}
            onOpenChange={setChangePlanOpen}
            subscriptionId={selectedSubscriptionId}
          />
          <SubscriptionDetailsDialog
            open={detailsOpen}
            onOpenChange={setDetailsOpen}
            subscriptionId={selectedSubscriptionId}
          />
        </>
      )}
    </div>
  );
}
