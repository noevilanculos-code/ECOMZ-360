import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  TrendingUp,
  Filter,
  Calendar,
  Layers,
  ArrowUpRight,
  Info,
  Flame,
  Droplets,
  TreePine,
  Wind,
  Trash2,
  Fish,
  Mountain
} from 'lucide-react';
import { Occurrence, EnvironmentalCategory } from '../types';

interface MonthlyCategoryTrendChartProps {
  occurrences: Occurrence[];
  className?: string;
}

interface MonthlyDataPoint {
  month: string;
  monthShort: string;
  desmatamento: number;
  queimadas: number;
  poluicaoHidrica: number;
  erosao: number;
  residuos: number;
  mangais: number;
  outros: number;
  total: number;
}

// 12-month historical series for Mozambique (simulated aligned with occurrences + baseline)
const HISTORICAL_MONTHLY_DATA: MonthlyDataPoint[] = [
  {
    month: 'Out 2025',
    monthShort: 'Out',
    desmatamento: 38,
    queimadas: 65, // Pico sazonal de queimadas
    poluicaoHidrica: 18,
    erosao: 12,
    residuos: 28,
    mangais: 14,
    outros: 9,
    total: 184
  },
  {
    month: 'Nov 2025',
    monthShort: 'Nov',
    desmatamento: 42,
    queimadas: 40,
    poluicaoHidrica: 22,
    erosao: 25, // Início das chuvas
    residuos: 31,
    mangais: 16,
    outros: 11,
    total: 187
  },
  {
    month: 'Dez 2025',
    monthShort: 'Dez',
    desmatamento: 46,
    queimadas: 18,
    poluicaoHidrica: 34,
    erosao: 48,
    residuos: 45,
    mangais: 20,
    outros: 15,
    total: 226
  },
  {
    month: 'Jan 2026',
    monthShort: 'Jan',
    desmatamento: 35,
    queimadas: 8,
    poluicaoHidrica: 42,
    erosao: 64, // Cheias e inundações fluviais
    residuos: 49,
    mangais: 24,
    outros: 18,
    total: 240
  },
  {
    month: 'Fev 2026',
    monthShort: 'Fev',
    desmatamento: 31,
    queimadas: 6,
    poluicaoHidrica: 48,
    erosao: 72, // Período de ciclones e chuvas torrenciais
    residuos: 52,
    mangais: 28,
    outros: 22,
    total: 259
  },
  {
    month: 'Mar 2026',
    monthShort: 'Mar',
    desmatamento: 44,
    queimadas: 12,
    poluicaoHidrica: 38,
    erosao: 55,
    residuos: 46,
    mangais: 22,
    outros: 16,
    total: 233
  },
  {
    month: 'Abr 2026',
    monthShort: 'Abr',
    desmatamento: 52,
    queimadas: 24,
    poluicaoHidrica: 30,
    erosao: 38,
    residuos: 39,
    mangais: 19,
    outros: 14,
    total: 216
  },
  {
    month: 'Mai 2026',
    monthShort: 'Mai',
    desmatamento: 58,
    queimadas: 36,
    poluicaoHidrica: 26,
    erosao: 22,
    residuos: 35,
    mangais: 17,
    outros: 12,
    total: 206
  },
  {
    month: 'Jun 2026',
    monthShort: 'Jun',
    desmatamento: 64,
    queimadas: 52,
    poluicaoHidrica: 21,
    erosao: 16,
    residuos: 32,
    mangais: 15,
    outros: 13,
    total: 213
  },
  {
    month: 'Jul 2026',
    monthShort: 'Jul',
    desmatamento: 70,
    queimadas: 68,
    poluicaoHidrica: 19,
    erosao: 14,
    residuos: 30,
    mangais: 16,
    outros: 15,
    total: 232
  },
  {
    month: 'Ago 2026',
    monthShort: 'Ago',
    desmatamento: 75,
    queimadas: 84, // Pico da época seca e queimadas itinerantes
    poluicaoHidrica: 24,
    erosao: 11,
    residuos: 34,
    mangais: 18,
    outros: 17,
    total: 263
  },
  {
    month: 'Set 2026',
    monthShort: 'Set',
    desmatamento: 68,
    queimadas: 76,
    poluicaoHidrica: 28,
    erosao: 18,
    residuos: 38,
    mangais: 21,
    outros: 19,
    total: 268
  }
];

const CATEGORY_SERIES = [
  {
    key: 'desmatamento',
    name: 'Desmatamento',
    color: '#059669', // Emerald 600
    fill: '#10b981',
    icon: TreePine
  },
  {
    key: 'queimadas',
    name: 'Queimadas Descontroladas',
    color: '#ea580c', // Orange 600
    fill: '#f97316',
    icon: Flame
  },
  {
    key: 'poluicaoHidrica',
    name: 'Poluição Hídrica / Rios',
    color: '#0284c7', // Sky 600
    fill: '#38bdf8',
    icon: Droplets
  },
  {
    key: 'erosao',
    name: 'Erosão & Inundações / Cheias',
    color: '#e11d48', // Rose 600
    fill: '#fb7185',
    icon: Wind
  },
  {
    key: 'residuos',
    name: 'Resíduos Sólidos Urbanos',
    color: '#d97706', // Amber 600
    fill: '#f59e0b',
    icon: Trash2
  },
  {
    key: 'mangais',
    name: 'Destruição de Mangais',
    color: '#0d9488', // Teal 600
    fill: '#2dd4bf',
    icon: Fish
  }
];

