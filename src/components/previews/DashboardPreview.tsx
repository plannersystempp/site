import React from 'react'

const DashboardPreview: React.FC = () => {
  return (
    <div className="w-full h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="h-8 bg-white border-b border-slate-200 flex items-center px-4 justify-between">
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          <div className="w-2 h-2 rounded-full bg-green-400" />
        </div>
        <div className="text-[10px] text-slate-400">Plano Enterprise</div>
      </div>

      <div className="flex-1 p-3 sm:p-4 md:p-5 grid grid-rows-[auto_auto_1fr_auto] gap-3 md:gap-4">
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <div className="text-slate-900 font-bold text-sm md:text-base">Dashboard</div>
          <div className="text-xs text-slate-500">Equipe: DEMO - Sistema Complete PlannerSystem</div>
        </div>

        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <div className="text-[11px] text-slate-500 font-bold uppercase mb-2">Ações Rápidas</div>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600 border border-red-200">Hora Extra</span>
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">Eventos</span>
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-700 border border-violet-200">Pessoal</span>
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">Folha</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
          <div className="rounded-lg border border-slate-200 p-3 bg-white">
            <div className="text-[11px] text-slate-500 flex items-center justify-between">EM ANDAMENTO</div>
            <div className="text-2xl md:text-3xl font-bold text-amber-500 mt-2">3</div>
          </div>
          <div className="rounded-lg border border-slate-200 p-3 bg-white">
            <div className="text-[11px] text-slate-500">MÉDIA SEMANAL</div>
            <div className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">1.5</div>
          </div>
          <div className="rounded-lg border border-slate-200 p-3 bg-white">
            <div className="text-[11px] text-slate-500">MÉDIA MENSAL</div>
            <div className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">4.3</div>
          </div>
          <div className="rounded-lg border border-slate-200 p-3 bg-white">
            <div className="text-[11px] text-slate-500">MÉDIA ANUAL</div>
            <div className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">13</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <div className="rounded-lg border border-slate-200 p-3 bg-white">
            <div className="text-[11px] text-slate-500 mb-2">Status</div>
            <div className="w-full flex items-center justify-center">
              <div
                className="w-28 h-28 rounded-full"
                style={{
                  background:
                    'conic-gradient(#22c55e 0 35%, #f59e0b 35% 65%, #3b82f6 65% 100%)',
                }}
              />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-3 bg-white">
            <div className="text-[11px] text-slate-500 mb-2">Evolução de Eventos</div>
            <svg viewBox="0 0 200 100" className="w-full h-28">
              <defs>
                <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0 80 L30 60 L60 65 L90 50 L120 70 L150 40 L180 60 L200 30" fill="none" stroke="#3b82f6" strokeWidth="3" />
              <polygon points="0,80 0,100 200,100 200,30" fill="url(#grad)" />
            </svg>
            <div className="flex justify-between text-[10px] text-slate-400 px-1">
              <span>ago/23</span><span>set/23</span><span>out/23</span><span>nov/23</span><span>dez/23</span><span>jan/23</span>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-3 bg-white">
            <div className="text-[11px] text-slate-500 mb-2">Custos (Top 5)</div>
            <div className="h-28 bg-slate-50 rounded border border-slate-100" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <div className="rounded-lg border border-slate-200 p-3 bg-white">
            <div className="text-[11px] text-slate-500">TOTAL EVENTOS</div>
            <div className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">26</div>
          </div>
          <div className="rounded-lg border border-slate-200 p-3 bg-white">
            <div className="text-[11px] text-slate-500">PESSOAL</div>
            <div className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">30</div>
          </div>
          <div className="rounded-lg border border-slate-200 p-3 bg-white">
            <div className="text-[11px] text-slate-500">FUNÇÕES</div>
            <div className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">24</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPreview

