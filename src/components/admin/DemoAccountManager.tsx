import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateDemoAccount } from '@/hooks/useCreateDemoAccount';
import { Loader2, Copy, ExternalLink, BarChart3, Users, Calendar, Package, DollarSign } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export const DemoAccountManager = () => {
  const [showResults, setShowResults] = useState(false);
  const [demoData, setDemoData] = useState<any>(null);
  const createDemo = useCreateDemoAccount();

  const handleCreateDemo = async () => {
    try {
      const result = await createDemo.mutateAsync();
      setDemoData(result);
      setShowResults(true);
    } catch (error) {
      console.error('Erro ao criar demo:', error);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copiado!',
      description: `${label} copiado para a área de transferência`,
      duration: 2000
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <>
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Conta de Demonstração
          </CardTitle>
          <CardDescription>
            Crie uma conta completa para demonstração do sistema aos clientes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="text-sm font-medium mb-2">🔐 Credenciais de Acesso:</h4>
              <p className="text-sm font-mono">euquero@plannersystem.com.br</p>
              <p className="text-sm font-mono">Senha: Euquero</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Esta conta demo incluirá:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 30 profissionais cadastrados (fixos e freelancers)</li>
                <li>• 25 eventos variados (passados, em andamento e futuros)</li>
                <li>• 250+ alocações de pessoal</li>
                <li>• 15 fornecedores com itens catalogados</li>
                <li>• 100+ custos de eventos</li>
                <li>• Pagamentos avulsos, avaliações e ausências</li>
                <li>• Assinatura Enterprise válida até 2099</li>
              </ul>
            </div>
          </div>

          <Button 
            onClick={handleCreateDemo} 
            disabled={createDemo.isPending}
            className="w-full"
            size="lg"
          >
            {createDemo.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando Conta Demo...
              </>
            ) : (
              'Criar Conta Demo Completa'
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Esta operação irá recriar a conta demo do zero
          </p>
        </CardContent>
      </Card>

      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">🎉 Conta Demo Criada com Sucesso!</DialogTitle>
            <DialogDescription>
              Dados de acesso e estatísticas da conta de demonstração
            </DialogDescription>
          </DialogHeader>

          {demoData && (
            <div className="space-y-6">
              {/* Credenciais de Acesso */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🔐 Credenciais de Acesso</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground">E-mail</p>
                      <p className="font-mono font-medium">{demoData.credentials.email}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(demoData.credentials.email, 'E-mail')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground">Senha</p>
                      <p className="font-mono font-medium">{demoData.credentials.password}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(demoData.credentials.password, 'Senha')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button className="w-full" asChild>
                    <a href="/login" target="_blank">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Acessar Conta Demo
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* Estatísticas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📊 Estatísticas da Conta</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <p className="text-xs">Eventos</p>
                      </div>
                      <p className="text-2xl font-bold">{demoData.statistics.events}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <p className="text-xs">Profissionais</p>
                      </div>
                      <p className="text-2xl font-bold">{demoData.statistics.personnel}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Package className="h-4 w-4" />
                        <p className="text-xs">Fornecedores</p>
                      </div>
                      <p className="text-2xl font-bold">{demoData.statistics.suppliers}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Alocações</p>
                      <p className="text-2xl font-bold">{demoData.statistics.allocations}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Custos</p>
                      <p className="text-2xl font-bold">{demoData.statistics.event_costs}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Pagamentos</p>
                      <p className="text-2xl font-bold">{demoData.statistics.personnel_payments}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Resumo Financeiro */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Resumo Financeiro
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Receita Total</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(demoData.financial_summary.total_revenue)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Custos Totais</span>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(demoData.financial_summary.total_costs)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Lucro Líquido</span>
                    <span className="font-bold text-lg text-primary">
                      {formatCurrency(demoData.financial_summary.net_profit)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Destaques Rápidos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">✨ Destaques</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {demoData.quick_facts.map((fact: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {fact}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const credentials = `E-mail: ${demoData.credentials.email}\nSenha: ${demoData.credentials.password}`;
                    copyToClipboard(credentials, 'Credenciais completas');
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar Tudo
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setShowResults(false)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
