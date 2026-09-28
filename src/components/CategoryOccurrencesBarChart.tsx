import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import {
  BarChart3,
  Layers,
  Flame,
  AlertTriangle,
  TrendingUp,
  Filter,
  CheckCircle2,
  PieChart as PieIcon,
  ShieldAlert
} from 'lucide-react';
import { Occurrence, EnvironmentalCategory, MozambiqueProvince } from '../types';
import { MOZAMBIQUE_PROVINCES } from '../data/mockData';

interface CategoryOccurrencesBarChartProps {
  occurrences: Occurrence[];
  selectedProvince?: MozambiqueProvince | 'Todas';
  onSelectProvince?: (province: MozambiqueProvince | 'Todas') => void;
  onSelectCategory?: (category: EnvironmentalCategory) => void;
  className?: string;
  compact?: boolean;
}

// Category palette mapped to official platform color standards
export const CATEGORY_COLORS: Record<EnvironmentalCategory, string> = {
  'Desmatamento': '#059669', // Emerald
  'Queimadas Descontroladas': '#ea580c', // Orange-Red
  'Poluição Hídrica': '#0284c7', // Ocean Blue
  'Destruição de Mangais': '#0d9488', // Teal
  'Resíduos Sólidos Urbanos': '#d97706', // Amber
  'Erosão Costeira/Pluvial': '#7c3aed', // Purple
  'Caça Furtiva & Biodiversidade': '#e11d48', // Crimson Rose
  'Mineração Ilegal': '#475569' // Slate
};

const ALL_CATEGORIES: EnvironmentalCategory[] = [
  'Desmatamento',
  'Queimadas Descontroladas',
  'Poluição Hídrica',
  'Destruição de Mangais',
  'Resíduos Sólidos Urbanos',
  'Erosão Costeira/Pluvial',
  'Caça Furtiva & Biodiversidade',
  'Mineração Ilegal'
];