export const MonthlyCategoryTrendChart: React.FC<MonthlyCategoryTrendChartProps> = ({
  occurrences,
  className = ''
}) => {
  const [selectedRange, setSelectedRange] = useState<'6m' | '12m'>('12m');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [chartType, setChartType] = useState<'stacked' | 'lines'>('stacked');

  const filteredData = useMemo(() => {
    const sliceCount = selectedRange === '6m' ? 6 : 12;
    return HISTORICAL_MONTHLY_DATA.slice(-sliceCount);
  }, [selectedRange]);

  const totalDenunciasPeriodo = useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + curr.total, 0);
  }, [filteredData]);

  const mediaMensal = useMemo(() => {
    return Math.round(totalDenunciasPeriodo / filteredData.length);
  }, [totalDenunciasPeriodo, filteredData.length]);

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-5 transition-colors ${className}`}
    >
      {/* Header with Title, Stats & Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Tendências Temporais Recharts • Observatório Moçambique</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
            Evolução Mensal de Denúncias e Ocorrências por Categoria
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl mt-0.5">
            Monitorização histórica das queixas ambientais submetidas por cidadãos e fiscais territoriais. Permite antecipar picos sazonais de queimadas na seca e episódios de cheias/erosão no verão.
          </p>
        </div>

        {/* Quick KPI badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Total no Período
            </span>
            <span className="text-base font-black text-slate-900 dark:text-white">
              {totalDenunciasPeriodo.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold ml-1">
              denúncias
            </span>
          </div>

          <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Média Mensal
            </span>
            <span className="text-base font-black text-slate-900 dark:text-white">
              {mediaMensal}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold ml-1">/mês</span>
          </div>

          {/* Timeframe & Display switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setSelectedRange('6m')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                selectedRange === '6m'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Últimos 6M
            </button>
            <button
              type="button"
              onClick={() => setSelectedRange('12m')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                selectedRange === '12m'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              12 Meses
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Filtro Rápido:</span>
        </span>

        <button
          type="button"
          onClick={() => setActiveCategoryFilter('all')}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeCategoryFilter === 'all'
              ? 'bg-[#062B3D] text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          Todas as Categorias
        </button>

        {CATEGORY_SERIES.map((cat) => {
          const isSelected = activeCategoryFilter === cat.key;
          const Icon = cat.icon;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategoryFilter(isSelected ? 'all' : cat.key)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'text-white shadow-xs ring-2 ring-offset-1'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
              style={{
                backgroundColor: isSelected ? cat.color : undefined,
                borderColor: isSelected ? cat.color : undefined
              }}
            >
              <Icon className="w-3 h-3" />
              <span>{cat.name.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Main Recharts Area Chart */}
      <div className="h-72 sm:h-80 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={filteredData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              {CATEGORY_SERIES.map((cat) => (
                <linearGradient
                  key={cat.key}
                  id={`gradient-${cat.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={cat.fill} stopOpacity={0.7} />
                  <stop offset="95%" stopColor={cat.fill} stopOpacity={0.05} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#94a3b8"
              opacity={0.2}
            />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const totalMonth = payload.reduce(
                  (sum, item) => sum + (Number(item.value) || 0),
                  0
                );
                return (
                  <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 text-xs min-w-[220px]">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                      <span className="font-black text-emerald-400">{label}</span>
                      <span className="text-[11px] font-mono text-slate-300">
                        Total: <strong>{totalMonth}</strong>
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {payload.map((entry, idx) => (
                        <div
                          key={`tooltip-${idx}`}
                          className="flex items-center justify-between text-[11px]"
                        >
                          <div className="flex items-center space-x-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-slate-300">{entry.name}:</span>
                          </div>
                          <span className="font-bold text-white">{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }}
            />

            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
            />

            {CATEGORY_SERIES.filter(
              (cat) => activeCategoryFilter === 'all' || activeCategoryFilter === cat.key
            ).map((cat) => (
              <Area
                key={cat.key}
                type="monotone"
                dataKey={cat.key}
                name={cat.name}
                stroke={cat.color}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={`url(#gradient-${cat.key})`}
                stackId={chartType === 'stacked' && activeCategoryFilter === 'all' ? '1' : undefined}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Climate & Environmental Insight Summary Card */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2.5 text-slate-700 dark:text-slate-300">
          <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            <strong>Padrão Sazonal Identificado:</strong> O pico de queimadas e corte de miombo concentra-se entre <strong>Julho e Outubro</strong> (estação seca). As denúncias de erosão, inundações fluviais e contaminação hídrica atingem o máximo em <strong>Dezembro a Março</strong> (estação das chuvas e ciclones).
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-slate-500 font-mono">Fonte: ECO-MZ 360 Analytics</span>
        </div>
      </div>
    </div>
  );
};
