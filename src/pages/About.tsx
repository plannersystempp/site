import React from 'react';
import { Info, Target, Heart, Shield, Users, Globe } from 'lucide-react';
import SolutionLayout from '../components/SolutionLayout';

const About: React.FC = () => {
  return (
    <SolutionLayout
      title="Sobre o PlannerSystem"
      description="Transformando a maneira como você organiza sua vida e seus negócios através de tecnologia inteligente e design intuitivo."
      icon={Info}
      gradient="from-slate-600 to-zinc-600"
    >
      <div className="space-y-20">
        {/* Nossa História */}
        <section className="text-center max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Nossa História</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            O PlannerSystem nasceu da necessidade de simplificar. Em um mundo cada vez mais complexo, 
            percebemos que as ferramentas de gestão estavam se tornando parte do problema, não da solução. 
            Fundada em 2024, nossa missão é fornecer um ecossistema integrado onde produtividade encontra simplicidade.
          </p>
        </section>

        {/* Missão, Visão, Valores */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6 text-blue-600">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Missão</h3>
            <p className="text-gray-600">
              Empoderar indivíduos e empresas com ferramentas que eliminam o caos e promovem o crescimento sustentável.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6 text-purple-600">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Visão</h3>
            <p className="text-gray-600">
              Ser a referência global em sistemas de planejamento integrado, reconhecida pela inovação e excelência em UX.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center mb-6 text-rose-600">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Valores</h3>
            <p className="text-gray-600">
              Simplicidade radical, transparência total e foco obsessivo no sucesso do cliente.
            </p>
          </div>
        </div>

        {/* Números/Impacto */}
        <section className="bg-slate-50 rounded-3xl p-12">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">+10k</div>
              <div className="text-gray-600 font-medium">Usuários Ativos</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">99.9%</div>
              <div className="text-gray-600 font-medium">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">24/7</div>
              <div className="text-gray-600 font-medium">Suporte</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-600 mb-2">4.9</div>
              <div className="text-gray-600 font-medium">Avaliação Média</div>
            </div>
          </div>
        </section>

        {/* Time (Abstrato) */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Quem Faz Acontecer</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Somos um time multidisciplinar de engenheiros, designers e estrategistas apaixonados por resolver problemas complexos.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Especialista Planner</div>
                  <div className="text-sm text-blue-600">Liderança & Estratégia</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </SolutionLayout>
  );
};

export default About;
