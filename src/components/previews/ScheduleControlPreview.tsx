import React, { useState } from 'react';
import { Calendar, Clock, Users, Plus, Search, Edit2, Trash2, Printer, FileText, X, AlertCircle } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  role: string;
  initials: string;
  colorClass: string;
  textClass: string;
  days: number;
  extras: string;
  faults: number;
}

interface Team {
  id: string;
  title: string;
  subtitle: string;
  members: Member[];
}

const initialTeams: Record<string, Team> = {
  technical: {
    id: 'technical',
    title: 'Equipe Técnica',
    subtitle: 'Som, luz e vídeo',
    members: [
      {
        id: '1',
        name: 'Aline Gomes',
        role: 'Câmera / Captura',
        initials: 'AG',
        colorClass: 'bg-blue-100',
        textClass: 'text-blue-600',
        days: 3,
        extras: '0h',
        faults: 0
      },
      {
        id: '2',
        name: 'Daniel Araújo',
        role: 'Iluminador / Montador',
        initials: 'DA',
        colorClass: 'bg-indigo-100',
        textClass: 'text-indigo-600',
        days: 3,
        extras: '0h',
        faults: 0
      }
    ]
  },
  assembly: {
    id: 'assembly',
    title: 'Equipe de Montagem',
    subtitle: 'Estrutura e palco',
    members: [
      {
        id: '3',
        name: 'Patrícia Ferreira',
        role: 'Técnica de Som',
        initials: 'PF',
        colorClass: 'bg-pink-100',
        textClass: 'text-pink-600',
        days: 3,
        extras: '0h',
        faults: 0
      },
      {
        id: '4',
        name: 'Gustavo Pereira',
        role: 'Cenotécnico',
        initials: 'GP',
        colorClass: 'bg-cyan-100',
        textClass: 'text-cyan-600',
        days: 3,
        extras: '0h',
        faults: 0
      }
    ]
  },
  service: {
    id: 'service',
    title: 'Equipe de Atendimento',
    subtitle: 'Recepção e público',
    members: [
      {
        id: '5',
        name: 'Carlos Silva',
        role: 'Coord. de Logística',
        initials: 'CS',
        colorClass: 'bg-emerald-100',
        textClass: 'text-emerald-600',
        days: 3,
        extras: '0h',
        faults: 0
      },
      {
        id: '6',
        name: 'Larissa Cunha',
        role: 'Assistente de Produção',
        initials: 'LC',
        colorClass: 'bg-purple-100',
        textClass: 'text-purple-600',
        days: 3,
        extras: '0h',
        faults: 0
      }
    ]
  }
};

const ScheduleControlPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'allocations' | 'costs' | 'faults'>('allocations');
  const [searchQuery, setSearchQuery] = useState('');
  const [teams, setTeams] = useState(initialTeams);

  const handleDeleteMember = (teamId: string, memberId: string) => {
    if (window.confirm('Tem certeza que deseja remover este membro da equipe?')) {
      setTeams(prev => ({
        ...prev,
        [teamId]: {
          ...prev[teamId],
          members: prev[teamId].members.filter(m => m.id !== memberId)
        }
      }));
    }
  };

  const handleAction = (action: string) => {
    alert(`Ação: ${action}\n(Esta é uma demonstração interativa)`);
  };

  const filterMembers = (members: Member[]) => {
    if (!searchQuery) return members;
    const lowerQuery = searchQuery.toLowerCase();
    return members.filter(m => 
      m.name.toLowerCase().includes(lowerQuery) || 
      m.role.toLowerCase().includes(lowerQuery)
    );
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden font-sans text-slate-600 text-sm transition-all duration-300">
      {/* Top Header */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-slate-900">Workshop Fotografia Profissional</h1>
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <Clock size={10} /> Planejado
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-slate-500 text-xs">Estúdio fotográfico</span>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <span>Vencimento do pagamento 12/02/2026</span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => handleAction('Folha de Pagamento')} className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors">
              <FileText size={14} /> Folha
            </button>
            <button onClick={() => handleAction('Imprimir Relatório')} className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors">
              <Printer size={14} /> Imprimir
            </button>
            <button onClick={() => handleAction('Excluir Evento')} className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-colors shadow-sm">
              <Trash2 size={14} /> Excluir
            </button>
            <button onClick={() => handleAction('Editar Evento')} className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm">
              <Edit2 size={14} /> Editar
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div className="flex items-center gap-2 mb-2 text-slate-500 text-xs font-medium">
              <Calendar size={12} /> Data de Início
            </div>
            <div className="text-slate-900 font-bold">12/02/2026</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div className="flex items-center gap-2 mb-2 text-slate-500 text-xs font-medium">
              <Calendar size={12} /> Data de Fim
            </div>
            <div className="text-slate-900 font-bold">14/02/2026</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div className="flex items-center gap-2 mb-2 text-slate-500 text-xs font-medium">
              <Users size={12} /> Pessoas
            </div>
            <div className="text-slate-900 font-bold">
              {Object.values(teams).reduce((acc, team) => acc + team.members.length, 0)}
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div className="flex items-center gap-2 mb-2 text-slate-500 text-xs font-medium">
              <Clock size={12} /> H. Extras
            </div>
            <div className="text-slate-900 font-bold">0h</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-50 border-b border-slate-200 px-6">
        <div className="flex gap-6">
          <button 
            onClick={() => setActiveTab('allocations')}
            className={`py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'allocations' ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
          >
            Alocações
          </button>
          <button 
            onClick={() => setActiveTab('costs')}
            className={`py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'costs' ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
          >
            Custos
          </button>
          <button 
            onClick={() => setActiveTab('faults')}
            className={`py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'faults' ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
          >
            Faltas
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 bg-slate-50/50 min-h-[400px]">
        
        {activeTab === 'allocations' ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800">Alocações de Pessoal</h2>
              <button onClick={() => handleAction('Adicionar Alocação')} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors shadow-sm shadow-blue-200">
                <Plus size={14} /> Adicionar Alocação
              </button>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Buscar por nome ou função..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Team Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.values(teams).map((team) => {
                const filteredMembers = filterMembers(team.members);
                
                // Se estamos buscando e não há membros filtrados nesta equipe, podemos ocultar ou mostrar vazio.
                // Vamos mostrar vazio para manter a estrutura, ou ocultar se quiser economizar espaço.
                // Aqui mantemos a estrutura.
                
                return (
                  <div key={team.id} className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                        <Users size={14} className="text-slate-400" /> {team.title}
                      </h3>
                      <div className="flex gap-1">
                        <button onClick={() => handleAction(`Adicionar em ${team.title}`)} className="text-blue-600 text-[10px] font-bold hover:underline">+ Adicionar</button>
                        <button onClick={() => handleAction(`Editar ${team.title}`)} className="text-slate-400 hover:text-slate-600"><Edit2 size={12} /></button>
                        <button onClick={() => handleAction(`Excluir ${team.title}`)} className="text-slate-400 hover:text-red-500"><Trash2 size={12} /></button>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 px-1 -mt-2">{team.subtitle}</p>

                    {filteredMembers.length === 0 && searchQuery && (
                      <div className="text-center py-4 text-slate-400 text-xs bg-slate-100/50 rounded-lg border border-dashed border-slate-200">
                        Nenhum membro encontrado.
                      </div>
                    )}

                    {filteredMembers.map(member => (
                      <div key={member.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:border-blue-300 transition-colors cursor-default group">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex gap-2 items-center">
                            <div className={`w-6 h-6 rounded-full ${member.colorClass} flex items-center justify-center ${member.textClass} text-[10px] font-bold`}>
                              {member.initials}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 text-xs">{member.name}</div>
                              <div className="text-[10px] text-slate-500">{member.role}</div>
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleAction(`Editar ${member.name}`)}><Edit2 size={10} className="text-slate-300 hover:text-blue-500" /></button>
                            <button onClick={() => handleDeleteMember(team.id, member.id)}><Trash2 size={10} className="text-slate-300 hover:text-red-500" /></button>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-1 mb-2">
                          <div className="bg-slate-50 rounded p-1 text-center">
                            <div className="text-blue-600 font-bold text-[10px]">{member.days}</div>
                            <div className="text-[9px] text-slate-400">dias</div>
                          </div>
                          <div className="bg-slate-50 rounded p-1 text-center">
                            <div className="text-orange-500 font-bold text-[10px]">{member.extras}</div>
                            <div className="text-[9px] text-slate-400">extras</div>
                          </div>
                          <div className="bg-slate-50 rounded p-1 text-center">
                            <div className="text-green-600 font-bold text-[10px]">{member.faults}</div>
                            <div className="text-[9px] text-slate-400">faltas</div>
                          </div>
                        </div>
                        <button onClick={() => handleAction(`Lançar Horas: ${member.name}`)} className="w-full py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] rounded border border-slate-100 flex items-center justify-center gap-1 transition-colors">
                          <Clock size={10} /> Lançar Horas
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-12 text-slate-400">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle size={32} className="text-slate-300" />
            </div>
            <p className="text-sm font-medium">Esta aba é apenas demonstrativa.</p>
            <p className="text-xs mt-2">No sistema completo, você veria detalhes de {activeTab === 'costs' ? 'custos financeiros' : 'controle de faltas'}.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleControlPreview;
