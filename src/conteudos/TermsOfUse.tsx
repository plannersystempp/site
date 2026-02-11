"use client";

import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppFloating from '../components/WhatsAppFloating';
import PrivacyWidget from '../components/PrivacyWidget';
import PlansModal from '../components/Modals/PlansModal';
import ContactModal from '../components/Modals/ContactModal';
import useUIStore from '../store/ui';

const TermsOfUse: React.FC = () => {
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
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Termos de Uso do PlannerSystem</h1>
        <p className="text-slate-500 mb-8">Última Atualização: 04 de Agosto de 2025</p>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <p className="mb-4">
              Bem-vindo ao PlannerSystem ("Plataforma", "Serviço"), uma plataforma de software como serviço (SaaS) desenvolvida e operada por nós ("nós").
            </p>
            <p className="mb-4">
              Estes Termos de Uso ("Termos") governam o seu acesso e uso da nossa plataforma e serviços. Ao se cadastrar ou usar o PlannerSystem, você e a empresa que você representa ("Cliente", "você") concordam em cumprir estes Termos.
            </p>
            <p className="mb-4">
              Este serviço é fornecido por <strong>PLANNERPRO SOLUÇÕES TECNOLOGICAS LTDA</strong>, inscrita no CNPJ nº <strong>62.979.264/0001-96</strong>.
            </p>
            <p className="font-bold text-slate-900">
              POR FAVOR, LEIA ESTES TERMOS CUIDADOSAMENTE. SE VOCÊ NÃO CONCORDAR COM ELES, NÃO USE A PLATAFORMA.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Descrição do Serviço</h2>
            <p>
              O PlannerSystem é uma plataforma online projetada para auxiliar empresas de eventos a gerenciar suas operações, incluindo o cadastro de pessoal (funcionários e freelancers), criação e gestão de eventos, alocação de equipes, controle de horas trabalhadas e extras, e geração de relatórios financeiros como a folha de pagamento.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Contas de Usuário e Responsabilidades</h2>
            
            <h3 className="text-xl font-semibold text-slate-800 mb-2">2.1. Tipos de Usuário:</h3>
            <p className="mb-4">
              O acesso ao PlannerSystem é concedido através de dois tipos de contas:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>
                <strong>Administrador ("Admin"):</strong> O usuário que cadastra a empresa na plataforma. O Admin tem controle total sobre a equipe, os dados e as configurações da conta da sua empresa.
              </li>
              <li>
                <strong>Coordenador ("Coordinator"):</strong> Um usuário convidado pelo Admin para colaborar na gestão dos dados da equipe, com permissões limitadas conforme definido pela plataforma.
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 mb-2">2.2. Responsabilidades do Cliente:</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Você é responsável por toda a atividade que ocorre na sua conta de equipe.</li>
              <li>Você é responsável por manter a segurança das suas credenciais de login (e-mail e senha).</li>
              <li>O Admin da equipe é o único responsável por aprovar ou rejeitar o acesso de novos Coordenadores e por gerenciar as permissões dentro da sua equipe.</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 mb-2">2.3. Uso Aceitável:</h3>
            <p className="mb-2">Você concorda em não usar a Plataforma para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Inserir qualquer dado falso, ilegal ou que viole os direitos de terceiros.</li>
              <li>Tentar obter acesso não autorizado a contas de outras empresas.</li>
              <li>Interferir ou interromper a integridade ou o desempenho do Serviço.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Propriedade dos Dados e Propriedade Intelectual</h2>
            
            <h3 className="text-xl font-semibold text-slate-800 mb-2">3.1. Propriedade dos Dados do Cliente:</h3>
            <p className="mb-4">
              Você, o Cliente, retém todos os direitos, titularidade e interesse sobre todos os dados que você ou seus usuários inserem na Plataforma ("Dados do Cliente"). Nós não reivindicamos nenhuma propriedade sobre os seus dados.
            </p>

            <h3 className="text-xl font-semibold text-slate-800 mb-2">3.2. Nossa Propriedade Intelectual:</h3>
            <p>
              Nós retemos todos os direitos, titularidade e interesse sobre a Plataforma PlannerSystem, incluindo todo o software, design, marca e documentação. Estes Termos não concedem a você nenhuma licença para usar a marca PlannerSystem ou qualquer um dos nossos ativos de propriedade intelectual, exceto para o uso da Plataforma conforme permitido aqui.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Confidencialidade e Privacidade</h2>
            <p>
              A sua privacidade e a segurança dos seus dados são de extrema importância para nós. A nossa Política de Privacidade, que faz parte integrante destes Termos, descreve como coletamos, usamos e protegemos as suas informações. Por favor, leia-a atentamente.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Disponibilidade do Serviço e Limitação de Responsabilidade</h2>
            <p className="mb-4">
              Faremos todos os esforços comercialmente razoáveis para manter a Plataforma PlannerSystem disponível 24 horas por dia, 7 dias por semana. No entanto, não seremos responsáveis por qualquer indisponibilidade causada por circunstâncias fora do nosso controle razoável (força maior, falhas de provedores de internet, etc.).
            </p>
            <p className="mb-4 uppercase font-semibold text-sm text-slate-700">
              O PLANNERSYSTEM É FORNECIDO "COMO ESTÁ". NA EXTENSÃO MÁXIMA PERMITIDA PELA LEI, NÓS NOS ISENTAMOS DE TODAS AS GARANTIAS, EXPRESSAS OU IMPLÍCITAS. NÃO GARANTIMOS QUE O SERVIÇO SERÁ ININTERRUPTO OU LIVRE DE ERROS.
            </p>
            <p className="uppercase font-semibold text-sm text-slate-700">
              EM NENHUMA CIRCUNSTÂNCIA A NOSSA RESPONSABILIDADE TOTAL DECORRENTE DESTES TERMOS EXCEDERÁ O VALOR PAGO POR VOCÊ PELO SERVIÇO NOS 12 (DOZE) MESES ANTERIORES AO EVENTO QUE DEU ORIGEM À RECLAMAÇÃO.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Rescisão</h2>
            
            <h3 className="text-xl font-semibold text-slate-800 mb-2">6.1. Rescisão pelo Cliente:</h3>
            <p className="mb-4">
              Você pode encerrar a sua conta e o uso do Serviço a qualquer momento, seguindo as instruções na Plataforma (ex: na seção "Configurações").
            </p>

            <h3 className="text-xl font-semibold text-slate-800 mb-2">6.2. Rescisão por Nós:</h3>
            <p>
              Nós nos reservamos o direito de suspender ou encerrar a sua conta e o acesso ao Serviço, com ou sem aviso prévio, se você violar qualquer um destes Termos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Alterações nos Termos</h2>
            <p>
              Nós nos reservamos o direito de modificar estes Termos a qualquer momento. Se fizermos alterações, iremos notificá-lo por e-mail ou através de um aviso na própria Plataforma. O uso continuado do PlannerSystem após a notificação constituirá a sua aceitação dos Termos revisados.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Lei Aplicável</h2>
            <p>
              Estes Termos serão regidos e interpretados de acordo com as leis da República Federativa do Brasil. Fica eleito o foro da Comarca do Rio de Janeiro, Estado do Rio de Janeiro, para dirimir quaisquer controvérsias oriundas destes Termos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Contato</h2>
            <p className="mb-4">Se você tiver alguma dúvida sobre estes Termos de Uso, entre em contato conosco:</p>
            <ul className="space-y-2">
              <li><strong>Email:</strong> contato@plannersystem.com.br</li>
              <li><strong>Razão Social:</strong> PLANNERPRO SOLUÇÕES TECNOLOGICAS LTDA</li>
              <li><strong>CNPJ:</strong> 62.979.264/0001-96</li>
              <li><strong>WhatsApp:</strong> (21) 96586-5470</li>
            </ul>
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

export default TermsOfUse;
