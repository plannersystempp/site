import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText } from 'lucide-react';

export const TermosDeUso: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <FileText className="w-6 h-6" />
              Termos de Uso do PlannerSystem
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Última Atualização: 04 de Agosto de 2025
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <p>
              Bem-vindo ao PlannerSystem ("Plataforma", "Serviço"), uma plataforma de software como serviço (SaaS) 
              desenvolvida e operada por nós ("nós").
            </p>
            <p>
              Estes Termos de Uso ("Termos") governam o seu acesso e uso da nossa plataforma e serviços. 
              Ao se cadastrar ou usar o PlannerSystem, você e a empresa que você representa ("Cliente", "você") 
              concordam em cumprir estes Termos.
            </p>
            <p className="font-bold text-foreground">
              POR FAVOR, LEIA ESTES TERMOS CUIDADOSAMENTE. SE VOCÊ NÃO CONCORDAR COM ELES, NÃO USE A PLATAFORMA.
            </p>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">1. Descrição do Serviço</h2>
              <p>
                O PlannerSystem é uma plataforma online projetada para auxiliar empresas de eventos a gerenciar suas 
                operações, incluindo o cadastro de pessoal (funcionários e freelancers), criação e gestão 
                de eventos, alocação de equipes, controle de horas trabalhadas e extras, e geração de 
                relatórios financeiros como a folha de pagamento.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">2. Contas de Usuário e Responsabilidades</h2>
              
              <h3 className="text-lg font-medium">2.1. Tipos de Usuário:</h3>
              <p>O acesso ao PlannerSystem é concedido através de dois tipos de contas:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Administrador ("Admin"):</strong> O usuário que cadastra a empresa na plataforma. 
                  O Admin tem controle total sobre a equipe, os dados e as configurações da conta da sua empresa.
                </li>
                <li>
                  <strong>Coordenador ("Coordinator"):</strong> Um usuário convidado pelo Admin para colaborar 
                  na gestão dos dados da equipe, com permissões limitadas conforme definido pela plataforma.
                </li>
              </ul>

              <h3 className="text-lg font-medium">2.2. Responsabilidades do Cliente:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Você é responsável por toda a atividade que ocorre na sua conta de equipe.</li>
                <li>Você é responsável por manter a segurança das suas credenciais de login (e-mail e senha).</li>
                <li>
                  O Admin da equipe é o único responsável por aprovar ou rejeitar o acesso de novos 
                  Coordenadores e por gerenciar as permissões dentro da sua equipe.
                </li>
              </ul>

              <h3 className="text-lg font-medium">2.3. Uso Aceitável:</h3>
              <p>Você concorda em não usar a Plataforma para:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Inserir qualquer dado falso, ilegal ou que viole os direitos de terceiros.</li>
                <li>Tentar obter acesso não autorizado a contas de outras empresas.</li>
                <li>Interferir ou interromper a integridade ou o desempenho do Serviço.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">3. Propriedade dos Dados e Propriedade Intelectual</h2>
              
              <h3 className="text-lg font-medium">3.1. Propriedade dos Dados do Cliente:</h3>
              <p>
                Você, o Cliente, retém todos os direitos, titularidade e interesse sobre todos os dados 
                que você ou seus usuários inserem na Plataforma ("Dados do Cliente"). Nós não reivindicamos 
                nenhuma propriedade sobre os seus dados.
              </p>

              <h3 className="text-lg font-medium">3.2. Nossa Propriedade Intelectual:</h3>
              <p>
                Nós retemos todos os direitos, titularidade e interesse sobre a Plataforma PlannerSystem, incluindo 
                todo o software, design, marca e documentação. Estes Termos não concedem a você nenhuma 
                licença para usar a marca PlannerSystem ou qualquer um dos nossos ativos de propriedade intelectual, 
                exceto para o uso da Plataforma conforme permitido aqui.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">4. Confidencialidade e Privacidade</h2>
              <p>
                A sua privacidade e a segurança dos seus dados são de extrema importância para nós. A nossa 
                Política de Privacidade, que faz parte integrante destes Termos, descreve como coletamos, 
                usamos e protegemos as suas informações. Por favor, leia-a atentamente.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">5. Disponibilidade do Serviço e Limitação de Responsabilidade</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  Faremos todos os esforços comercialmente razoáveis para manter a Plataforma PlannerSystem disponível 
                  24 horas por dia, 7 dias por semana. No entanto, não seremos responsáveis por qualquer 
                  indisponibilidade causada por circunstâncias fora do nosso controle razoável (força maior, 
                  falhas de provedores de internet, etc.).
                </li>
                <li>
                  O PLANNERSYSTEM É FORNECIDO "COMO ESTÁ". NA EXTENSÃO MÁXIMA PERMITIDA PELA LEI, NÓS NOS ISENTAMOS DE 
                  TODAS AS GARANTIAS, EXPRESSAS OU IMPLÍCITAS. NÃO GARANTIMOS QUE O SERVIÇO SERÁ ININTERRUPTO 
                  OU LIVRE DE ERROS.
                </li>
                <li>
                  EM NENHUMA CIRCUNSTÂNCIA A NOSSA RESPONSABILIDADE TOTAL DECORRENTE DESTES TERMOS EXCEDERÁ O 
                  VALOR PAGO POR VOCÊ PELO SERVIÇO NOS 12 (DOZE) MESES ANTERIORES AO EVENTO QUE DEU ORIGEM À RECLAMAÇÃO.
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">6. Rescisão</h2>
              
              <h3 className="text-lg font-medium">6.1. Rescisão pelo Cliente:</h3>
              <p>
                Você pode encerrar a sua conta e o uso do Serviço a qualquer momento, seguindo as instruções 
                na Plataforma (ex: na seção "Configurações").
              </p>

              <h3 className="text-lg font-medium">6.2. Rescisão por Nós:</h3>
              <p>
                Nós nos reservamos o direito de suspender ou encerrar a sua conta e o acesso ao Serviço, 
                com ou sem aviso prévio, se você violar qualquer um destes Termos.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">7. Alterações nos Termos</h2>
              <p>
                Nós nos reservamos o direito de modificar estes Termos a qualquer momento. Se fizermos 
                alterações, iremos notificá-lo por e-mail ou através de um aviso na própria Plataforma. 
                O uso continuado do PlannerSystem após a notificação constituirá a sua aceitação dos Termos revisados.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">8. Lei Aplicável</h2>
              <p>
                Estes Termos serão regidos e interpretados de acordo com as leis da República Federativa do Brasil. 
                Fica eleito o foro da Comarca do Rio de Janeiro, Estado do Rio de Janeiro, para dirimir quaisquer 
                controvérsias oriundas destes Termos.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">9. Contato</h2>
              <p>
                Se você tiver alguma dúvida sobre estes Termos de Uso, entre em contato conosco:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  Email: 
                  <a 
                    href="mailto:suporte@plannersystem.com.br" 
                    className="text-primary hover:underline ml-1"
                  >
                    suporte@plannersystem.com.br
                  </a>
                </li>
                <li>
                  WhatsApp: 
                  <a 
                    href="https://wa.me/5521965232224" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline ml-1"
                  >
                    (21) 96523-2224
                  </a>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};