export const CategoryOccurrencesBarChart: React.FC<CategoryOccurrencesBarChartProps> = ({
  occurrences,
  selectedProvince = 'Todas',
  onSelectProvince,
  onSelectCategory,
  className = '',
  compact = false
}) => {
  const [internalProvince, setInternalProvince] = useState<MozambiqueProvince | 'Todas'>(selectedProvince);
  const [viewMode, setViewMode] = useState<'total' | 'severity' | 'status'>('total');
  const [sortOrder, setSortOrder] = useState<'desc' | 'name'>('desc');
  const [activeCategoryHighlight, setActiveCategoryHighlight] = useState<string | null>(null);

  // Sync internal province if prop changes
  const activeProvince = onSelectProvince ? selectedProvince : internalProvince;
  const handleProvinceChange = (prov: MozambiqueProvince | 'Todas') => {
    if (onSelectProvince) {
      onSelectProvince(prov);
    } else {
      setInternalProvince(prov);
    }
  };

  // Filter occurrences according to selected province
  const filteredData = useMemo(() => {
    if (activeProvince === 'Todas') return occurrences;
    return occurrences.filter((occ) => occ.province === activeProvince);
  }, [occurrences, activeProvince]);

  // Aggregate metrics per category
  const chartData = useMemo(() => {
    const totalOccurrences = filteredData.length || 1;

    const data = ALL_CATEGORIES.map((category) => {
      const catOccurrences = filteredData.filter((o) => o.category === category);
      const total = catOccurrences.length;
      const critical = catOccurrences.filter((o) => o.severity === 'Crítico').length;
      const high = catOccurrences.filter((o) => o.severity === 'Alto').length;
      const medium = catOccurrences.filter((o) => o.severity === 'Médio').length;
      const low = catOccurrences.filter((o) => o.severity === 'Baixo').length;

      const resolved = catOccurrences.filter((o) => o.status === 'Resolvido').length;
      const inIntervention = catOccurrences.filter((o) => o.status === 'Em Intervenção').length;
      const pending = catOccurrences.filter(
        (o) => o.status === 'Recebido' || o.status === 'Em Validação' || o.status === 'Validado'
      ).length;

      const percentage = Math.round((total / totalOccurrences) * 100);

      // Short label for narrow displays
      const shortName =
        category === 'Queimadas Descontroladas'
          ? 'Queimadas'
          : category === 'Resíduos Sólidos Urbanos'
          ? 'Resíduos'
          : category === 'Destruição de Mangais'
          ? 'Mangais'
          : category === 'Caça Furtiva & Biodiversidade'
          ? 'Biodiversidade'
          : category === 'Erosão Costeira/Pluvial'
          ? 'Erosão'
          : category;

      return {
        category,
        shortName,
        total,
        percentage,
        critical,
        high,
        criticalOrHigh: critical + high,
        mediumOrLow: medium + low,
        resolved,
        inIntervention,
        activeActions: resolved + inIntervention,
        pending,
        color: CATEGORY_COLORS[category] || '#059669'
      };
    });

    if (sortOrder === 'desc') {
      return [...data].sort((a, b) => b.total - a.total);
    }
    return [...data].sort((a, b) => a.category.localeCompare(b.category));
  }, [filteredData, sortOrder]);

  // Overall key metrics
  const topCategory = useMemo(() => {
    return [...chartData].sort((a, b) => b.total - a.total)[0];
  }, [chartData]);

  const totalCriticalIncidents = useMemo(() => {
    return filteredData.filter((o) => o.severity === 'Crítico').length;
  }, [filteredData]);

  const activeInterventionRate = useMemo(() => {
    if (!filteredData.length) return 0;
    const active = filteredData.filter(
      (o) => o.status === 'Resolvido' || o.status === 'Em Intervenção'
    ).length;
    return Math.round((active / filteredData.length) * 100);
  }, [filteredData]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;

    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl p-3.5 max-w-[260px] text-xs">
        <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: data.color }}
          />
          <h4 className="font-bold text-slate-900 dark:text-white leading-tight">
            {data.category}
          </h4>
        </div>

        <div className="mt-2.5 space-y-1.5 text-slate-600 dark:text-slate-300">
          <div className="flex justify-between items-center">
            <span>Total Ocorrências:</span>
            <span className="font-extrabold text-slate-900 dark:text-white text-sm">
              {data.total} ({data.percentage}%)
            </span>
          </div>

          <div className="flex justify-between items-center text-rose-600 dark:text-rose-400 font-semibold">
            <span>Crítico / Alto Risco:</span>
            <span>{data.criticalOrHigh}</span>
          </div>

          <div className="flex justify-between items-center text-amber-600 dark:text-amber-400">
            <span>Médio / Baixo Risco:</span>
            <span>{data.mediumOrLow}</span>
          </div>

          <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-medium">
            <span>Intervenção / Resolvido:</span>
            <span>{data.activeActions}</span>
          </div>
        </div>

        {onSelectCategory && (
          <p className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 italic">
            Clique na barra para filtrar no mapa
          </p>
        )}
      </div>
    );
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden ${className}`}
    >
      {/* Header with Title and Mode Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  Ocorrências por Tipo de Problema
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Panorama Nacional
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Distribuição comparativa de incidências ecológicas em {activeProvince === 'Todas' ? 'Moçambique (Nacional)' : `Província de ${activeProvince}`}
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Province Filter */}
          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={activeProvince}
              onChange={(e) => handleProvinceChange(e.target.value as MozambiqueProvince | 'Todas')}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-xl px-2.5 py-1.5 font-medium focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
              aria-label="Selecionar Província"
            >
              <option value="Todas">Nacional (Todas as Províncias)</option>
              {Object.keys(MOZAMBIQUE_PROVINCES).map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Switcher */}
          <div className="bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl flex items-center border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('total')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'total'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Total
            </button>
            <button
              onClick={() => setViewMode('severity')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'severity'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Por Gravidade
            </button>
            <button
              onClick={() => setViewMode('status')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'status'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Intervenção
            </button>
          </div>

          {/* Sort order toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'name' : 'desc')}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-xs font-semibold"
            title={sortOrder === 'desc' ? 'Ordenar por nome' : 'Ordenar por quantidade'}
          >
            {sortOrder === 'desc' ? 'Qtde ↓' : 'A-Z ↑'}
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-5 bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Ocorrências no Filtro
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {filteredData.length}
            </span>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              Registos
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Categoria Mais Frequente
          </span>
          <div className="flex items-baseline space-x-1.5 mt-1 truncate">
            <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
              {topCategory?.shortName || 'N/A'}
            </span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 shrink-0">
              ({topCategory?.total || 0})
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-rose-500 dark:text-rose-400 uppercase tracking-wider block flex items-center gap-1">
            <Flame className="w-3 h-3" />
            Nível Crítico
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">
              {totalCriticalIncidents}
            </span>
            <span className="text-[11px] font-bold text-rose-500">
              Urgência Máxima
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-500 dark:text-emerald-400 uppercase tracking-wider block flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Taxa de Atendimento
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {activeInterventionRate}%
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              Em Ação
            </span>
          </div>
        </div>
      </div>

      {/* Main Recharts Bar Chart Container */}
      <div className="p-4 sm:p-5">
        <div className="w-full h-72 sm:h-80 md:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 20, left: -10, bottom: 40 }}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload.length) {
                  const clickedCategory = e.activePayload[0].payload.category;
                  setActiveCategoryHighlight(clickedCategory);
                  if (onSelectCategory) {
                    onSelectCategory(clickedCategory);
                  }
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
              
              <XAxis
                dataKey="shortName"
                tick={{ fontSize: 11, fill: '#64748b' }}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={55}
              />
              
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              {viewMode === 'total' && (
                <Bar
                  dataKey="total"
                  name="Total de Ocorrências"
                  radius={[8, 8, 0, 0]}
                  animationDuration={900}
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={`cell-${entry.category}`}
                      fill={entry.color}
                      opacity={activeCategoryHighlight && activeCategoryHighlight !== entry.category ? 0.45 : 1}
                      className="cursor-pointer transition-opacity"
                    />
                  ))}
                </Bar>
              )}

              {viewMode === 'severity' && (
                <>
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: 12, fontSize: 11 }}
                  />
                  <Bar
                    dataKey="criticalOrHigh"
                    name="Crítico & Alto"
                    fill="#e11d48"
                    stackId="severity"
                    radius={[0, 0, 0, 0]}
                    animationDuration={900}
                  />
                  <Bar
                    dataKey="mediumOrLow"
                    name="Médio & Baixo"
                    fill="#0ea5e9"
                    stackId="severity"
                    radius={[8, 8, 0, 0]}
                    animationDuration={900}
                  />
                </>
              )}

              {viewMode === 'status' && (
                <>
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: 12, fontSize: 11 }}
                  />
                  <Bar
                    dataKey="activeActions"
                    name="Intervenção / Resolvido"
                    fill="#10b981"
                    stackId="status"
                    radius={[0, 0, 0, 0]}
                    animationDuration={900}
                  />
                  <Bar
                    dataKey="pending"
                    name="Recebido / Validação"
                    fill="#f59e0b"
                    stackId="status"
                    radius={[8, 8, 0, 0]}
                    animationDuration={900}
                  />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend / Category Tags with Counts */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {chartData.map((item) => (
              <button
                key={item.category}
                onClick={() => {
                  const next = activeCategoryHighlight === item.category ? null : item.category;
                  setActiveCategoryHighlight(next);
                  if (onSelectCategory) {
                    onSelectCategory(item.category);
                  }
                }}
                className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeCategoryHighlight === item.category
                    ? 'ring-2 ring-emerald-500 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate max-w-[130px]">{item.shortName}</span>
                <span className="font-extrabold text-[11px] px-1 rounded bg-slate-200/70 dark:bg-slate-700 text-slate-800 dark:text-slate-200 ml-0.5">
                  {item.total}
                </span>
              </button>
            ))}
          </div>

          {activeCategoryHighlight && (
            <button
              onClick={() => setActiveCategoryHighlight(null)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline cursor-pointer"
            >
              Limpar Filtro
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
