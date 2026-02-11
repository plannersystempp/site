"use client";
import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppFloating from '../components/WhatsAppFloating';
import PrivacyWidget from '../components/PrivacyWidget';
import PlansModal from '../components/Modals/PlansModal';
import ContactModal from '../components/Modals/ContactModal';
import useUIStore from '../store/ui';

const PrivacyPolicy: React.FC = () => {
  const {
    showPlansModal,
    showContactModal,
    openPlansModal,
    closePlansModal,
    openContactModal,
    closeContactModal,
  } = useUIStore();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="font-sans text-slate-600 bg-white selection:bg-blue-900 selection:text-white overflow-x-hidden relative min-h-screen flex flex-col">
      <Navbar 
        onContactClick={openContactModal}
        onPlansClick={openPlansModal}
      />

      <main className="flex-grow pt-32 pb-20 px-6 container mx-auto max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Política de Privacidade do PlannerSystem</h1>
        <p className="text-slate-500 mb-8">Última Atualização: 04 de Agosto de 2025</p>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <p className="mb-4">
              Esta Política de Privacidade descreve como o PlannerSystem ("nós", "nosso") coleta, usa, compartilha e protege suas informações pessoais quando você usa nossa plataforma.
            </p>
            <p>
              O PlannerSystem é operado por <strong>PLANNERPRO SOLUÇÕES TECNOLOGICAS LTDA</strong>, inscrita no CNPJ nº <strong>62.979.264/0001-96</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Informações que Coletamos</h2>
            
            <h3 className="text-xl font-semibold text-slate-800 mb-2">1.1. Informações Fornecidas por Você:</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Dados de conta:</strong> nome, email, senha</li>
              <li><strong>Informações da empresa:</strong> nome da empresa, CNPJ</li>
              <li><strong>Dados de pessoal:</strong> informações sobre funcionários e freelancers</li>
              <li><strong>Dados de eventos:</strong> informações sobre eventos e alocações</li>
              <li><strong>Dados financeiros:</strong> informações de folha de pagamento e custos</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 mb-2">1.2. Informações Coletadas Automaticamente:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Logs de acesso e uso da plataforma</li>
              <li>Informações técnicas do dispositivo e navegador</li>
              <li>Endereço IP e localização aproximada</li>
              <li>Cookies e tecnologias similares</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Como Usamos suas Informações</h2>
            <p className="mb-2">Utilizamos suas informações para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fornecer e manter os serviços da plataforma</li>
              <li>Processar transações e gerar relatórios</li>
              <li>Comunicar-nos com você sobre atualizações e suporte</li>
              <li>Melhorar nossos serviços e desenvolver novos recursos</li>
              <li>Garantir a segurança e prevenir fraudes</li>
              <li>Cumprir obrigações legais e regulamentares</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Compartilhamento de Informações</h2>
            <p className="mb-2">
              Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto nas seguintes situações:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Com sua autorização expressa</li>
              <li>Para cumprir obrigações legais ou ordem judicial</li>
              <li>Para proteger nossos direitos, propriedade ou segurança</li>
              <li>Com prestadores de serviços que nos auxiliam na operação da plataforma</li>
              <li>Em caso de fusão, aquisição ou venda de ativos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Segurança dos Dados</h2>
            <p className="mb-2">
              Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Criptografia de dados em trânsito e em repouso</li>
              <li>Controles de acesso baseados em função</li>
              <li>Monitoramento contínuo de segurança</li>
              <li>Backups regulares e seguros</li>
              <li>Treinamento de equipe em segurança da informação</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Seus Direitos</h2>
            <p className="mb-2">Você tem os seguintes direitos em relação aos seus dados pessoais:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Acesso:</strong> Solicitar informações sobre quais dados temos sobre você</li>
              <li><strong>Correção:</strong> Corrigir dados incorretos ou incompletos</li>
              <li><strong>Exclusão:</strong> Solicitar a exclusão de seus dados pessoais</li>
              <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
              <li><strong>Oposição:</strong> Se opor ao processamento de seus dados</li>
              <li><strong>Limitação:</strong> Solicitar a limitação do processamento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Retenção de Dados</h2>
            <p className="mb-2">
              Mantemos suas informações pessoais apenas pelo tempo necessário para cumprir as finalidades descritas nesta política, incluindo:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Durante a vigência da sua conta</li>
              <li>Conforme exigido por obrigações legais</li>
              <li>Para resolver disputas e fazer cumprir nossos termos</li>
              <li>Para fins de auditoria e compliance</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Cookies e Tecnologias Similares</h2>
            <p>
              Utilizamos cookies e tecnologias similares para melhorar sua experiência, analisar o uso da plataforma e fornecer funcionalidades personalizadas. Você pode controlar o uso de cookies através das configurações do seu navegador.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Transferências Internacionais</h2>
            <p>
              Seus dados podem ser transferidos e processados em países diferentes do seu país de residência. Garantimos que essas transferências sejam realizadas com proteções adequadas de acordo com as leis aplicáveis de proteção de dados.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Menores de Idade</h2>
            <p>
              Nossos serviços não são destinados a menores de 18 anos. Não coletamos intencionalmente informações pessoais de menores. Se tomarmos conhecimento de que coletamos dados de um menor, tomaremos medidas para excluir essas informações.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Alterações nesta Política</h2>
            <p>
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre mudanças significativas por email ou através de um aviso em nossa plataforma. O uso continuado após as alterações constitui aceitação da política atualizada.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Contato</h2>
            <p className="mb-4">Para exercer seus direitos ou esclarecer dúvidas sobre esta Política de Privacidade, entre em contato conosco:</p>
            <ul className="space-y-2">
              <li><strong>Email:</strong> contato@plannersystem.com.br</li>
              <li><strong>Razão Social:</strong> PLANNERPRO SOLUÇÕES TECNOLOGICAS LTDA</li>
              <li><strong>CNPJ:</strong> 62.979.264/0001-96</li>
              <li><strong>WhatsApp:</strong> (21) 96586-5470</li>
              <li><strong>Assunto:</strong> "Privacidade - PlannerSystem"</li>
            </ul>
            <p className="mt-4 text-sm text-slate-500 italic">
              Nota: Esta Política de Privacidade está em conformidade com a Lei Geral de Proteção de Dados (LGPD) e outras leis aplicáveis de proteção de dados.
            </p>
          </section>
        </div>
      </main>

      <Footer onContactClick={openContactModal} />
      
      <WhatsAppFloating />
      <PrivacyWidget />

      {showPlansModal && (
        <PlansModal
          isOpen={true}
          onClose={closePlansModal}
          onContactClick={() => {
            closePlansModal();
            openContactModal();
          }}
        />
      )}
      {showContactModal && <ContactModal isOpen={true} onClose={closeContactModal} />}
    </div>
  );
};

export default PrivacyPolicy;
