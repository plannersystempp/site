import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DollarSign, Users, TrendingUp, Package, Calendar } from 'lucide-react';

const FinancialPreview: React.FC = () => {
  const events = [
    { name: 'Feira de Neg...', value: 8500, type: 'cache' },
    { name: 'Workshop Lid...', value: 12800, type: 'cache' },
    { name: 'Noite Eletrô...', value: 6500, type: 'cache' },
    { name: 'Festival Gas...', value: 8500, type: 'cache' },
    { name: 'Convenção An...', value: 9000, type: 'cache' },
    { name: 'Loja do Meie...', value: 0, type: 'cache' },
    { name: 'Casamento An...', value: 3000, type: 'cache' },
    { name: 'Show MPB - A...', value: 2800, type: 'cache' },
    { name: 'Lançamento P...', value: 2900, type: 'cache' },
    { name: 'Aniversário ...', value: 2000, type: 'cache' },
    { name: 'Festival de ...', value: 6000, type: 'cache' },
    { name: 'Feira Artesa...', value: 9500, type: 'cache' },
    { name: 'Baile de Gal...', value: 2200, type: 'cache' },
    { name: 'Seminário Es...', value: 6500, type: 'cache' },
    { name: 'Stand Up Com...', value: 2500, type: 'cache' },
    { name: 'Exposição Ar...', value: 9800, type: 'cache' },
    { name: 'Corrida Bene...', value: 2800, type: 'cache' },
    { name: 'Festival Mús...', value: 8500, type: 'cache' },
    { name: 'Palestra Mot...', value: 1900, type: 'cache' },
    { name: 'Jantar Dança...', value: 1900, type: 'cache' },
    { name: 'Workshop Fot...', value: 8500, type: 'cache' },
  ];

  const maxVal = useMemo(() => Math.max(14000, ...events.map(e => e.value)), [events]);
  const yTicks = useMemo(() => {
    const step = Math.round(maxVal / 4 / 100) * 100;
    return [0, step, step * 2, step * 3, step * 4];
  }, [maxVal]);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(900);
  const [containerHeight, setContainerHeight] = useState(280);

  useEffect(() => {
    const measure = () => {
      const el = chartContainerRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        setContainerWidth(Math.max(320, Math.floor(rect.width)));
        setContainerHeight(Math.max(220, Math.floor(rect.height)));
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const idealWidth = Math.max(containerWidth, events.length * 50 + 120);
  const chartHeight = containerHeight;
  const margin = { top: 20, right: 20, bottom: 70, left: 60 };
  const innerWidth = idealWidth - margin.left - margin.right;
  const innerHeight = chartHeight - margin.top - margin.bottom;

  return (
    <div className="w-full h-full bg-slate-50 rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col p-4 md:p-6 gap-6">
      
      {/* Top Cards */}
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        {[
          { label: 'Total', icon: <DollarSign className="w-3.5 h-3.5 text-green-600" />, color: 'text-green-600', value: '113.960,00', currency: true },
          { label: 'Cachês', icon: <Users className="w-3.5 h-3.5 text-blue-600" />, color: 'text-blue-600', value: '113.960,00', currency: true },
          { label: 'Eventos', icon: <Calendar className="w-3.5 h-3.5 text-purple-600" />, color: 'text-purple-600', value: '21', currency: false },
        ].map((c, i) => (
          <div key={i} className="bg-white p-2.5 md:p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center min-w-0 h-full">
            <div className="flex items-center gap-1.5 mb-1.5 w-full">
              <div className="shrink-0">{c.icon}</div>
              <span className="font-semibold text-slate-700 text-[10px] md:text-xs leading-tight">{c.label}</span>
            </div>
            <div className="flex flex-col">
              {c.currency && (
                <span className={`font-bold ${c.color} text-[10px] md:text-[11px] leading-none mb-0.5`}>R$</span>
              )}
              <span className={`font-bold ${c.color} text-sm md:text-base leading-none tracking-tight`}>{c.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart Section */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
        <div className="mb-6">
          <h3 className="text-base font-bold text-slate-800">Análise por Evento</h3>
          <p className="text-sm text-slate-500">Visualizando 21 eventos no período selecionado</p>
        </div>
        <div ref={chartContainerRef} className="flex-1 relative h-64 md:h-80 overflow-x-auto no-scrollbar">
          <svg width={idealWidth} height={chartHeight} className="block">
            <defs>
              <linearGradient id="barBlue" x1="0" x2="0" y1="1" y2="0">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#60a5fa" />
              </linearGradient>
            </defs>

            <g transform={`translate(${margin.left},${margin.top})`}>
              <rect x={0} y={0} width={innerWidth} height={innerHeight} fill="#ffffff" stroke="#e5e7eb" />

              {yTicks.map((v, i) => {
                const y = innerHeight - (v / maxVal) * innerHeight;
                return (
                  <g key={i}>
                    <line x1={0} y1={y} x2={innerWidth} y2={y} stroke="#eef2f7" strokeDasharray="4 4" />
                    <text x={-8} y={y + 4} fontSize={10} fill="#64748b" textAnchor="end">
                      {`R$ ${v.toLocaleString('pt-BR')}`}
                    </text>
                  </g>
                );
              })}

              {events.map((e, i) => {
                const band = innerWidth / events.length;
                const bw = Math.max(18, band - 12);
                const x = i * band + (band - bw) / 2;
                const h = (e.value / maxVal) * innerHeight;
                const y = innerHeight - h;
                return (
                  <g key={i}>
                    <title>{`R$ ${e.value.toLocaleString('pt-BR')}`}</title>
                    <rect x={x} y={y} width={bw} height={h} fill="url(#barBlue)" rx={2} />
                    <text
                      x={x + bw / 2}
                      y={innerHeight + 16}
                      fontSize={9}
                      fill="#64748b"
                      transform={`rotate(-45 ${x + bw / 2} ${innerHeight + 16})`}
                      textAnchor="end"
                    >
                      {e.name}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        <div className="mt-6 md:mt-8 flex justify-center gap-6">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                <span className="text-xs text-slate-600">Cachês</span>
            </div>
        </div>

      </div>
    </div>
  );
};

export default FinancialPreview;
