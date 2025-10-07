import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield } from 'lucide-react';

export const PoliticaPrivacidade: React.FC = () => {
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
              <Shield className="w-6 h-6" />
              Política de Privacidade do SIGE
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Última Atualização: 04 de Agosto de 2025
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <p>
              Esta Política de Privacidade descreve como o SIGE ("nós", "nosso") coleta, usa, 
              compartilha e protege suas informações pessoais quando você usa nossa plataforma.
            </p>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">1. Informações que Coletamos</h2>
              
              <h3 className="text-lg font-medium">1.1. Informações Fornecidas por Você:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Dados de conta: nome, email, senha</li>
                <li>Informações da empresa: nome da empresa, CNPJ</li>
                <li>Dados de pessoal: informações sobre funcionários e freelancers</li>
                <li>Dados de eventos: informações sobre eventos e alocações</li>
                <li>Dados financeiros: informações de folha de pagamento e custos</li>
              </ul>

              <h3 className="text-lg font-medium">1.2. Informações Coletadas Automaticamente:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Logs de acesso e uso da plataforma</li>
                <li>Informações técnicas do dispositivo e navegador</li>
                <li>Endereço IP e localização aproximada</li>
                <li>Cookies e tecnologias similares</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">2. Como Usamos suas Informações</h2>
              <p>Utilizamos suas informações para:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Fornecer e manter os serviços da plataforma</li>
                <li>Processar transações e gerar relatórios</li>
                <li>Comunicar-nos com você sobre atualizações e suporte</li>
                <li>Melhorar nossos serviços e desenvolver novos recursos</li>
                <li>Garantir a segurança e prevenir fraudes</li>
                <li>Cumprir obrigações legais e regulamentares</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">3. Compartilhamento de Informações</h2>
              <p>
                Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, 
                exceto nas seguintes situações:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Com sua autorização expressa</li>
                <li>Para cumprir obrigações legais ou ordem judicial</li>
                <li>Para proteger nossos direitos, propriedade ou segurança</li>
                <li>Com prestadores de serviços que nos auxiliam na operação da plataforma</li>
                <li>Em caso de fusão, aquisição ou venda de ativos</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">4. Segurança dos Dados</h2>
              <p>Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Criptografia de dados em trânsito e em repouso</li>
                <li>Controles de acesso baseados em função</li>
                <li>Monitoramento contínuo de segurança</li>
                <li>Backups regulares e seguros</li>
                <li>Treinamento de equipe em segurança da informação</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">5. Seus Direitos</h2>
              <p>Você tem os seguintes direitos em relação aos seus dados pessoais:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Acesso:</strong> Solicitar informações sobre quais dados temos sobre você</li>
                <li><strong>Correção:</strong> Corrigir dados incorretos ou incompletos</li>
                <li><strong>Exclusão:</strong> Solicitar a exclusão de seus dados pessoais</li>
                <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
                <li><strong>Oposição:</strong> Se opor ao processamento de seus dados</li>
                <li><strong>Limitação:</strong> Solicitar a limitação do processamento</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">6. Retenção de Dados</h2>
              <p>
                Mantemos suas informações pessoais apenas pelo tempo necessário para cumprir as 
                finalidades descritas nesta política, incluindo:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Durante a vigência da sua conta</li>
                <li>Conforme exigido por obrigações legais</li>
                <li>Para resolver disputas e fazer cumprir nossos termos</li>
                <li>Para fins de auditoria e compliance</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">7. Cookies e Tecnologias Similares</h2>
              <p>
                Utilizamos cookies e tecnologias similares para melhorar sua experiência, 
                analisar o uso da plataforma e fornecer funcionalidades personalizadas. 
                Você pode controlar o uso de cookies através das configurações do seu navegador.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">8. Transferências Internacionais</h2>
              <p>
                Seus dados podem ser transferidos e processados em países diferentes do seu país de residência. 
                Garantimos que essas transferências sejam realizadas com proteções adequadas de acordo com 
                as leis aplicáveis de proteção de dados.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">9. Menores de Idade</h2>
              <p>
                Nossos serviços não são destinados a menores de 18 anos. Não coletamos intencionalmente 
                informações pessoais de menores. Se tomarmos conhecimento de que coletamos dados de um menor, 
                tomaremos medidas para excluir essas informações.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">10. Alterações nesta Política</h2>
              <p>
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre 
                mudanças significativas por email ou através de um aviso em nossa plataforma. 
                O uso continuado após as alterações constitui aceitação da política atualizada.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">11. Contato</h2>
              <p>
                Para exercer seus direitos ou esclarecer dúvidas sobre esta Política de Privacidade, 
                entre em contato conosco:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  Email: 
                  <a 
                    href="mailto:sigefgoa@gmail.com" 
                    className="text-primary hover:underline ml-1"
                  >
                    sigefgoa@gmail.com
                  </a>
                </li>
                <li>Assunto: "Privacidade - SIGE"</li>
              </ul>
            </div>

            <div className="bg-muted p-4 rounded-lg mt-6">
              <p className="text-sm text-muted-foreground">
                <strong>Nota:</strong> Esta Política de Privacidade está em conformidade com a 
                Lei Geral de Proteção de Dados (LGPD) e outras leis aplicáveis de proteção de dados.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};