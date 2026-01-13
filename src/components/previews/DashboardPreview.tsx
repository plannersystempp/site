import React from 'react'
import { Info, Clock, Calendar, PieChart, BarChart3 } from 'lucide-react'

const DashboardPreview: React.FC = () => {
  return (
    <div className="w-full h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 md:p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-5 h-5 rounded-full border border-amber-300 bg-amber-50">
            <Info className="w-3 h-3 text-amber-600" />
          </div>
          <span className="text-sm font-medium text-slate-800">Atividade</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="text-[11px] uppercase tracking-wide text-slate-600 flex items-center justify-between">
              EM ANDAMENTO
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-amber-300">
                <Info className="w-3 h-3 text-amber-600" />
              </span>
            </div>
            <div className="mt-3 text-3xl font-bold text-amber-600">3</div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-4">
            <div className="text-[11px] uppercase tracking-wide text-slate-600 flex items-center gap-1">
              MÉDIA SEMANAL
              <Clock className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="mt-3 text-3xl font-bold text-slate-900">1.5</div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-4">
            <div className="text-[11px] uppercase tracking-wide text-slate-600 flex items-center gap-1">
              MÉDIA MENSAL
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="mt-3 text-3xl font-bold text-slate-900">4.3</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-slate-700">
              <PieChart className="w-4 h-4 text-slate-600" />
              <span className="text-[13px] font-medium">Status</span>
            </div>
            <div className="mt-1 text-xs text-slate-500">Distribuição atual</div>
            <div className="mt-3 flex items-center justify-center">
              <div className="relative w-32 h-32 rounded-full"
                   style={{
                     background:
                       'conic-gradient(#16a34a 0 28%, #f59e0b 28% 42%, #86efac 42% 62%, #64748b 62% 82%, #cbd5e1 82% 100%)'
                   }}>
                <div className="absolute inset-4 rounded-full bg-white border border-slate-100" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-slate-700">
              <BarChart3 className="w-4 h-4 text-slate-600" />
              <span className="text-[13px] font-medium">Evolução de Eventos</span>
            </div>
            <div className="mt-1 text-xs text-slate-500">Últimos 6 meses</div>
            <div className="mt-3">
              <svg viewBox="0 0 320 160" className="w-full h-40">
                <defs>
                  <linearGradient id="areaBlue" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <rect x="48" y="16" width="256" height="120" fill="none" stroke="#e5e9ef" />
                <g stroke="#e5e9ef">
                  <line x1="48" y1="136" x2="304" y2="136" />
                  <line x1="48" y1="112" x2="304" y2="112" />
                  <line x1="48" y1="88" x2="304" y2="88" />
                  <line x1="48" y1="64" x2="304" y2="64" />
                  <line x1="48" y1="40" x2="304" y2="40" />
                </g>
                <g fill="#94a3b8" fontSize="10">
                  <text x="24" y="138">0</text>
                  <text x="24" y="114">3</text>
                  <text x="24" y="90">6</text>
                  <text x="24" y="66">9</text>
                  <text x="20" y="42">12</text>
                </g>
                <path d="M48 136 L80 134 L112 132 L144 130 L176 128 L208 124 L240 110 L272 78 L304 40"
                      fill="none" stroke="#3b82f6" strokeWidth="3" />
                <polygon points="48,136 48,136 304,136 304,40" fill="url(#areaBlue)" />
              </svg>
              <div className="mt-1 flex justify-between text-[11px] text-slate-500 px-2">
                <span>ago/25</span>
                <span>set/25</span>
                <span>out/25</span>
                <span>nov/25</span>
                <span>dez/25</span>
                <span>jan/26</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPreview
